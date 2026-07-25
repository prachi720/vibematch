import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500/50 ${error ? 'border-error-500' : ''} ${className}`}
          style={{ borderColor: error ? '#ef4444' : 'var(--border)' }}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500/50 ${error ? 'border-error-500' : ''} ${className}`}
          style={{ borderColor: error ? '#ef4444' : 'var(--border)' }}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
