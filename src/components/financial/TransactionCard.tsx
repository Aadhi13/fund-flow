import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatDateShort } from '../../lib/utils';
import { AmountDisplay } from './AmountDisplay';
import { getCategoryLabel } from '../../data/mock';
import type { Transaction } from '../../types';

interface TransactionCardProps {
  transaction: Transaction;
  linkTo?: string;
}

/**
 * Mobile-friendly transaction card.
 * Shows key financial information in a compact, touch-friendly layout.
 */
export function TransactionCard({ transaction, linkTo }: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const isVoided = transaction.status === 'voided';

  const content = (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3',
      'border-b border-[var(--border-primary)] last:border-b-0',
      'active:bg-[var(--surface-secondary)] transition-colors duration-100',
      isVoided && 'opacity-50',
    )}>
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded shrink-0 mt-0.5',
        isIncome ? 'bg-income-50 text-income-600 dark:bg-income-700/20' : 'bg-expense-50 text-expense-600 dark:bg-expense-700/20',
      )}>
        {isIncome ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-[var(--text-primary)] leading-tight line-clamp-2">
            {transaction.description}
            {isVoided && <span className="text-expense-600 text-xs ml-1.5">(voided)</span>}
          </p>
          <AmountDisplay
            amount={transaction.amount}
            type={transaction.type}
            size="sm"
            showSign
            className={cn('shrink-0', isVoided && 'line-through')}
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[var(--text-tertiary)]">
            {getCategoryLabel(transaction.category)}
          </span>
          <span className="text-[var(--text-tertiary)]">·</span>
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
            {formatDateShort(transaction.transaction_date)}
          </span>
        </div>
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block">{content}</Link>;
  }

  return content;
}
