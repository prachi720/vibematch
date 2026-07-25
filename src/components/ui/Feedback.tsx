import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return <Loader2 className="animate-spin text-primary-500" style={{ width: size, height: size }} />;
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <LoadingSpinner size={40} />
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
}

export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 py-4">
      <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
      {message && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</span>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && <div className="opacity-40">{icon}</div>}
      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-full bg-error-500/10 p-3">
        <svg className="h-6 w-6 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.67 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-sm text-error-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium text-primary-500 hover:text-primary-600">
          Try again
        </button>
      )}
    </div>
  );
}
