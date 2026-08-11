import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, ExternalLink, Calendar, User, Tag, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AmountDisplay } from '../components/financial/AmountDisplay';
import { ErrorState } from '../components/ui/ErrorState';
import { getTransaction, getCategoryLabel } from '../data/mock';
import { formatDateTime } from '../lib/utils';

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const transaction = id ? getTransaction(id) : undefined;

  if (!transaction) {
    return (
      <div>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
        <ErrorState
          title="Transaction not found"
          message="This transaction may have been removed or the link is incorrect."
        />
      </div>
    );
  }

  const isIncome = transaction.type === 'income';

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6">
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <Card>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                isIncome ? 'bg-income-50 text-income-600 dark:bg-income-700/20' : 'bg-expense-50 text-expense-600 dark:bg-expense-700/20'
              }`}>
                {isIncome ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div>
                <Badge variant={isIncome ? 'income' : 'expense'} className="mb-1.5">
                  {isIncome ? 'Income' : 'Expense'}
                </Badge>
                <h1 className="text-base font-semibold text-[var(--text-primary)]">
                  {transaction.description}
                </h1>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="py-3 border-y border-[var(--border-primary)]">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Amount</p>
            <AmountDisplay
              amount={transaction.amount}
              type={transaction.type}
              size="lg"
              showSign
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <Tag size={14} className="mt-0.5 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Category</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {getCategoryLabel(transaction.category)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar size={14} className="mt-0.5 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Date</p>
                <p className="text-[var(--text-primary)] font-medium tabular-nums">
                  {formatDateTime(transaction.date)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <User size={14} className="mt-0.5 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Added by</p>
                <p className="text-[var(--text-primary)] font-medium">{transaction.added_by}</p>
              </div>
            </div>
            {transaction.receipt_url && (
              <div className="flex items-start gap-2.5">
                <FileText size={14} className="mt-0.5 text-[var(--text-tertiary)] shrink-0" />
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Receipt</p>
                  <a
                    href={transaction.receipt_url}
                    className="text-[var(--text-accent)] font-medium inline-flex items-center gap-1 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View receipt <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {transaction.notes && (
            <div className="pt-3 border-t border-[var(--border-primary)]">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Notes</p>
              <p className="text-sm text-[var(--text-secondary)]">{transaction.notes}</p>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border-primary)]">
            <p className="text-xs text-[var(--text-tertiary)]">
              Transaction ID: {transaction.id} · Recorded {formatDateTime(transaction.created_at)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
