import { useState } from 'react';
import { Target, CheckCircle2, AlertCircle, Lightbulb, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AIStreamView, useAIStream } from '@/components/AIStreamView';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { generateValidation } from '@/lib/ai-engine';
import type { ValidationResult, Project } from '@/types';

export function ProjectValidatorPage() {
  const { user } = useAuth();
  const stream = useAIStream();
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [project, setProject] = useState({ title: '', description: '', target_users: '', tech_approach: '' });

  const runValidation = async () => {
    if (!project.title.trim()) {
      stream.setError('Please enter a project title.');
      return;
    }

    stream.reset();
    stream.setLoading(true);
    stream.setError(null);

    try {
      // Create project first
      let projectId: string | null = null;
      if (user) {
        const { data: proj } = await supabase.from('projects').insert({
          user_id: user.id,
          title: project.title,
          description: project.description,
          target_users: project.target_users,
          tech_approach: project.tech_approach,
        }).select().single();
        projectId = proj?.id ?? null;
      }

      const res = await generateValidation(project, (chunk) => stream.setStreamedText((prev) => prev + chunk));
      setResult(res);
      stream.setHasResult(true);

      if (user && projectId) {
        await supabase.from('ai_outputs').insert({
          user_id: user.id,
          project_id: projectId,
          module_type: 'project_validation',
          input_payload: project as unknown as Record<string, unknown>,
          output_payload: res as unknown as Record<string, unknown>,
        });
      }
    } catch {
      stream.setError('Failed to validate project. Please try again.');
    } finally {
      stream.setLoading(false);
    }
  };

  return (
    <AIStreamView
      title="Project Validator"
      description="Get AI feedback on feasibility, originality, and scope"
      icon={<Target className="h-6 w-6 text-success-500" />}
      loading={stream.loading}
      error={stream.error}
      streamedText={stream.streamedText}
      hasResult={stream.hasResult}
      onRegenerate={runValidation}
      onTrigger={runValidation}
      triggerLabel="Validate Project"
      triggerView={
        <div className="space-y-4">
          <Input label="Project title" placeholder="My awesome hackathon project" value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} />
          <Textarea label="Description" placeholder="What does your project do?" rows={3} value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} />
          <Input label="Target users" placeholder="Who is this for?" value={project.target_users} onChange={(e) => setProject({ ...project, target_users: e.target.value })} />
          <Textarea label="Tech approach" placeholder="What technologies will you use?" rows={2} value={project.tech_approach} onChange={(e) => setProject({ ...project, tech_approach: e.target.value })} />
        </div>
      }
      resultView={
        <div className="space-y-4 animate-fade-in">
          {/* Scores */}
          <div className="grid gap-4 sm:grid-cols-3">
            <ScoreCard icon={<CheckCircle2 className="h-5 w-5 text-success-500" />} label="Feasibility" score={result?.feasibility.score ?? 0} note={result?.feasibility.note ?? ''} variant="success" />
            <ScoreCard icon={<Lightbulb className="h-5 w-5 text-accent-500" />} label="Originality" score={result?.originality.score ?? 0} note={result?.originality.note ?? ''} variant="accent" />
            <ScoreCard icon={<Target className="h-5 w-5 text-primary-500" />} label="Scope" score={result?.scope.score ?? 0} note={result?.scope.note ?? ''} variant="primary" />
          </div>

          {/* Risks */}
          {result?.risks && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-warning-500" />
                  <CardTitle>Risks</CardTitle>
                </div>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {result.risks.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-warning-500" /> {r}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Suggestions */}
          {result?.suggestions && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent-500" />
                  <CardTitle>Suggestions</CardTitle>
                </div>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success-500" /> {s}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={runValidation}>Regenerate</Button>
          </div>
        </div>
      }
    />
  );
}

function ScoreCard({ icon, label, score, note, variant }: { icon: React.ReactNode; label: string; score: number; note: string; variant: 'success' | 'accent' | 'primary' }) {
  const colors = { success: 'text-success-500', accent: 'text-accent-500', primary: 'text-primary-500' };
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <div className={`text-3xl font-bold ${colors[variant]}`}>{score}<span className="text-lg opacity-50">/100</span></div>
        <div className="mt-2 h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, background: variant === 'success' ? '#22c55e' : variant === 'accent' ? '#06b6d4' : '#3b82f6' }} />
        </div>
        <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>{note}</p>
      </CardBody>
    </Card>
  );
}
