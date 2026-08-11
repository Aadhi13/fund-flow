import { useState } from 'react';
import {
  Search,
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AmountDisplay } from '../components/financial/AmountDisplay';
import { TransactionCard } from '../components/financial/TransactionCard';
import { TransactionRow } from '../components/financial/TransactionRow';
import { MOCK_TRANSACTIONS, getMockSummary } from '../data/mock';
import { formatCurrency } from '../lib/utils';

export function PublicDashboard() {
  const summary = getMockSummary();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = searchQuery
    ? MOCK_TRANSACTIONS.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_TRANSACTIONS;

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Event header */}
      <section>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          TechFest 2026 — Financial Report
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-lg">
          Complete record of all money collected and spent for this event.
          Every transaction is publicly verifiable.
        </p>
      </section>

      {/* Balance highlight */}
      <Card className="!p-0 overflow-hidden">
        <div className="px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                Current Balance
              </p>
              <AmountDisplay
                amount={summary.balance}
                size="xl"
                className="mt-1 text-[var(--text-primary)]"
              />
            </div>
            <div className="w-10 h-10 bg-accent-50 text-accent-600 rounded-lg flex items-center justify-center dark:bg-accent-700/20">
              <Wallet size={20} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-[var(--border-primary)] divide-x divide-[var(--border-primary)]">
          <div className="px-3 py-3 sm:px-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={12} className="text-income-600" />
              <span className="text-xs text-[var(--text-tertiary)]">Collected</span>
            </div>
            <p className="text-sm font-semibold tabular-nums text-income-600">
              {formatCurrency(summary.total_income)}
            </p>
          </div>
          <div className="px-3 py-3 sm:px-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={12} className="text-expense-600" />
              <span className="text-xs text-[var(--text-tertiary)]">Spent</span>
            </div>
            <p className="text-sm font-semibold tabular-nums text-expense-600">
              {formatCurrency(summary.total_expenses)}
            </p>
          </div>
          <div className="px-3 py-3 sm:px-4">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText size={12} className="text-[var(--text-tertiary)]" />
              <span className="text-xs text-[var(--text-tertiary)]">Records</span>
            </div>
            <p className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
              {summary.transaction_count}
            </p>
          </div>
        </div>
      </Card>

      {/* Transaction list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            All Transactions
          </h2>
          <Badge variant="neutral">{sortedTransactions.length} records</Badge>
        </div>

        {/* Search */}
        <div className="mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="search"
              placeholder="Search transactions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent"
            />
          </div>
        </div>

        <Card padding="none">
          {sortedTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--text-tertiary)]">
                No transactions match your search.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="sm:hidden">
                {sortedTransactions.map(t => (
                  <TransactionCard
                    key={t.id}
                    transaction={t}
                    linkTo={`/transactions/${t.id}`}
                  />
                ))}
              </div>
              {/* Desktop: rows */}
              <div className="hidden sm:block">
                {sortedTransactions.map(t => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    linkTo={`/transactions/${t.id}`}
                  />
                ))}
              </div>
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
