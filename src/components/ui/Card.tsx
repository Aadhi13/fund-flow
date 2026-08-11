import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md';
}

const paddingStyles = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
};

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-lg',
        'shadow-[var(--shadow-sm)]',
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
