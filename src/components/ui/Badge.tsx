import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'income' | 'expense' | 'warning' | 'neutral' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  income: 'bg-income-50 text-income-700 dark:bg-income-700/20 dark:text-income-600',
  expense: 'bg-expense-50 text-expense-700 dark:bg-expense-700/20 dark:text-expense-600',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-700/20 dark:text-warning-600',
  neutral: 'bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)]',
  accent: 'bg-accent-50 text-accent-700 dark:bg-accent-700/20 dark:text-accent-500',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
