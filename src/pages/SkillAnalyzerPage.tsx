import { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AIStreamView, useAIStream } from '@/components/AIStreamView';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { generateSkillAnalysis } from '@/lib/ai-engine';
import type { SkillAnalysisResult, ProfileSkill, Skill } from '@/types';

export function SkillAnalyzerPage() {
  const { user } = useAuth();
  const stream = useAIStream();
  const [result, setResult] = useState<SkillAnalysisResult | null>(null);
  const [profileSkills, setProfileSkills] = useState<{ name: string; proficiency: number; category: string }[]>([]);
  const [experience, setExperience] = useState('beginner');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('experience_level')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profile?.experience_level) setExperience(profile.experience_level);

      const { data: profData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!profData) return;

      const { data: skills } = await supabase
        .from('profile_skills')
        .select('*, skill:skills(*)')
        .eq('profile_id', profData.id);

      if (skills) {
        const mapped = (skills as unknown as (ProfileSkill & { skill: Skill })[]).map((ps) => ({
          name: ps.skill.name,
          proficiency: ps.proficiency,
          category: ps.skill.category,
        }));
        setProfileSkills(mapped);
      }
    })();
  }, [user]);

  const runAnalysis = async () => {
    if (profileSkills.length === 0) {
      stream.setError('Add skills to your profile first to get a skill analysis.');
      return;
    }

    stream.reset();
    stream.setLoading(true);
    stream.setError(null);

    try {
    const res = await generateSkillAnalysis(
        profileSkills,
        experience,
        (chunk) => stream.setStreamedText((prev) => prev + chunk),
      );
      setResult(res);
      stream.setHasResult(true);

      // Save to ai_outputs
      if (user) {
        await supabase.from('ai_outputs').insert({
          user_id: user.id,
          module_type: 'skill_analysis',
          input_payload: { skills: profileSkills, experience_level: experience },
          output_payload: res as unknown as Record<string, unknown>,
        });
      }
    } catch {
      stream.setError('Failed to generate analysis. Please try again.');
    } finally {
      stream.setLoading(false);
    }
  };

  const radarData = result?.radarData ?? [];

  return (
    <AIStreamView
      title="Skill Analyzer"
      description="AI-powered analysis of your strengths, gaps, and growth areas"
      icon={<Brain className="h-6 w-6 text-primary-500" />}
      loading={stream.loading}
      error={stream.error}
      streamedText={stream.streamedText}
      hasResult={stream.hasResult}
      onRegenerate={runAnalysis}
      onTrigger={runAnalysis}
      triggerLabel="Analyze My Skills"
      triggerView={
        <div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            We'll analyze your {profileSkills.length} skills and {experience} experience level to identify strengths, gaps, and growth areas.
          </p>
          {profileSkills.length === 0 ? (
            <div className="rounded-lg border border-warning-500/30 bg-warning-500/10 p-3 text-sm text-warning-600 dark:text-warning-400">
              You haven't added any skills yet. Go to Settings to add skills to your profile.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileSkills.map((s) => (
                <Badge key={s.name} variant="primary">{s.name} ({s.proficiency}/5)</Badge>
              ))}
            </div>
          )}
        </div>
      }
      resultView={
        <div className="space-y-4 animate-fade-in">
          {/* Radar chart */}
          {radarData.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Skill Breakdown</CardTitle></CardHeader>
              <CardBody>
                <RadarChart data={radarData} />
              </CardBody>
            </Card>
          )}

          {/* Strengths */}
          {result?.strengths && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success-500" />
                  <CardTitle>Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {result.strengths.map((s) => (
                  <div key={s.skill} className="flex gap-3">
                    <Badge variant="success">{s.skill}</Badge>
                    <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{s.note}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Gaps */}
          {result?.gaps && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning-500" />
                  <CardTitle>Gaps</CardTitle>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {result.gaps.map((g) => (
                  <div key={g.area} className="flex gap-3">
                    <Badge variant="warning">{g.area}</Badge>
                    <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{g.note}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Growth areas */}
          {result?.growthAreas && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent-500" />
                  <CardTitle>Growth Areas</CardTitle>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {result.growthAreas.map((g) => (
                  <div key={g.area}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.area}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{g.suggestion}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={runAnalysis}>
              Regenerate Analysis
            </Button>
          </div>
        </div>
      }
    />
  );
}

function RadarChart({ data }: { data: { skill: string; level: number }[] }) {
  const size = 280;
  const center = size / 2;
  const maxRadius = 110;
  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const radius = (d.level / 5) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (maxRadius + 25) * Math.cos(angle),
      labelY: center + (maxRadius + 25) * Math.sin(angle),
      label: d.skill,
      level: d.level,
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex justify-center">
      <svg width={size + 80} height={size + 60} className="max-w-full">
        {/* Grid circles */}
        {[1, 2, 3, 4, 5].map((level) => {
          const r = (level / 5) * maxRadius;
          const gridPoints = data.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={gridPoints}
              fill="none"
              stroke="var(--border)"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}
        {/* Axes */}
        {data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.cos(angle)}
              y2={center + maxRadius * Math.sin(angle)}
              stroke="var(--border)"
              strokeWidth={1}
            />
          );
        })}
        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(59,130,246,0.2)"
          stroke="#3b82f6"
          strokeWidth={2}
        />
        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#3b82f6" />
        ))}
        {/* Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px]"
            fill="var(--text-secondary)"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
