import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { TransactionCard } from '../../components/financial/TransactionCard';
import { TransactionRow } from '../../components/financial/TransactionRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { MOCK_TRANSACTIONS } from '../../data/mock';
import type { TransactionType } from '../../types';

type FilterType = 'all' | TransactionType;

export function AdminTransactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const filtered = MOCK_TRANSACTIONS
    .filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.added_by.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expenses' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transactions"
        description="Manage all financial records"
        actions={
          <Button size="sm" icon={<Plus size={14} />}>
            Add transaction
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="search"
            placeholder="Search transactions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-1 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-md p-0.5">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filterType === f.value
                  ? 'bg-[var(--surface-tertiary)] text-[var(--text-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-tertiary)]">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No transactions found"
            description={searchQuery ? 'Try a different search term.' : 'No transactions have been recorded yet.'}
          />
        </Card>
      ) : (
        <Card padding="none">
          {/* Mobile: cards */}
          <div className="sm:hidden">
            {filtered.map(t => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </div>
          {/* Desktop: rows */}
          <div className="hidden sm:block">
            {filtered.map(t => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
