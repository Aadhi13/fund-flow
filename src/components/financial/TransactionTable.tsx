import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatDateShort, formatTxnId } from '../../lib/utils';
import { AmountDisplay } from './AmountDisplay';
import { Badge } from '../ui/Badge';
import { getCategoryLabel } from '../../data/mock';
import type { Transaction } from '../../types';

interface TransactionTableProps {
  transactions: Transaction[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-primary)] bg-[var(--surface-secondary)] text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
            <th scope="col" className="py-3 px-4 font-semibold">Date</th>
            <th scope="col" className="py-3 px-4 font-semibold">Ref ID</th>
            <th scope="col" className="py-3 px-4 font-semibold">Description & Payee</th>
            <th scope="col" className="py-3 px-4 font-semibold">Category</th>
            <th scope="col" className="py-3 px-4 font-semibold text-center">Type</th>
            <th scope="col" className="py-3 px-4 font-semibold text-right">Amount</th>
            <th scope="col" className="py-3 px-4 font-semibold text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-primary)]">
          {transactions.map((t) => {
            const isIncome = t.type === 'income';
            const isVoided = t.status === 'voided';
            const humanId = formatTxnId(t.id);

            return (
              <tr
                key={t.id}
                className={cn(
                  'group hover:bg-[var(--surface-secondary)] transition-colors duration-150 cursor-pointer',
                  isVoided && 'opacity-60'
                )}
              >
                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[var(--text-secondary)] font-mono">
                  <Link to={`/transactions/${t.id}`} className="block">
                    {formatDateShort(t.transaction_date)}
                    {t.transaction_time && t.transaction_time !== '00:00:00' && (
                      <span className="text-[var(--text-tertiary)] block text-[11px]">
                        {t.transaction_time.slice(0, 5)}
                      </span>
                    )}
                  </Link>
                </td>

                {/* Ref ID */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Link to={`/transactions/${t.id}`} className="block">
                    <span className="font-mono text-xs text-[var(--text-tertiary)] bg-[var(--surface-secondary)] group-hover:bg-[var(--surface-primary)] px-1.5 py-0.5 rounded border border-[var(--border-primary)]">
                      {humanId}
                    </span>
                  </Link>
                </td>

                {/* Description & Payee */}
                <td className="py-3.5 px-4">
                  <Link to={`/transactions/${t.id}`} className="block">
                    <div className="font-medium text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                      {t.description}
                      {isVoided && (
                        <span className="text-expense-600 text-xs ml-2 font-normal">(Voided)</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                      <span>{t.person}</span>
                    </div>
                  </Link>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Link to={`/transactions/${t.id}`} className="block">
                    <span className="inline-flex items-center text-xs text-[var(--text-secondary)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded border border-[var(--border-primary)]">
                      {getCategoryLabel(t.category)}
                    </span>
                  </Link>
                </td>

                {/* Type badge with text & icon */}
                <td className="py-3.5 px-4 whitespace-nowrap text-center">
                  <Link to={`/transactions/${t.id}`} className="inline-block">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
                        isIncome
                          ? 'bg-income-50 text-income-700 border-income-200 dark:bg-income-700/20 dark:text-income-600 dark:border-income-800/40'
                          : 'bg-expense-50 text-expense-700 border-expense-200 dark:bg-expense-700/20 dark:text-expense-600 dark:border-expense-800/40'
                      )}
                    >
                      {isIncome ? (
                        <>
                          <ArrowDownRight size={13} className="shrink-0" />
                          <span>+ Income</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight size={13} className="shrink-0" />
                          <span>− Expense</span>
                        </>
                      )}
                    </span>
                  </Link>
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <Link to={`/transactions/${t.id}`} className="block">
                    <AmountDisplay
                      amount={t.amount}
                      type={t.type}
                      size="sm"
                      showSign
                      className={cn(isVoided && 'line-through opacity-70')}
                    />
                  </Link>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <Link to={`/transactions/${t.id}`} className="inline-block">
                    {isVoided ? (
                      <Badge variant="warning">Voided</Badge>
                    ) : (
                      <Badge variant="neutral">Active</Badge>
                    )}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
