import { useEffect, useState } from 'react';
import { Gavel, Star, ThumbsUp, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AIStreamView, useAIStream } from '@/components/AIStreamView';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { generateJudgeFeedback } from '@/lib/ai-engine';
import type { JudgeResult, Project, AIOutput } from '@/types';

export function JudgeSimulatorPage() {
  const { user } = useAuth();
  const stream = useAIStream();
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProjects(data as Project[]); });
  }, [user]);

  const runSession = async () => {
    const proj = projects.find((p) => p.id === selectedProject);
    if (!proj) { stream.setError('Select a project first.'); return; }

    stream.reset();
    stream.setLoading(true);
    stream.setError(null);

    try {
      let pitchText = '';
      if (user) {
        const { data: pitchOutput } = await supabase
          .from('ai_outputs')
          .select('*')
          .eq('project_id', proj.id)
          .eq('module_type', 'pitch')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (pitchOutput) pitchText = JSON.stringify((pitchOutput as AIOutput).output_payload);
      }

      const res = await generateJudgeFeedback(proj, pitchText, (chunk) => stream.setStreamedText((prev) => prev + chunk));
      setResult(res);
      stream.setHasResult(true);

      if (user) {
        await supabase.from('ai_outputs').insert({
          user_id: user.id,
          project_id: proj.id,
          module_type: 'judge_session',
          input_payload: { project: proj } as unknown as Record<string, unknown>,
          output_payload: res as unknown as Record<string, unknown>,
        });
      }
    } catch {
      stream.setError('Failed to simulate judge. Please try again.');
    } finally {
      stream.setLoading(false);
    }
  };

  return (
    <AIStreamView
      title="Judge Simulator"
      description="Practice with an AI judge that scores your project"
      icon={<Gavel className="h-6 w-6 text-warning-500" />}
      loading={stream.loading}
      error={stream.error}
      streamedText={stream.streamedText}
      hasResult={stream.hasResult}
      onRegenerate={runSession}
      onTrigger={runSession}
      triggerLabel="Start Judge Session"
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
          {/* Persona */}
          {result && (
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-500/10">
                    <User className="h-5 w-5 text-warning-500" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Judge persona</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{result.persona}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Overall score</p>
                    <p className="text-2xl font-bold text-warning-500">{result.overallScore}<span className="text-sm opacity-50">/10</span></p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Scores */}
          {result?.scores.map((s, i) => (
            <Card key={i}>
              <CardBody>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.criterion}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {s.score}<span className="text-xs opacity-50">/{s.maxScore}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${(s.score / s.maxScore) * 100}%`, background: s.score >= 8 ? '#22c55e' : s.score >= 6 ? '#f59e0b' : '#ef4444' }}
                  />
                </div>
                <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.note}</p>
              </CardBody>
            </Card>
          ))}

          {/* Feedback */}
          {result && (
            <Card>
              <CardHeader><CardTitle>Judge Feedback</CardTitle></CardHeader>
              <CardBody>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.feedback}</p>
              </CardBody>
            </Card>
          )}

          {/* Strengths */}
          {result?.strengths && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-success-500" />
                  <CardTitle>Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Star className="h-4 w-4 mt-0.5 shrink-0 text-success-500" /> {s}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Improvements */}
          {result?.improvements && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning-500" />
                  <CardTitle>Areas to Improve</CardTitle>
                </div>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-warning-500" /> {s}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={runSession}>
              <Gavel className="h-4 w-4" /> New Judge Persona
            </Button>
          </div>
        </div>
      }
    />
  );
}
