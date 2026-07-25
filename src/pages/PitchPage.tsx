import { useEffect, useState } from 'react';
import { Presentation, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AIStreamView, useAIStream } from '@/components/AIStreamView';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { generatePitch } from '@/lib/ai-engine';
import type { PitchResult, Project, AIOutput } from '@/types';

export function PitchPage() {
  const { user } = useAuth();
  const stream = useAIStream();
  const [result, setResult] = useState<PitchResult | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [copied, setCopied] = useState(false);

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
      // Fetch context from previous AI outputs
      let context: { validation?: string; architecture?: string; roadmap?: string } = {};
      if (user) {
        const { data: outputs } = await supabase
          .from('ai_outputs')
          .select('*')
          .eq('project_id', proj.id)
          .order('created_at', { ascending: false });
        if (outputs) {
          for (const out of outputs as AIOutput[]) {
            if (out.module_type === 'project_validation' && !context.validation) context.validation = 'available';
            if (out.module_type === 'architecture' && !context.architecture) context.architecture = 'available';
            if (out.module_type === 'roadmap' && !context.roadmap) context.roadmap = 'available';
          }
        }
      }

      const res = await generatePitch(proj, context, (chunk) => stream.setStreamedText((prev) => prev + chunk));
      setResult(res);
      stream.setHasResult(true);

      if (user) {
        await supabase.from('ai_outputs').insert({
          user_id: user.id,
          project_id: proj.id,
          module_type: 'pitch',
          input_payload: { project: proj } as unknown as Record<string, unknown>,
          output_payload: res as unknown as Record<string, unknown>,
        });
      }
    } catch {
      stream.setError('Failed to generate pitch. Please try again.');
    } finally {
      stream.setLoading(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    const text = result.sections.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AIStreamView
      title="Pitch Generator"
      description="Craft a structured pitch with problem, solution, demo, market, and ask"
      icon={<Presentation className="h-6 w-6 text-success-500" />}
      loading={stream.loading}
      error={stream.error}
      streamedText={stream.streamedText}
      hasResult={stream.hasResult}
      onRegenerate={runGeneration}
      onTrigger={runGeneration}
      triggerLabel="Generate Pitch"
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
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={copyAll}>
              {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy pitch</>}
            </Button>
          </div>
          {result?.sections.map((section, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <CardTitle>{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{section.content}</p>
              </CardBody>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={runGeneration}>Regenerate</Button>
          </div>
        </div>
      }
    />
  );
}
