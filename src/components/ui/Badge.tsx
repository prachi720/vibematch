import { type ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'accent';

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  success: 'bg-success-500/10 text-success-600 dark:text-success-400',
  warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
  error: 'bg-error-500/10 text-error-600 dark:text-error-400',
  neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  accent: 'bg-accent-500/10 text-accent-600 dark:text-accent-400',
};

export function Badge({
  children,
  variant = 'neutral',
  className = '',
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
