import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  User,
  Tag,
  FileText,
  Clock,
  ShieldCheck,
  Edit2,
  Ban,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
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
import { formatDate, formatDateTime, formatTxnId, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import type { Transaction } from '../types';

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Organizer Actions state
  const [editOpen, setEditOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidLoading, setVoidLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTransaction = () => {
    if (!id) return;
    setLoading(true);
    getTransaction(id)
      .then((data) => {
        setTransaction(data);
        setLoading(false);
      })
      .catch((err) => {
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

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Public Ledger
        </button>
        <LoadingState message="Verifying transaction record…" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Public Ledger
        </button>
        <ErrorState
          title="Transaction record not found"
          message={error || 'This transaction record does not exist or has been restricted.'}
        />
      </div>
    );
  }

  const isIncome = transaction.type === 'income';
  const isVoided = transaction.status === 'voided';
  const humanId = formatTxnId(transaction.id);

  // Format date and time for verification record hierarchy
  const formattedDate = formatDate(transaction.transaction_date);
  const formattedTime =
    transaction.transaction_time && transaction.transaction_time !== '00:00:00'
      ? transaction.transaction_time.slice(0, 5)
      : null;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Top Bar: Navigation & Authenticated Organizer Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Public Ledger
        </button>

        {/* Show organizer management buttons ONLY when authenticated */}
        {user && !isVoided && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={<Edit2 size={13} />}
              onClick={() => setEditOpen(true)}
            >
              Edit Entry
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={<Ban size={13} />}
              onClick={() => setVoidOpen(true)}
            >
              Void Entry
            </Button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 text-xs bg-accent-50 text-accent-700 border border-accent-200 rounded-lg dark:bg-accent-950/40 dark:text-accent-400 dark:border-accent-800/40">
          <CheckCircle2 size={15} className="shrink-0 text-accent-600 dark:text-accent-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Public Verification Card */}
      <Card className="overflow-hidden border border-[var(--border-primary)] shadow-sm">
        {/* Verification Record Stamp Header */}
        <div className="p-4 sm:p-5 bg-[var(--surface-secondary)] border-b border-[var(--border-primary)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Public Verification Record
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Verified Event Transaction Entry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isVoided ? (
              <Badge variant="warning">Status: Voided</Badge>
            ) : (
              <Badge variant="income">Status: Active</Badge>
            )}
          </div>
        </div>

        {/* Conceptual Hierarchy Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* 1. Transaction Header & Reference ID */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Transaction Identifier
              </span>
              <button
                onClick={() => handleCopyId(humanId)}
                className="inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                title="Copy reference ID"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : humanId}</span>
              </button>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-wide">
              {humanId}
            </p>
          </div>

          <hr className="border-t border-[var(--border-primary)]" />

          {/* 2. Type & Amount Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border',
                  isIncome
                    ? 'bg-income-50 text-income-700 border-income-200 dark:bg-income-700/20 dark:text-income-600 dark:border-income-800/40'
                    : 'bg-expense-50 text-expense-700 border-expense-200 dark:bg-expense-700/20 dark:text-expense-600 dark:border-expense-800/40'
                )}
              >
                {isIncome ? (
                  <>
                    <ArrowDownRight size={14} />
                    <span>INCOME RECORD</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight size={14} />
                    <span>EXPENSE RECORD</span>
                  </>
                )}
              </span>

              <span className="text-xs text-[var(--text-tertiary)]">·</span>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] font-medium">
                <Tag size={13} className="text-[var(--text-tertiary)]" />
                {getCategoryLabel(transaction.category)}
              </span>
            </div>

            <div className="pt-1">
              <AmountDisplay
                amount={transaction.amount}
                type={transaction.type}
                size="xl"
                showSign
                className={cn('font-black text-3xl sm:text-4xl', isVoided && 'line-through opacity-60')}
              />
            </div>

            {isVoided && (
              <p className="text-xs text-expense-600 font-medium mt-1">
                • This transaction is marked as VOIDED and is excluded from active event balances.
              </p>
            )}
          </div>

          <hr className="border-t border-[var(--border-primary)]" />

          {/* 3. Payee & Description Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] flex items-center gap-1">
                <User size={13} />
                {isIncome ? 'Received From / Source' : 'Paid To / Payee'}
              </span>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {transaction.person}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-tertiary)] flex items-center gap-1">
                <FileText size={13} />
                Description / Purpose
              </span>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {transaction.description}
              </p>
            </div>
          </div>

          {/* Notes if published */}
          {transaction.notes && (
            <div className="p-3 bg-[var(--surface-secondary)] rounded-lg text-xs space-y-1 border border-[var(--border-primary)]">
              <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-[10px]">
                Public Note / Remarks
              </span>
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
                {transaction.notes}
              </p>
            </div>
          )}

          <hr className="border-t border-[var(--border-primary)]" />

          {/* 4. Timestamp & Verification Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[var(--text-tertiary)] flex items-center gap-1 font-medium">
                <Calendar size={13} />
                Transaction Date & Time
              </span>
              <p className="font-semibold text-[var(--text-primary)] tabular-nums">
                {formattedDate} {formattedTime ? `· ${formattedTime}` : ''}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[var(--text-tertiary)] flex items-center gap-1 font-medium">
                <Clock size={13} />
                Audit Timestamps
              </span>
              <div className="text-[var(--text-secondary)] tabular-nums space-y-0.5 text-[11px]">
                <p>Recorded: {formatDateTime(transaction.created_at)}</p>
                <p>Last Modified: {formatDateTime(transaction.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* 5. Receipt Document Section */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-medium text-[var(--text-tertiary)] flex items-center gap-1">
              <FileText size={13} />
              Verification Document / Receipt
            </span>

            {transaction.receipt_path ? (
              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded bg-accent-50 text-accent-600 dark:bg-accent-700/20 dark:text-accent-400">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      Receipt Attachment Available
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                      Verified proof document for this transaction
                    </p>
                  </div>
                </div>
                <a
                  href={transaction.receipt_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-accent-600 rounded-md hover:bg-accent-700 inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <span>View receipt</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ) : (
              <div className="p-4 bg-[var(--surface-secondary)]/70 border border-dashed border-[var(--border-primary)] rounded-lg text-center space-y-1">
                <FileText size={20} className="mx-auto text-[var(--text-tertiary)]" />
                <p className="text-xs font-semibold text-[var(--text-secondary)]">
                  Receipt not available
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] max-w-sm mx-auto">
                  No proof receipt file was attached when recording this entry.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info: Public notice */}
        <div className="p-3.5 bg-[var(--surface-secondary)] border-t border-[var(--border-primary)] text-center text-[11px] text-[var(--text-tertiary)]">
          This record is published for public event financial transparency. All data is verified from the database.
        </div>
      </Card>

      {/* Edit Modal (Only accessible by logged-in organizers) */}
      {user && (
        <TransactionFormModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initialData={transaction}
          onSuccess={() => {
            setFeedback('Transaction entry updated successfully.');
            fetchTransaction();
          }}
        />
      )}

      {/* Void Modal (Only accessible by logged-in organizers) */}
      {user && (
        <ConfirmModal
          open={voidOpen}
          onClose={() => setVoidOpen(false)}
          onConfirm={handleConfirmVoid}
          title="Void Transaction"
          confirmText="Void Transaction"
          loading={voidLoading}
          variant="danger"
          description={
            <div className="space-y-2 text-xs">
              <p>
                Are you sure you want to void record{' '}
                <strong className="text-[var(--text-primary)]">{humanId}</strong> ({transaction.description})?
              </p>
              <p className="text-[var(--text-tertiary)]">
                • The amount ({transaction.amount}) will be removed from active balance totals.
                <br />
                • The record remains in public ledger marked permanently as voided.
              </p>
            </div>
          }
        />
      )}
    </div>
  );
}
