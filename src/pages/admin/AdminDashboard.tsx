import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { TransactionCard } from '../../components/financial/TransactionCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { TransactionFormModal } from '../../components/financial/TransactionFormModal';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency } from '../../lib/utils';

import { ExportDropdown } from '../../components/ui/ExportDropdown';

export function AdminDashboard() {
  const { transactions, summary, loading, error, refetch } = useTransactions();
  const [formOpen, setFormOpen] = useState(false);

  if (loading) {
    return <LoadingState message="Loading dashboard…" />;
  }

  if (error) {
    return <ErrorState title="Failed to load data" message={error} onRetry={refetch} />;
  }

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of event finances"
        actions={
          <div className="flex items-center gap-2">
            <ExportDropdown transactions={transactions} summary={summary} />
            <Button
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setFormOpen(true)}
            >
              Add transaction
            </Button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Balance
            </span>
            <Wallet size={14} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
            {formatCurrency(summary.balance)}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Collected
            </span>
            <TrendingUp size={14} className="text-income-600" />
          </div>
          <p className="text-lg font-semibold tabular-nums text-income-600">
            {formatCurrency(summary.total_income)}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Spent
            </span>
            <TrendingDown size={14} className="text-expense-600" />
          </div>
          <p className="text-lg font-semibold tabular-nums text-expense-600">
            {formatCurrency(summary.total_expenses)}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Records
            </span>
            <FileText size={14} className="text-[var(--text-tertiary)]" />
          </div>
          <p className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
            {summary.transaction_count}
          </p>
        </Card>
      </div>

      {/* Recent transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Recent Transactions
          </h2>
          <Link
            to="/admin/transactions"
            className="text-xs text-[var(--text-accent)] hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <Card>
            <EmptyState
              title="No transactions yet"
              description="Add your first transaction or seed demo records to get started."
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
        ) : (
          <Card padding="none">
            {recentTransactions.map(t => (
              <TransactionCard
                key={t.id}
                transaction={t}
                linkTo={`/admin/transactions/${t.id}`}
              />
            ))}
          </Card>
        )}
      </section>

      {/* Transaction Form Modal */}
      <TransactionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
