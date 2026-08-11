import { cn, formatCurrency } from '../../lib/utils';
import type { TransactionType } from '../../types';

interface AmountDisplayProps {
  amount: number;
  type?: TransactionType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSign?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl sm:text-3xl',
};

export function AmountDisplay({
  amount,
  type,
  size = 'md',
  showSign = false,
  className,
}: AmountDisplayProps) {
  const colorClass = type === 'income'
    ? 'text-income-600'
    : type === 'expense'
      ? 'text-expense-600'
      : 'text-[var(--text-primary)]';

  const sign = showSign
    ? type === 'income' ? '+' : type === 'expense' ? '−' : ''
    : '';

  return (
    <span
      className={cn(
        'tabular-nums font-semibold tracking-tight',
        sizeStyles[size],
        colorClass,
        className,
      )}
    >
      {sign}{formatCurrency(amount)}
    </span>
  );
}
