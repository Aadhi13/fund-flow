import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-md border transition-colors duration-150',
          'bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)]',
          'placeholder:text-[var(--text-tertiary)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent',
          error && 'border-expense-600 focus:ring-expense-600',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-expense-600">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>}
    </div>
  );
}
