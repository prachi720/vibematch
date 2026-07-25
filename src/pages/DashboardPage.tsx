import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, Users, Target, Layers, Map, ListOrdered, Presentation, Gavel,
  FileText, Clock, ArrowRight, Sparkles, Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardBody, EmptyState } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import type { AIOutput } from '@/types';

interface ModuleCard {
  to: string;
  icon: typeof Brain;
  title: string;
  desc: string;
  status: 'ready' | 'coming-soon';
  color: string;
}

const modules: ModuleCard[] = [
  { to: '/skill-analyzer', icon: Brain, title: 'Skill Analyzer', desc: 'AI analysis of your strengths and gaps', status: 'ready', color: 'text-primary-500' },
  { to: '/team-builder', icon: Users, title: 'Team Builder', desc: 'Find complementary teammates', status: 'ready', color: 'text-accent-500' },
  { to: '/project-validator', icon: Target, title: 'Project Validator', desc: 'Validate your project idea', status: 'ready', color: 'text-success-500' },
  { to: '/architecture', icon: Layers, title: 'Architecture Generator', desc: 'Generate system architecture', status: 'ready', color: 'text-warning-500' },
  { to: '/roadmap', icon: Map, title: 'Roadmap Generator', desc: 'Execution timeline with milestones', status: 'ready', color: 'text-primary-500' },
  { to: '/feature-prioritizer', icon: ListOrdered, title: 'Feature Prioritizer', desc: 'Rank features by impact and effort', status: 'ready', color: 'text-accent-500' },
  { to: '/pitch', icon: Presentation, title: 'Pitch Generator', desc: 'Craft your hackathon pitch', status: 'ready', color: 'text-success-500' },
  { to: '/judge-simulator', icon: Gavel, title: 'Judge Simulator', desc: 'Practice with an AI judge', status: 'ready', color: 'text-warning-500' },
  { to: '/documentation', icon: FileText, title: 'Documentation Generator', desc: 'Auto-generate README and docs', status: 'ready', color: 'text-primary-500' },
];

const moduleLabels: Record<string, string> = {
  skill_analysis: 'Skill Analysis',
  team_builder: 'Team Builder',
  project_validation: 'Project Validation',
  architecture: 'Architecture',
  roadmap: 'Roadmap',
  feature_prioritization: 'Feature Prioritization',
  pitch: 'Pitch',
  judge_session: 'Judge Session',
  documentation: 'Documentation',
};

export function DashboardPage() {
  const { user, profile, profileLoading } = useAuth();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState<AIOutput[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    if (!profileLoading && !profile?.profile_complete) {
      navigate('/profile-setup');
    }
  }, [profile, profileLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setActivityLoading(true);
      const { data } = await supabase
        .from('ai_outputs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentActivity((data as AIOutput[]) ?? []);
      setActivityLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Welcome back, {profile?.name || 'developer'}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your AI-powered hackathon prep hub. Pick a module to get started.
        </p>
      </div>

      {/* Module grid */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI Modules</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.to} to={mod.to}>
                <Card hover className="h-full p-5 group">
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-opacity-10 ${mod.color}`} style={{ background: 'rgba(59,130,246,0.08)' }}>
                      <Icon className={`h-5 w-5 ${mod.color}`} />
                    </div>
                    {mod.status === 'coming-soon' && <Badge variant="neutral">Soon</Badge>}
                  </div>
                  <h3 className="mt-4 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {mod.title}
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {mod.desc}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary-500 opacity-0 transition-opacity group-hover:opacity-100">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent-500" />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
        </div>
        <Card>
          {activityLoading ? (
            <CardBody>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg" style={{ background: 'var(--bg-tertiary)' }} />
                ))}
              </div>
            </CardBody>
          ) : recentActivity.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-10 w-10" style={{ color: 'var(--text-tertiary)' }} />}
              title="No activity yet"
              description="Run any AI module and your results will appear here."
              action={
                <Link to="/skill-analyzer">
                  <button className="text-sm font-medium text-primary-500 hover:text-primary-600">
                    Try Skill Analyzer
                  </button>
                </Link>
              }
            />
          ) : (
            <CardBody className="space-y-2">
              {recentActivity.map((item) => (
                <Link
                  key={item.id}
                  to="/history"
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10">
                      <Brain className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {moduleLabels[item.module_type] || item.module_type}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
                </Link>
              ))}
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  );
}
