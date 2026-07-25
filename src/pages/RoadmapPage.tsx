import { useEffect, useState } from 'react';
import { Map, Flag, Clock, Link2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AIStreamView, useAIStream } from '@/components/AIStreamView';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { generateRoadmap } from '@/lib/ai-engine';
import type { RoadmapResult, Project } from '@/types';

export function RoadmapPage() {
  const { user } = useAuth();
  const stream = useAIStream();
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProjects(data as Project[]); });
  }, [user]);

  const runGeneration = async () => {
    const proj = projects.find((p) => p.id === selectedProject);
    if (!proj) { stream.setError('Select a project first.'); return; }

    stream.reset();
    stream.setLoading(true);
    stream.setError(null);

    try {
      const res = await generateRoadmap(proj, (chunk) => stream.setStreamedText((prev) => prev + chunk));
      setResult(res);
      stream.setHasResult(true);

      if (user) {
        await supabase.from('ai_outputs').insert({
          user_id: user.id,
          project_id: proj.id,
          module_type: 'roadmap',
          input_payload: { project: proj } as unknown as Record<string, unknown>,
          output_payload: res as unknown as Record<string, unknown>,
        });
      }
    } catch {
      stream.setError('Failed to generate roadmap. Please try again.');
    } finally {
      stream.setLoading(false);
    }
  };

  const phases = [...new Set(result?.milestones.map((m) => m.phase) ?? [])];

  return (
    <AIStreamView
      title="Roadmap Generator"
      description="AI-generated execution timeline with milestones"
      icon={<Map className="h-6 w-6 text-primary-500" />}
      loading={stream.loading}
      error={stream.error}
      streamedText={stream.streamedText}
      hasResult={stream.hasResult}
      onRegenerate={runGeneration}
      onTrigger={runGeneration}
      triggerLabel="Generate Roadmap"
      triggerView={
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Select project</label>
          {projects.length === 0 ? (
            <p className="text-sm text-warning-500">No projects yet. Create one via the Project Validator first.</p>
          ) : (
            <select className="input-field" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
              <option value="">Choose a project...</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          )}
        </div>
      }
      resultView={
        <div className="space-y-6 animate-fade-in">
          {phases.map((phase) => (
            <div key={phase}>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
                  {phase}
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Phase {phase}
                </h3>
              </div>
              <div className="relative ml-3.5 space-y-3 border-l-2 pl-6" style={{ borderColor: 'var(--border)' }}>
                {result?.milestones.filter((m) => m.phase === phase).map((m, i) => (
                  <Card key={i}>
                    <CardBody>
                      <div className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-4 bg-primary-500" style={{ borderColor: 'var(--bg-primary)' }} />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{m.title}</h4>
                          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{m.description}</p>
                        </div>
                        <Badge variant="accent"><Clock className="h-3 w-3" /> {m.effort}</Badge>
                      </div>
                      {m.dependencies.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <Link2 className="h-3.5 w-3.5" style={{ color: 'var(--text-tertiary)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            Depends on: {m.dependencies.join(', ')}
                          </span>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={runGeneration}>Regenerate</Button>
          </div>
        </div>
      }
    />
  );
}
