import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Calendar,
  User,
  Tag,
  FileText,
  Clock,
  ShieldCheck,
  Edit2,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AmountDisplay } from '../components/financial/AmountDisplay';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TransactionFormModal } from '../components/financial/TransactionFormModal';
import { getCategoryLabel } from '../data/mock';
import { getTransaction, voidTransaction } from '../data/transactions';
import { formatDate, formatDateTime, formatTxnId } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import type { Transaction } from '../types';

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Organizer Actions state
  const [editOpen, setEditOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidLoading, setVoidLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTransaction = () => {
    if (!id) return;
    setLoading(true);
    getTransaction(id)
      .then(data => {
        setTransaction(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load transaction');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const handleConfirmVoid = async () => {
    if (!transaction) return;
    setVoidLoading(true);
    try {
      await voidTransaction(transaction.id);
      setVoidOpen(false);
      setFeedback('Transaction voided successfully.');
      fetchTransaction();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to void transaction');
    } finally {
      setVoidLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <LoadingState message="Loading transaction details…" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <ErrorState
          title="Transaction not found"
          message={error || 'This transaction record does not exist or has been restricted.'}
        />
      </div>
    );
  }

  const isIncome = transaction.type === 'income';
  const isVoided = transaction.status === 'voided';
  const humanId = formatTxnId(transaction.id);

  return (
    <div className="space-y-4">
      {/* Navigation & Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {user && !isVoided && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={<Edit2 size={14} />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={<Ban size={14} />}
              onClick={() => setVoidOpen(true)}
            >
              Void
            </Button>
          </div>
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-50 text-accent-700 border border-accent-200 rounded-md dark:bg-accent-950/30 dark:text-accent-400">
          <CheckCircle2 size={16} className="shrink-0 text-accent-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Transaction Details Card */}
      <Card>
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                  isIncome
                    ? 'bg-income-50 text-income-600 dark:bg-income-700/20'
                    : 'bg-expense-50 text-expense-600 dark:bg-expense-700/20'
                }`}
              >
                {isIncome ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-[var(--text-tertiary)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded border border-[var(--border-primary)]">
                    {humanId}
                  </span>
                  <Badge variant={isIncome ? 'income' : 'expense'}>
                    {isIncome ? 'Income' : 'Expense'}
                  </Badge>
                  {isVoided ? (
                    <Badge variant="warning">Voided</Badge>
                  ) : (
                    <Badge variant="neutral">Active</Badge>
                  )}
                </div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
                  {transaction.description}
                </h1>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="py-4 border-y border-[var(--border-primary)]">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Transaction Amount</p>
            <AmountDisplay
              amount={transaction.amount}
              type={transaction.type}
              size="xl"
              showSign
              className={isVoided ? 'line-through opacity-60' : undefined}
            />
            {isVoided && (
              <p className="text-xs text-expense-600 mt-1 font-medium">
                • This transaction is voided and excluded from active event financial balances.
              </p>
            )}
          </div>

          {/* Key Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <Tag size={16} className="mt-0.5 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Category</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {getCategoryLabel(transaction.category)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar size={16} className="mt-0.5 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Date & Time</p>
                <p className="text-[var(--text-primary)] font-medium tabular-nums">
                  {formatDate(transaction.transaction_date)}
                  {transaction.transaction_time && transaction.transaction_time !== '00:00:00'
                    ? ` at ${transaction.transaction_time.slice(0, 5)}`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User size={16} className="mt-0.5 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Person / Payee / Source</p>
                <p className="text-[var(--text-primary)] font-medium">{transaction.person}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="mt-0.5 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Status</p>
                <p className="text-[var(--text-primary)] font-medium capitalize">
                  {transaction.status}
                </p>
              </div>
            </div>
          </div>

          {/* Notes (if present) */}
          {transaction.notes && (
            <div className="pt-3 border-t border-[var(--border-primary)] space-y-1">
              <p className="text-xs text-[var(--text-tertiary)] font-medium">Organizer Notes</p>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                {transaction.notes}
              </p>
            </div>
          )}

          {/* Prepared Receipt Area */}
          <div className="pt-3 border-t border-[var(--border-primary)] space-y-2">
            <p className="text-xs text-[var(--text-tertiary)] font-medium">Receipt Document</p>
            {transaction.receipt_path ? (
              <div className="flex items-center gap-2 p-3 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-md">
                <FileText size={18} className="text-[var(--text-accent)] shrink-0" />
                <a
                  href={transaction.receipt_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--text-accent)] hover:underline inline-flex items-center gap-1"
                >
                  View uploaded receipt document <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-md text-xs text-[var(--text-tertiary)]">
                <FileText size={16} className="shrink-0" />
                <span>No receipt image uploaded. Receipt attachments will be supported in a future update.</span>
              </div>
            )}
          </div>

          {/* Audit Timestamps Footer */}
          <div className="pt-4 border-t border-[var(--border-primary)] text-xs text-[var(--text-tertiary)] space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Created: {formatDateTime(transaction.created_at)}
              </span>
              <span>Updated: {formatDateTime(transaction.updated_at)}</span>
            </div>
            <p className="font-mono text-[11px] truncate">
              Database UUID: {transaction.id} · Creator ID: {transaction.created_by}
            </p>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <TransactionFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={transaction}
        onSuccess={() => {
          setFeedback('Transaction updated successfully.');
          fetchTransaction();
        }}
      />

      {/* Void Modal */}
      <ConfirmModal
        open={voidOpen}
        onClose={() => setVoidOpen(false)}
        onConfirm={handleConfirmVoid}
        title="Void Transaction"
        confirmText="Void Transaction"
        loading={voidLoading}
        variant="danger"
        description={
          <div className="space-y-2">
            <p>
              Are you sure you want to void{' '}
              <strong className="text-[var(--text-primary)]">{humanId}</strong> ({transaction.description})?
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              • The transaction amount ({transaction.amount}) will be subtracted from current financial calculations.
              <br />
              • The record will remain in event history permanently marked as voided.
              <br />• This operation cannot be undone.
            </p>
          </div>
        }
      />
    </div>
  );
}
