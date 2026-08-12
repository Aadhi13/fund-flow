import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';
import { getCategoryLabel } from '../../data/mock';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Transaction } from '../../types';

interface FinancialAnalyticsProps {
  transactions: Transaction[];
}

export function FinancialAnalytics({ transactions }: FinancialAnalyticsProps) {
  // Only process active transactions
  const activeTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'active')
      .sort((a, b) => {
        const dateA = `${a.transaction_date}T${a.transaction_time || '00:00:00'}`;
        const dateB = `${b.transaction_date}T${b.transaction_time || '00:00:00'}`;
        return dateA.localeCompare(dateB);
      });
  }, [transactions]);

  // 1. Balance & Trend over time (grouped by date)
  const timeData = useMemo(() => {
    if (activeTransactions.length === 0) return [];

    const dateMap = new Map<
      string,
      { date: string; income: number; expense: number }
    >();

    activeTransactions.forEach((t) => {
      const dateKey = t.transaction_date;
      const existing = dateMap.get(dateKey) || {
        date: dateKey,
        income: 0,
        expense: 0,
      };

      if (t.type === 'income') {
        existing.income += t.amount;
      } else {
        existing.expense += t.amount;
      }
      dateMap.set(dateKey, existing);
    });

    const sortedDates = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    let cumulativeBalance = 0;
    return sortedDates.map((item) => {
      cumulativeBalance += item.income - item.expense;
      return {
        date: item.date,
        formattedDate: formatDate(item.date),
        income: Math.round(item.income * 100) / 100,
        expense: Math.round(item.expense * 100) / 100,
        balance: Math.round(cumulativeBalance * 100) / 100,
      };
    });
  }, [activeTransactions]);

  // 2. Expense breakdown by category
  const categoryData = useMemo(() => {
    const expenses = activeTransactions.filter((t) => t.type === 'expense');
    if (expenses.length === 0) return [];

    const catMap = new Map<string, number>();
    let totalExpenseAmount = 0;

    expenses.forEach((t) => {
      const prev = catMap.get(t.category) || 0;
      catMap.set(t.category, prev + t.amount);
      totalExpenseAmount += t.amount;
    });

    return Array.from(catMap.entries())
      .map(([catKey, amount]) => ({
        categoryKey: catKey,
        categoryName: getCategoryLabel(catKey as any),
        amount: Math.round(amount * 100) / 100,
        percentage:
          totalExpenseAmount > 0
            ? Math.round((amount / totalExpenseAmount) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeTransactions]);

  const totalExpense = useMemo(
    () =>
      activeTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [activeTransactions]
  );

  if (activeTransactions.length === 0) {
    return (
      <Card padding="md" className="text-center space-y-1">
        <p className="text-xs font-semibold text-[var(--text-secondary)]">
          Analytics Unavailable
        </p>
        <p className="text-[11px] text-[var(--text-tertiary)] max-w-sm mx-auto">
          Add active financial records to generate real-time balance trends and category breakdowns.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border-primary)] pb-2">
        <h2 className="text-base font-bold text-[var(--text-primary)]">
          Financial Analytics & Trends
        </h2>
        <p className="text-xs text-[var(--text-tertiary)]">
          Real-time performance metrics derived from active transaction ledger entries.
        </p>
      </div>

      {/* Grid: Balance Over Time & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Balance Over Time Chart */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Balance Over Time
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Cumulative available fund trend
              </p>
            </div>
            <span className="text-xs font-semibold text-accent-600 dark:text-accent-400">
              {formatCurrency(timeData[timeData.length - 1]?.balance || 0)}
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-primary)"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
                  }}
                  tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `₹${val}`}
                  tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-lg shadow-md text-xs space-y-1">
                          <p className="font-semibold text-[var(--text-primary)]">
                            {data.formattedDate}
                          </p>
                          <p className="text-accent-600 dark:text-accent-400 font-bold">
                            Balance: {formatCurrency(data.balance)}
                          </p>
                          <div className="text-[11px] text-[var(--text-tertiary)] pt-1 border-t border-[var(--border-primary)] space-y-0.5">
                            <p className="text-income-600">+ Income: {formatCurrency(data.income)}</p>
                            <p className="text-expense-600">− Expense: {formatCurrency(data.expense)}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Spending Breakdown */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Expense Categories
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Distribution of total spent funds
              </p>
            </div>
            <span className="text-xs font-semibold text-expense-600 dark:text-expense-400">
              {formatCurrency(totalExpense)}
            </span>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs font-medium text-[var(--text-secondary)]">No expenses recorded yet</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">Category breakdowns appear when expense entries exist.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {categoryData.map((item) => (
                <div key={item.categoryKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-primary)]">
                      {item.categoryName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-tertiary)] text-[11px]">
                        {item.percentage}%
                      </span>
                      <span className="font-bold text-[var(--text-primary)] tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                  {/* Custom Accessible Progress Bar */}
                  <div className="w-full bg-[var(--surface-tertiary)] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-accent-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Income vs Expenses Cashflow Chart */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Income vs Expenses Activity
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Daily incoming revenue vs outgoing payouts
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-income-700 dark:text-income-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-income-600 inline-block" />
              Income
            </span>
            <span className="flex items-center gap-1 text-expense-700 dark:text-expense-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-expense-600 inline-block" />
              Expense
            </span>
          </div>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
              <XAxis
                dataKey="date"
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
                }}
                tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => `₹${val}`}
                tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-lg shadow-md text-xs space-y-1">
                        <p className="font-semibold text-[var(--text-primary)]">{data.formattedDate}</p>
                        <p className="text-income-600 font-semibold">+ Income: {formatCurrency(data.income)}</p>
                        <p className="text-expense-600 font-semibold">− Expense: {formatCurrency(data.expense)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="income" fill="#16a34a" radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expense" fill="#dc2626" radius={[3, 3, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
