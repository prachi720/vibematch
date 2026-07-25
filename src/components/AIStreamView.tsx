import { type ReactNode, useEffect, useRef, useState } from 'react';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/Feedback';

interface AIStreamViewProps {
  loading: boolean;
  error: string | null;
  streamedText: string;
  hasResult: boolean;
  onRegenerate: () => void;
  resultView: ReactNode;
  triggerView: ReactNode;
  triggerLabel: string;
  onTrigger: () => void;
  title: string;
  description: string;
  icon: ReactNode;
}

export function AIStreamView({
  loading, error, streamedText, hasResult, onRegenerate,
  resultView, triggerView, triggerLabel, onTrigger, title, description, icon,
}: AIStreamViewProps) {
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamedText]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
          </div>
        </div>
        {hasResult && !loading && (
          <Button variant="secondary" size="sm" onClick={onRegenerate}>
            <RefreshCw className="h-4 w-4" /> Regenerate
          </Button>
        )}
      </div>

      {/* Trigger / Input */}
      {!hasResult && !loading && !error && (
        <div className="card p-6 animate-fade-in">
          {triggerView}
          <div className="mt-4 flex justify-end">
            <Button onClick={onTrigger}>
              <Sparkles className="h-4 w-4" /> {triggerLabel}
            </Button>
          </div>
        </div>
      )}

      {/* Loading / Streaming */}
      {loading && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 animate-pulse text-primary-500" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>AI is thinking...</span>
          </div>
          {streamedText && (
            <div
              ref={streamRef}
              className="max-h-48 overflow-y-auto scrollbar-thin rounded-lg p-3 text-sm leading-relaxed"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              {streamedText}
              <span className="inline-block w-2 h-4 ml-0.5 animate-pulse bg-primary-500 align-middle" />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="card p-6">
          <ErrorState message={error} onRetry={onTrigger} />
        </div>
      )}

      {/* Result */}
      {hasResult && !loading && !error && resultView}
    </div>
  );
}

// Hook for managing AI streaming state
export function useAIStream() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState('');
  const [hasResult, setHasResult] = useState(false);

  const reset = () => {
    setLoading(false);
    setError(null);
    setStreamedText('');
    setHasResult(false);
  };

  return { loading, error, streamedText, hasResult, setLoading, setError, setStreamedText, setHasResult, reset };
}
