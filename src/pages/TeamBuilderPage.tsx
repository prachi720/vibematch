import { useEffect, useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AIStreamView, useAIStream } from '@/components/AIStreamView';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { generateTeamSuggestions } from '@/lib/ai-engine';
import type { TeamBuilderResult } from '@/types';

export function TeamBuilderPage() {
  const { user } = useAuth();
  const stream = useAIStream();
  const [result, setResult] = useState<TeamBuilderResult | null>(null);
  const [skills, setSkills] = useState<{ name: string; proficiency: number; category: string }[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!prof) return;

      const { data: skillData } = await supabase
        .from('profile_skills')
        .select('*, skill:skills(*)')
        .eq('profile_id', prof.id);

      if (skillData) {
        const mapped = skillData.map((ps: Record<string, unknown>) => {
          const skill = ps.skill as { name: string; category: string };
          return { name: skill.name, proficiency: ps.proficiency as number, category: skill.category };
        });
        setSkills(mapped);
      }
    })();
  }, [user]);

  const runSuggestions = async () => {
    stream.reset();
    stream.setLoading(true);
    stream.setError(null);

    try {
      const res = await generateTeamSuggestions(
        skills,
        gaps,
        (chunk) => stream.setStreamedText((prev) => prev + chunk),
      );
      setResult(res);
      stream.setHasResult(true);

      if (user) {
        await supabase.from('ai_outputs').insert({
          user_id: user.id,
          module_type: 'team_builder',
          input_payload: { skills, gaps },
          output_payload: res as unknown as Record<string, unknown>,
        });
      }
    } catch {
      stream.setError('Failed to generate suggestions. Please try again.');
    } finally {
      stream.setLoading(false);
    }
  };

  return (
    <AIStreamView
      title="Team Builder"
      description="Find complementary teammates based on your skill gaps"
      icon={<Users className="h-6 w-6 text-accent-500" />}
      loading={stream.loading}
      error={stream.error}
      streamedText={stream.streamedText}
      hasResult={stream.hasResult}
      onRegenerate={runSuggestions}
      onTrigger={runSuggestions}
      triggerLabel="Find Teammates"
      triggerView={
        <div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Based on your {skills.length} skills, we'll suggest teammates who complement your gaps.
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 5).map((s) => (
              <Badge key={s.name} variant="primary">{s.name}</Badge>
            ))}
          </div>
        </div>
      }
      resultView={
        <div className="space-y-4 animate-fade-in">
          {result?.suggestions.map((s, i) => (
            <Card key={i}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10">
                      <span className="text-sm font-bold text-accent-500">
                        {s.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.role}</p>
                    </div>
                  </div>
                  <Badge variant="success">{s.complementScore}% match</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.skills.map((sk) => (
                    <Badge key={sk} variant="neutral">{sk}</Badge>
                  ))}
                </div>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.matchReason}</p>
              </CardBody>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={runSuggestions}>Regenerate</Button>
          </div>
        </div>
      }
    />
  );
}
