import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AIStreamView, useAIStream } from '@/components/AIStreamView';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { generateDocumentation } from '@/lib/ai-engine';
import type { DocumentationResult, Project, AIOutput } from '@/types';

export function DocumentationPage() {
  const { user } = useAuth();
  const stream = useAIStream();
  const [result, setResult] = useState<DocumentationResult | null>(null);
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
      let context: { architecture?: string; roadmap?: string } = {};
      if (user) {
        const { data: outputs } = await supabase
          .from('ai_outputs')
          .select('*')
          .eq('project_id', proj.id)
          .order('created_at', { ascending: false });
        if (outputs) {
          for (const out of outputs as AIOutput[]) {
            if (out.module_type === 'architecture' && !context.architecture) context.architecture = 'available';
            if (out.module_type === 'roadmap' && !context.roadmap) context.roadmap = 'available';
          }
        }
      }

      const res = await generateDocumentation(proj, context, (chunk) => stream.setStreamedText((prev) => prev + chunk));
      setResult(res);
      stream.setHasResult(true);

      if (user) {
        await supabase.from('ai_outputs').insert({
          user_id: user.id,
          project_id: proj.id,
          module_type: 'documentation',
          input_payload: { project: proj } as unknown as Record<string, unknown>,
          output_payload: res as unknown as Record<string, unknown>,
        });
      }
    } catch {
      stream.setError('Failed to generate documentation. Please try again.');
    } finally {
      stream.setLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AIStreamView
      title="Documentation Generator"
      description="Auto-generate README and technical docs from your project context"
      icon={<FileText className="h-6 w-6 text-primary-500" />}
      loading={stream.loading}
      error={stream.error}
      streamedText={stream.streamedText}
      hasResult={stream.hasResult}
      onRegenerate={runGeneration}
      onTrigger={runGeneration}
      triggerLabel="Generate Documentation"
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
            <Button variant="secondary" size="sm" onClick={downloadMarkdown}>
              <Download className="h-4 w-4" /> Download .md
            </Button>
          </div>
          {result?.sections.map((section, i) => (
            <Card key={i}>
              <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
              <CardBody>
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {section.content}
                </pre>
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
