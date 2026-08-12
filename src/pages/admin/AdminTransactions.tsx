import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Ban,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { TransactionFormModal } from '../../components/financial/TransactionFormModal';
import { AmountDisplay } from '../../components/financial/AmountDisplay';
import { useTransactions } from '../../hooks/useTransactions';
import { voidTransaction } from '../../data/transactions';
import { CATEGORY_OPTIONS, getCategoryLabel } from '../../data/mock';
import { formatDateShort, formatTxnId } from '../../lib/utils';
import type {
  Transaction,
  TransactionType,
  TransactionStatus,
  TransactionCategory,
} from '../../types';

type FilterType = 'all' | TransactionType;
type FilterStatus = 'all' | TransactionStatus;
type FilterCategory = 'all' | TransactionCategory;
type SortOrder = 'desc' | 'asc';

const ITEMS_PER_PAGE = 10;

import { ExportDropdown } from '../../components/ui/ExportDropdown';

export function AdminTransactions() {
  const { transactions, summary, loading, error, refetch } = useTransactions();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [voidingTransaction, setVoidingTransaction] = useState<Transaction | null>(null);
  const [voidLoading, setVoidLoading] = useState(false);

  // Feedback banner state
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (filterCategory !== 'all' && t.category !== filterCategory) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const txnId = formatTxnId(t.id).toLowerCase();
          return (
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.person.toLowerCase().includes(q) ||
            txnId.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.transaction_date}T${a.transaction_time || '00:00'}`).getTime();
        const dateB = new Date(`${b.transaction_date}T${b.transaction_time || '00:00'}`).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [transactions, filterType, filterStatus, filterCategory, searchQuery, sortOrder]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle Void
  const handleConfirmVoid = async () => {
    if (!voidingTransaction) return;
    setVoidLoading(true);
    try {
      await voidTransaction(voidingTransaction.id);
      showFeedback(`Transaction ${formatTxnId(voidingTransaction.id)} voided successfully.`);
      setVoidingTransaction(null);
      refetch();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Failed to void transaction');
    } finally {
      setVoidLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading transactions…" />;
  }

  if (error) {
    return <ErrorState title="Failed to load transactions" message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transactions"
        description="Manage and audit all event financial records"
        actions={
          <div className="flex items-center gap-2">
            <ExportDropdown transactions={transactions} summary={summary} />
            <Button
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => {
                setEditingTransaction(null);
                setFormOpen(true);
              }}
            >
              Add transaction
            </Button>
          </div>
        }
      />

      {/* Feedback Alert */}
      {feedback && (
        <div className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-50 text-accent-700 border border-accent-200 rounded-md dark:bg-accent-950/30 dark:text-accent-400 dark:border-accent-800">
          <CheckCircle2 size={16} className="shrink-0 text-accent-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filters bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="search"
              placeholder="Search by description, payee, or TXN-ID…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent"
            />
          </div>

          {/* Type Segmented Control */}
          <div className="flex items-center gap-0.5 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-md p-0.5 shrink-0">
            {(['all', 'income', 'expense'] as FilterType[]).map(type => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer capitalize ${
                  filterType === type
                    ? 'bg-[var(--surface-tertiary)] text-[var(--text-primary)] font-semibold'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row of Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Category Select */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value as FilterCategory);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as FilterStatus);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="voided">Voided Only</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border bg-[var(--surface-primary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
          >
            <ArrowUpDown size={14} />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          {/* Record Count Badge */}
          <div className="flex items-center justify-end px-2 text-xs text-[var(--text-tertiary)] font-medium">
            {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <Card>
          <EmptyState
            title="No transactions yet"
            description="Add your first transaction or populate sample records to get started."
            action={
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  Add transaction
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const { seedSampleData } = await import('../../data/seed');
                    await seedSampleData();
                    refetch();
                  }}
                >
                  Seed demo data
                </Button>
              </div>
            }
          />
        </Card>
      ) : filteredTransactions.length === 0 ? (
        <Card>
          <EmptyState
            title="No transactions found"
            description={searchQuery ? 'Try a different search term or clear your filters.' : 'No records match the selected filters.'}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          <Card padding="none">
            {/* Mobile Layout (Cards) */}
            <div className="sm:hidden divide-y divide-[var(--border-primary)]">
              {paginatedTransactions.map(t => {
                const isIncome = t.type === 'income';
                const isVoided = t.status === 'voided';
                return (
                  <div key={t.id} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                          {formatTxnId(t.id)}
                        </span>
                        <h3 className="text-sm font-medium text-[var(--text-primary)] leading-tight">
                          {t.description}
                        </h3>
                      </div>
                      <AmountDisplay
                        amount={t.amount}
                        type={t.type}
                        size="sm"
                        showSign
                        className={isVoided ? 'line-through opacity-60' : undefined}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={isIncome ? 'income' : 'expense'}>
                          {getCategoryLabel(t.category)}
                        </Badge>
                        {isVoided && <Badge variant="warning">Voided</Badge>}
                      </div>
                      <span>{formatDateShort(t.transaction_date)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-primary)] text-xs">
                      <span className="text-[var(--text-secondary)] truncate max-w-[140px]">
                        Payee: {t.person}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/transactions/${t.id}`}
                          className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        {!isVoided && (
                          <>
                            <button
                              onClick={() => {
                                setEditingTransaction(t);
                                setFormOpen(true);
                              }}
                              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                              title="Edit Transaction"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setVoidingTransaction(t)}
                              className="p-1 text-expense-600 hover:text-expense-700 cursor-pointer"
                              title="Void Transaction"
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">TXN ID</th>
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Description / Payee</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {paginatedTransactions.map(t => {
                    const isIncome = t.type === 'income';
                    const isVoided = t.status === 'voided';
                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-[var(--surface-secondary)] transition-colors ${
                          isVoided ? 'opacity-60 bg-[var(--surface-secondary)]/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-xs font-mono text-[var(--text-tertiary)] whitespace-nowrap">
                          {formatTxnId(t.id)}
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                          <div>{formatDateShort(t.transaction_date)}</div>
                          <div className="text-[var(--text-tertiary)]">
                            {t.transaction_time ? t.transaction_time.slice(0, 5) : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 min-w-[200px]">
                          <p className="font-medium text-[var(--text-primary)]">{t.description}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{t.person}</p>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant={isIncome ? 'income' : 'expense'}>
                            {getCategoryLabel(t.category)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isVoided ? (
                            <Badge variant="warning">Voided</Badge>
                          ) : (
                            <Badge variant="neutral">Active</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <AmountDisplay
                            amount={t.amount}
                            type={t.type}
                            size="sm"
                            showSign
                            className={isVoided ? 'line-through opacity-70' : undefined}
                          />
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              to={`/transactions/${t.id}`}
                              className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </Link>
                            {!isVoided && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingTransaction(t);
                                    setFormOpen(true);
                                  }}
                                  className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
                                  title="Edit Transaction"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => setVoidingTransaction(t)}
                                  className="p-1 rounded text-expense-600 hover:text-expense-700 hover:bg-expense-50 dark:hover:bg-expense-950/40 transition-colors cursor-pointer"
                                  title="Void Transaction"
                                >
                                  <Ban size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1 text-xs text-[var(--text-tertiary)]">
              <span>
                Showing { (currentPage - 1) * ITEMS_PER_PAGE + 1 }–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of{' '}
                {filteredTransactions.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  icon={<ChevronLeft size={14} />}
                >
                  Prev
                </Button>
                <span className="px-2 font-medium text-[var(--text-secondary)]">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span className="flex items-center gap-1">
                    Next <ChevronRight size={14} />
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Form Modal (Create / Edit) */}
      <TransactionFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTransaction(null);
        }}
        initialData={editingTransaction}
        onSuccess={() => {
          showFeedback(
            editingTransaction
              ? 'Transaction updated successfully.'
              : 'New transaction recorded successfully.',
          );
          refetch();
        }}
      />

      {/* Confirm Void Modal */}
      {voidingTransaction && (
        <ConfirmModal
          open={Boolean(voidingTransaction)}
          onClose={() => setVoidingTransaction(null)}
          onConfirm={handleConfirmVoid}
          title="Void Transaction"
          confirmText="Void Transaction"
          loading={voidLoading}
          variant="danger"
          description={
            <div className="space-y-2">
              <p>
                Are you sure you want to void transaction{' '}
                <strong className="text-[var(--text-primary)]">
                  {formatTxnId(voidingTransaction.id)}
                </strong>{' '}
                ({voidingTransaction.description})?
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                • Voiding will remove this amount from event financial totals.
                <br />
                • The record will remain permanently visible in history for audit purposes.
                <br />• This operation cannot be undone.
              </p>
            </div>
          }
        />
      )}
    </div>
  );
}
