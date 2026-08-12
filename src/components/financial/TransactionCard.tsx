import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Tag, Calendar, User, ChevronRight } from 'lucide-react';
import { cn, formatDateShort, formatTxnId } from '../../lib/utils';
import { AmountDisplay } from './AmountDisplay';
import { Badge } from '../ui/Badge';
import { getCategoryLabel } from '../../data/mock';
import type { Transaction } from '../../types';

interface TransactionCardProps {
  transaction: Transaction;
  linkTo?: string;
}

/**
 * Mobile-first transaction card layout.
 * Optimized for readability on small screens without compromising on ledger fields.
 */
export function TransactionCard({ transaction, linkTo }: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const isVoided = transaction.status === 'voided';
  const humanId = formatTxnId(transaction.id);

  const content = (
    <div
      className={cn(
        'p-3.5 sm:p-4 border-b border-[var(--border-primary)] last:border-b-0',
        'active:bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] transition-colors duration-150',
        isVoided && 'opacity-65 bg-[var(--surface-secondary)]/50',
      )}
    >
      {/* Top Header Line: Ref ID, Type Badge, Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-[var(--text-tertiary)] bg-[var(--surface-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-primary)]">
            {humanId}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border',
              isIncome
                ? 'bg-income-50 text-income-700 border-income-200 dark:bg-income-700/20 dark:text-income-600 dark:border-income-800/40'
                : 'bg-expense-50 text-expense-700 border-expense-200 dark:bg-expense-700/20 dark:text-expense-600 dark:border-expense-800/40'
            )}
          >
            {isIncome ? (
              <>
                <ArrowDownRight size={12} className="shrink-0" />
                <span>+ Income</span>
              </>
            ) : (
              <>
                <ArrowUpRight size={12} className="shrink-0" />
                <span>− Expense</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isVoided ? (
            <Badge variant="warning" className="text-[10px] px-1.5 py-0">Voided</Badge>
          ) : (
            <Badge variant="neutral" className="text-[10px] px-1.5 py-0">Active</Badge>
          )}
          <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
        </div>
      </div>

      {/* Main Row: Description & Amount */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-tight flex-1">
          {transaction.description}
          {isVoided && <span className="text-expense-600 text-xs ml-1.5 font-normal">(Voided)</span>}
        </h3>

        <AmountDisplay
          amount={transaction.amount}
          type={transaction.type}
          size="md"
          showSign
          className={cn('shrink-0 font-bold', isVoided && 'line-through opacity-70')}
        />
      </div>

      {/* Details Row: Payee, Category, Date */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-primary)]/60">
        <div className="flex items-center gap-1 min-w-0">
          <User size={13} className="text-[var(--text-tertiary)] shrink-0" />
          <span className="truncate">{transaction.person}</span>
        </div>

        <div className="flex items-center justify-end gap-1 min-w-0">
          <Calendar size={13} className="text-[var(--text-tertiary)] shrink-0" />
          <span className="tabular-nums">{formatDateShort(transaction.transaction_date)}</span>
        </div>

        <div className="col-span-2 flex items-center gap-1 text-[var(--text-tertiary)] mt-0.5">
          <Tag size={12} className="shrink-0" />
          <span>{getCategoryLabel(transaction.category)}</span>
        </div>
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block no-underline">{content}</Link>;
  }

  return content;
}
