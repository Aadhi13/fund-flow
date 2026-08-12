import { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Filter,
  X,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AmountDisplay } from '../components/financial/AmountDisplay';
import { TransactionCard } from '../components/financial/TransactionCard';
import { TransactionTable } from '../components/financial/TransactionTable';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatTxnId } from '../lib/utils';
import { CATEGORY_OPTIONS } from '../data/mock';
import type { TransactionType, TransactionCategory } from '../types';

type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low';

export function PublicDashboard() {
  const { transactions, summary, loading, error, refetch } = useTransactions();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TransactionCategory>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Filter transactions
  const activeTransactions = useMemo(() => {
    return transactions.filter((t) => t.status === 'active');
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = activeTransactions;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const humanId = formatTxnId(t.id).toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.person.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          humanId.includes(q) ||
          t.amount.toString().includes(q)
        );
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Sort order
    result = [...result].sort((a, b) => {
      if (sortOption === 'newest') {
        const dateA = `${a.transaction_date}T${a.transaction_time || '00:00:00'}`;
        const dateB = `${b.transaction_date}T${b.transaction_time || '00:00:00'}`;
        return dateB.localeCompare(dateA);
      }
      if (sortOption === 'oldest') {
        const dateA = `${a.transaction_date}T${a.transaction_time || '00:00:00'}`;
        const dateB = `${b.transaction_date}T${b.transaction_time || '00:00:00'}`;
        return dateA.localeCompare(dateB);
      }
      if (sortOption === 'amount-high') {
        return b.amount - a.amount;
      }
      if (sortOption === 'amount-low') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [activeTransactions, searchQuery, typeFilter, categoryFilter, sortOption]);

  const hasActiveFilters =
    searchQuery !== '' || typeFilter !== 'all' || categoryFilter !== 'all' || sortOption !== 'newest';

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSortOption('newest');
  };

  if (loading) {
    return <LoadingState message="Fetching financial records from Supabase…" />;
  }

  if (error) {
    return <ErrorState title="Failed to load public records" message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Transparency Statement */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Event Financial Ledger
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              TechFest 2026 — Public Financial Transparency Record
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-50 text-accent-700 border border-accent-200 dark:bg-accent-950/40 dark:text-accent-400 dark:border-accent-800/40">
            <ShieldCheck size={14} className="text-accent-600 dark:text-accent-400" />
            <span>Public Ledger</span>
          </div>
        </div>

        {/* Factual Transparency Statement */}
        <div className="p-3.5 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-lg text-xs sm:text-sm text-[var(--text-secondary)] flex items-start gap-2.5 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse" />
          <p className="leading-relaxed">
            All recorded income and expenses for this event are published here for public transparency.
            Every record is independently verifiable.
          </p>
        </div>
      </section>

      {/* 2. Visually Dominant Financial Summary Hierarchy */}
      <section className="space-y-3">
        {/* Dominant Hero Card: Current Balance */}
        <Card className="relative overflow-hidden border-2 border-[var(--border-accent)]/30 bg-gradient-to-br from-[var(--surface-primary)] via-[var(--surface-primary)] to-[var(--surface-secondary)] shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Current Event Balance
                  </span>
                  <Badge variant={summary.balance >= 0 ? 'income' : 'expense'} className="text-[10px]">
                    {summary.balance >= 0 ? 'Surplus' : 'Deficit'}
                  </Badge>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <AmountDisplay
                    amount={summary.balance}
                    size="xl"
                    className="text-[var(--text-primary)] font-extrabold tracking-tight"
                  />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Net remaining funds from total receipts minus total expenditures.
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-600 border border-accent-200 flex items-center justify-center shrink-0 dark:bg-accent-700/20 dark:border-accent-800/50">
                <Wallet size={24} />
              </div>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-primary)]">
            {/* Total Collected */}
            <div className="p-3.5 sm:p-4 flex items-center justify-between sm:block">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-income-50 text-income-700 dark:bg-income-700/20 dark:text-income-600">
                  <TrendingUp size={14} />
                </span>
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                  Total Income
                </span>
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold tabular-nums text-income-700 dark:text-income-600">
                  +{formatCurrency(summary.total_income)}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)]">All verified receipts</p>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="p-3.5 sm:p-4 flex items-center justify-between sm:block">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-expense-50 text-expense-700 dark:bg-expense-700/20 dark:text-expense-600">
                  <TrendingDown size={14} />
                </span>
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                  Total Expenses
                </span>
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold tabular-nums text-expense-700 dark:text-expense-600">
                  −{formatCurrency(summary.total_expenses)}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)]">All approved payouts</p>
              </div>
            </div>

            {/* Active Transactions */}
            <div className="p-3.5 sm:p-4 flex items-center justify-between sm:block">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <FileText size={14} />
                </span>
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                  Active Records
                </span>
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold tabular-nums text-[var(--text-primary)]">
                  {summary.transaction_count} <span className="text-xs font-normal text-[var(--text-tertiary)]">entries</span>
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)]">Publicly listed</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Transaction Ledger Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-primary)] pb-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Transaction Ledger
            </h2>
            <p className="text-xs text-[var(--text-tertiary)]">
              Showing {filteredTransactions.length} of {activeTransactions.length} active records
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-accent)] hover:underline cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw size={13} />
              Reset all filters
            </button>
          )}
        </div>

        {/* Search & Filter Control Bar */}
        <div className="space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="search"
              placeholder="Search by description, person, category, TXN ID, or amount…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls Row: Type Filter, Category Filter, Sort Option */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Type Segmented Buttons */}
            <div className="inline-flex items-center p-0.5 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)]">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  typeFilter === 'income'
                    ? 'bg-income-50 text-income-700 dark:bg-income-900/40 dark:text-income-400 shadow-xs'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                + Income
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  typeFilter === 'expense'
                    ? 'bg-expense-50 text-expense-700 dark:bg-expense-900/40 dark:text-expense-400 shadow-xs'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                − Expense
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="relative flex-1 min-w-[140px] sm:flex-initial">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | TransactionCategory)}
                className="w-full px-2.5 py-1.5 rounded-lg border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-1 focus:ring-[var(--input-focus-ring)] cursor-pointer appearance-none pr-7"
              >
                <option value="all">All Categories</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]" />
            </div>

            {/* Sort Selector */}
            <div className="relative flex-1 min-w-[140px] sm:flex-initial">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full px-2.5 py-1.5 rounded-lg border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-1 focus:ring-[var(--input-focus-ring)] cursor-pointer appearance-none pr-7"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="amount-high">Sort: Highest Amount</option>
                <option value="amount-low">Sort: Lowest Amount</option>
              </select>
              <ArrowUpDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]" />
            </div>
          </div>
        </div>

        {/* Ledger List / Table Container */}
        {activeTransactions.length === 0 ? (
          /* Empty state when NO transactions exist in database */
          <Card padding="md">
            <EmptyState
              icon={<FileText size={36} className="text-[var(--text-tertiary)]" />}
              title="No financial records published yet"
              description="Financial entries recorded by the event organizers will appear here in real time for public transparency."
            />
          </Card>
        ) : filteredTransactions.length === 0 ? (
          /* Empty state when active filters match 0 transactions */
          <Card padding="md">
            <EmptyState
              title="No matching transactions"
              description="No financial records found matching your active search and filter options."
              action={
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 text-xs font-medium text-[var(--text-accent)] bg-accent-50 rounded-md hover:bg-accent-100 dark:bg-accent-950/40 dark:hover:bg-accent-900/60 cursor-pointer border border-accent-200 dark:border-accent-800/40 transition-colors"
                >
                  Clear all search filters
                </button>
              }
            />
          </Card>
        ) : (
          <Card padding="none" className="overflow-hidden border border-[var(--border-primary)]">
            {/* Mobile View: Cards */}
            <div className="sm:hidden divide-y divide-[var(--border-primary)]">
              {filteredTransactions.map((t) => (
                <TransactionCard
                  key={t.id}
                  transaction={t}
                  linkTo={`/transactions/${t.id}`}
                />
              ))}
            </div>

            {/* Desktop View: Full HTML Table */}
            <div className="hidden sm:block">
              <TransactionTable transactions={filteredTransactions} />
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
