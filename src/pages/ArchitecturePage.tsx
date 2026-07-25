import { useEffect, useState } from 'react';
import { Layers, Monitor, Server, Database, Cloud, GitBranch } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AIStreamView, useAIStream } from '@/components/AIStreamView';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { generateArchitecture } from '@/lib/ai-engine';
import type { ArchitectureResult, Project } from '@/types';

export function ArchitecturePage() {
  const { user } = useAuth();
  const stream = useAIStream();
  const [result, setResult] = useState<ArchitectureResult | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProjects(data as Project[]); });
  }, [user]);

  const runGeneration = async () => {
    const proj = projects.find((p) => p.id === selectedProject);
    if (!proj) {
      stream.setError('Select a project first. Create one via the Project Validator.');
      return;
    }

    stream.reset();
    stream.setLoading(true);
    stream.setError(null);

    try {
      const res = await generateArchitecture(proj, (chunk) => stream.setStreamedText((prev) => prev + chunk));
      setResult(res);
      stream.setHasResult(true);

      if (user) {
        await supabase.from('ai_outputs').insert({
          user_id: user.id,
          project_id: proj.id,
          module_type: 'architecture',
          input_payload: { project: proj } as unknown as Record<string, unknown>,
          output_payload: res as unknown as Record<string, unknown>,
        });
      }
    } catch {
      stream.setError('Failed to generate architecture. Please try again.');
    } finally {
      stream.setLoading(false);
    }
  };

  return (
    <AIStreamView
      title="Architecture Generator"
      description="Generate a full system architecture recommendation"
      icon={<Layers className="h-6 w-6 text-warning-500" />}
      loading={stream.loading}
      error={stream.error}
      streamedText={stream.streamedText}
      hasResult={stream.hasResult}
      onRegenerate={runGeneration}
      onTrigger={runGeneration}
      triggerLabel="Generate Architecture"
      triggerView={
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Select project</label>
          {projects.length === 0 ? (
            <p className="text-sm text-warning-500">No projects yet. Create one via the Project Validator first.</p>
          ) : (
            <select
              className="input-field"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Choose a project...</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          )}
        </div>
      }
      resultView={
        <div className="space-y-4 animate-fade-in">
          {/* Diagram */}
          {result?.diagram && (
            <Card>
              <CardHeader><CardTitle>Architecture Diagram</CardTitle></CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {result.diagram.map((layer) => (
                    <div key={layer.layer} className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                      <GitBranch className="h-5 w-5 text-primary-500 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{layer.layer}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {layer.components.map((c) => (
                            <span key={c} className="rounded bg-primary-500/10 px-2 py-0.5 text-xs text-primary-500">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Sections */}
          <SectionCard icon={<Monitor className="h-5 w-5 text-primary-500" />} title="Frontend" content={result?.frontend} />
          <SectionCard icon={<Server className="h-5 w-5 text-accent-500" />} title="Backend" content={result?.backend} />
          <SectionCard icon={<Database className="h-5 w-5 text-success-500" />} title="Database" content={result?.database} />
          <SectionCard icon={<Cloud className="h-5 w-5 text-warning-500" />} title="Deployment" content={result?.deployment} />

          <div className="flex justify-end">
            <Button variant="secondary" onClick={runGeneration}>Regenerate</Button>
          </div>
        </div>
      }
    />
  );
}

function SectionCard({ icon, title, content }: { icon: React.ReactNode; title: string; content?: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{content}</p>
      </CardBody>
    </Card>
  );
}
