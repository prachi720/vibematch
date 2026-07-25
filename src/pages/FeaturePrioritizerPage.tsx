import { useState } from 'react';
import { ListOrdered, Plus, X, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AIStreamView, useAIStream } from '@/components/AIStreamView';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { generateFeaturePrioritization } from '@/lib/ai-engine';
import type { FeaturePrioritizationResult } from '@/types';

export function FeaturePrioritizerPage() {
  const { user } = useAuth();
  const stream = useAIStream();
  const [result, setResult] = useState<FeaturePrioritizationResult | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));

  const runPrioritization = async () => {
    if (features.length === 0) { stream.setError('Add at least one feature.'); return; }

    stream.reset();
    stream.setLoading(true);
    stream.setError(null);

    try {
      const res = await generateFeaturePrioritization(features, (chunk) => stream.setStreamedText((prev) => prev + chunk));
      setResult(res);
      stream.setHasResult(true);

      if (user) {
        await supabase.from('ai_outputs').insert({
          user_id: user.id,
          module_type: 'feature_prioritization',
          input_payload: { features },
          output_payload: res as unknown as Record<string, unknown>,
        });
      }
    } catch {
      stream.setError('Failed to prioritize features. Please try again.');
    } finally {
      stream.setLoading(false);
    }
  };

  const priorityColors = {
    must: 'error',
    should: 'warning',
    could: 'accent',
    wont: 'neutral',
  } as const;

  return (
    <AIStreamView
      title="Feature Prioritizer"
      description="Rank features using AI-assisted MoSCoW and impact/effort scoring"
      icon={<ListOrdered className="h-6 w-6 text-accent-500" />}
      loading={stream.loading}
      error={stream.error}
      streamedText={stream.streamedText}
      hasResult={stream.hasResult}
      onRegenerate={runPrioritization}
      onTrigger={runPrioritization}
      triggerLabel="Prioritize Features"
      triggerView={
        <div>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add a feature..."
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
            />
            <Button onClick={addFeature} variant="secondary"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-2.5" style={{ borderColor: 'var(--border)' }}>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{f}</span>
                <button onClick={() => removeFeature(i)} className="p-1 rounded hover:bg-error-500/10">
                  <X className="h-4 w-4 text-error-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      }
      resultView={
        <div className="space-y-4 animate-fade-in">
          {/* Impact/Effort Matrix */}
          {result && (
            <Card>
              <CardBody>
                <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Impact / Effort Matrix</h3>
                <div className="relative mx-auto" style={{ width: 320, height: 320 }}>
                  {/* Axes */}
                  <div className="absolute inset-0 border-l-2 border-b-2" style={{ borderColor: 'var(--border)' }} />
                  {/* Quadrant labels */}
                  <span className="absolute top-2 left-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>High Impact, Low Effort</span>
                  <span className="absolute top-2 right-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>High Impact, High Effort</span>
                  <span className="absolute bottom-8 left-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>Low Impact, Low Effort</span>
                  <span className="absolute bottom-8 right-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>Low Impact, High Effort</span>
                  {/* Points */}
                  {result.features.map((f, i) => {
                    const x = (f.effort / 6) * 280 + 20;
                    const y = 300 - (f.impact / 10) * 280;
                    const color = f.priority === 'must' ? '#ef4444' : f.priority === 'should' ? '#f59e0b' : f.priority === 'could' ? '#06b6d4' : '#94a3b8';
                    return (
                      <div
                        key={i}
                        className="absolute h-3 w-3 rounded-full border-2 border-white shadow-lg"
                        style={{ left: x, top: y, background: color, transform: 'translate(-50%, -50%)' }}
                        title={`${f.name}: Impact ${f.impact}, Effort ${f.effort}`}
                      />
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Ranked list */}
          {result?.features.map((f, i) => (
            <Card key={i}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                      <Badge variant={priorityColors[f.priority]}>{f.priority.toUpperCase()}</Badge>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{f.note}</p>
                    <div className="mt-2 flex gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Impact: {f.impact}/10</span>
                      <span>Effort: {f.effort}/6</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={runPrioritization}>Regenerate</Button>
          </div>
        </div>
      }
    />
  );
}
