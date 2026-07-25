import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, Filter, ArrowLeft, Brain, Users, Target, Layers, Map, ListOrdered, Presentation, Gavel, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardBody, EmptyState, FullPageLoader } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { AIOutput, ModuleType } from '@/types';

const moduleConfig: Record<ModuleType, { label: string; icon: typeof Brain; color: string }> = {
  skill_analysis: { label: 'Skill Analysis', icon: Brain, color: 'text-primary-500' },
  team_builder: { label: 'Team Builder', icon: Users, color: 'text-accent-500' },
  project_validation: { label: 'Project Validation', icon: Target, color: 'text-success-500' },
  architecture: { label: 'Architecture', icon: Layers, color: 'text-warning-500' },
  roadmap: { label: 'Roadmap', icon: Map, color: 'text-primary-500' },
  feature_prioritization: { label: 'Feature Prioritization', icon: ListOrdered, color: 'text-accent-500' },
  pitch: { label: 'Pitch', icon: Presentation, color: 'text-success-500' },
  judge_session: { label: 'Judge Session', icon: Gavel, color: 'text-warning-500' },
  documentation: { label: 'Documentation', icon: FileText, color: 'text-primary-500' },
};

const moduleRoutes: Record<ModuleType, string> = {
  skill_analysis: '/skill-analyzer',
  team_builder: '/team-builder',
  project_validation: '/project-validator',
  architecture: '/architecture',
  roadmap: '/roadmap',
  feature_prioritization: '/feature-prioritizer',
  pitch: '/pitch',
  judge_session: '/judge-simulator',
  documentation: '/documentation',
};

export function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [outputs, setOutputs] = useState<AIOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [selected, setSelected] = useState<AIOutput | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('ai_outputs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOutputs((data as AIOutput[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = outputs.filter((o) => {
    if (filterModule !== 'all' && o.module_type !== filterModule) return false;
    if (search) {
      const json = JSON.stringify(o.output_payload).toLowerCase();
      if (!json.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  if (loading) return <FullPageLoader message="Loading history..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-6 w-6 text-accent-500" />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Project History</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
          <input
            className="input-field pl-10"
            placeholder="Search outputs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
          <select
            className="input-field"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option value="all">All modules</option>
            {Object.entries(moduleConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<History className="h-10 w-10" style={{ color: 'var(--text-tertiary)' }} />}
            title="No history yet"
            description="Run any AI module and your results will be saved here for future reference."
            action={<Button size="sm" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = moduleConfig[item.module_type];
            const Icon = cfg?.icon ?? Brain;
            return (
              <Card key={item.id} hover onClick={() => setSelected(item)}>
                <CardBody>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10">
                        <Icon className={`h-4 w-4 ${cfg?.color ?? 'text-primary-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {cfg?.label ?? item.module_type}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {new Date(item.created_at).toLocaleString()}
                          {item.regeneration_count > 0 && ` · Regenerated ${item.regeneration_count}x`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="neutral">{item.model}</Badge>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? moduleConfig[selected.module_type]?.label : ''} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{selected.module_type}</Badge>
              <Badge variant="neutral">{selected.model}</Badge>
              <Badge variant="accent">{new Date(selected.created_at).toLocaleString()}</Badge>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Input</h4>
              <pre className="max-h-48 overflow-y-auto scrollbar-thin rounded-lg p-3 text-xs font-mono" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {JSON.stringify(selected.input_payload, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Output</h4>
              <pre className="max-h-64 overflow-y-auto scrollbar-thin rounded-lg p-3 text-xs font-mono" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {JSON.stringify(selected.output_payload, null, 2)}
              </pre>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              <Button onClick={() => navigate(moduleRoutes[selected.module_type])}>
                Open module <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
