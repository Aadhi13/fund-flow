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
import { MOCK_TRANSACTIONS, getMockSummary } from '../../data/mock';
import { formatCurrency } from '../../lib/utils';

export function AdminDashboard() {
  const summary = getMockSummary();
  const recentTransactions = [...MOCK_TRANSACTIONS]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of event finances"
        actions={
          <Button size="sm" icon={<Plus size={14} />}>
            Add transaction
          </Button>
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
        <Card padding="none">
          {recentTransactions.map(t => (
            <TransactionCard key={t.id} transaction={t} />
          ))}
        </Card>
      </section>
    </div>
  );
}
