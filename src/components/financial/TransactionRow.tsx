import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatDateShort } from '../../lib/utils';
import { AmountDisplay } from './AmountDisplay';
import { Badge } from '../../components/ui/Badge';
import { getCategoryLabel } from '../../data/mock';
import type { Transaction } from '../../types';

interface TransactionRowProps {
  transaction: Transaction;
  linkTo?: string;
}

/**
 * Desktop table-row style transaction display.
 * Used within a table or list on wider screens.
 */
export function TransactionRow({ transaction, linkTo }: TransactionRowProps) {
  const isIncome = transaction.type === 'income';
  const content = (
    <div className={cn(
      'grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3',
      'border-b border-[var(--border-primary)] last:border-b-0',
      'hover:bg-[var(--surface-secondary)] transition-colors duration-100',
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded shrink-0',
          isIncome ? 'bg-income-50 text-income-600 dark:bg-income-700/20' : 'bg-expense-50 text-expense-600 dark:bg-expense-700/20',
        )}>
          {isIncome ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {transaction.description}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {transaction.added_by}
          </p>
        </div>
      </div>
      <Badge variant={isIncome ? 'income' : 'expense'}>
        {getCategoryLabel(transaction.category)}
      </Badge>
      <span className="text-xs text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">
        {formatDateShort(transaction.date)}
      </span>
      <AmountDisplay
        amount={transaction.amount}
        type={transaction.type}
        size="sm"
        showSign
      />
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block">{content}</Link>;
  }

  return content;
}
