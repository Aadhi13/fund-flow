import type { Transaction, FinancialSummary, TransactionCategory } from '../types';

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  registration: 'Registration',
  sponsorship: 'Sponsorship',
  donation: 'Donation',
  ticket_sales: 'Ticket Sales',
  venue: 'Venue',
  catering: 'Catering',
  equipment: 'Equipment',
  decoration: 'Decoration',
  transport: 'Transport',
  marketing: 'Marketing',
  miscellaneous: 'Miscellaneous',
};

export function getCategoryLabel(category: TransactionCategory): string {
  return CATEGORY_LABELS[category];
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 25000,
    description: 'Registration fees — Batch A (42 students)',
    category: 'registration',
    date: '2026-08-01T10:00:00Z',
    added_by: 'Priya Sharma',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: '2',
    type: 'income',
    amount: 15000,
    description: 'Sponsorship — TechNova Solutions',
    category: 'sponsorship',
    date: '2026-08-02T14:30:00Z',
    added_by: 'Rahul Mehra',
    receipt_url: '#',
    created_at: '2026-08-02T14:30:00Z',
  },
  {
    id: '3',
    type: 'expense',
    amount: 8500,
    description: 'Auditorium booking — Main hall, 2 days',
    category: 'venue',
    date: '2026-08-03T09:00:00Z',
    added_by: 'Priya Sharma',
    receipt_url: '#',
    created_at: '2026-08-03T09:00:00Z',
  },
  {
    id: '4',
    type: 'expense',
    amount: 12000,
    description: 'Catering — Day 1 lunch & snacks (120 pax)',
    category: 'catering',
    date: '2026-08-04T08:00:00Z',
    added_by: 'Ananya Gupta',
    receipt_url: '#',
    created_at: '2026-08-04T08:00:00Z',
  },
  {
    id: '5',
    type: 'income',
    amount: 10000,
    description: 'Sponsorship — CloudBase Inc.',
    category: 'sponsorship',
    date: '2026-08-04T11:00:00Z',
    added_by: 'Rahul Mehra',
    created_at: '2026-08-04T11:00:00Z',
  },
  {
    id: '6',
    type: 'expense',
    amount: 3200,
    description: 'Banner printing & standees (6 units)',
    category: 'marketing',
    date: '2026-08-05T16:00:00Z',
    added_by: 'Priya Sharma',
    receipt_url: '#',
    created_at: '2026-08-05T16:00:00Z',
  },
  {
    id: '7',
    type: 'income',
    amount: 5000,
    description: 'Donation — Alumni association',
    category: 'donation',
    date: '2026-08-06T10:00:00Z',
    added_by: 'Rahul Mehra',
    created_at: '2026-08-06T10:00:00Z',
  },
  {
    id: '8',
    type: 'expense',
    amount: 4500,
    description: 'Sound system rental — 2 days',
    category: 'equipment',
    date: '2026-08-06T15:00:00Z',
    added_by: 'Ananya Gupta',
    receipt_url: '#',
    created_at: '2026-08-06T15:00:00Z',
  },
  {
    id: '9',
    type: 'expense',
    amount: 2800,
    description: 'Stage decoration materials',
    category: 'decoration',
    date: '2026-08-07T09:30:00Z',
    added_by: 'Priya Sharma',
    created_at: '2026-08-07T09:30:00Z',
  },
  {
    id: '10',
    type: 'income',
    amount: 18000,
    description: 'Registration fees — Batch B (30 students)',
    category: 'registration',
    date: '2026-08-08T10:00:00Z',
    added_by: 'Priya Sharma',
    created_at: '2026-08-08T10:00:00Z',
  },
  {
    id: '11',
    type: 'expense',
    amount: 6000,
    description: 'Catering — Day 2 lunch & snacks (120 pax)',
    category: 'catering',
    date: '2026-08-09T08:00:00Z',
    added_by: 'Ananya Gupta',
    receipt_url: '#',
    created_at: '2026-08-09T08:00:00Z',
  },
  {
    id: '12',
    type: 'expense',
    amount: 1500,
    description: 'Transport — Speaker pickup & drop',
    category: 'transport',
    date: '2026-08-09T12:00:00Z',
    added_by: 'Rahul Mehra',
    created_at: '2026-08-09T12:00:00Z',
  },
];

export function getMockSummary(): FinancialSummary {
  const totalIncome = MOCK_TRANSACTIONS
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = MOCK_TRANSACTIONS
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    total_income: totalIncome,
    total_expenses: totalExpenses,
    balance: totalIncome - totalExpenses,
    transaction_count: MOCK_TRANSACTIONS.length,
  };
}

export function getTransaction(id: string): Transaction | undefined {
  return MOCK_TRANSACTIONS.find(t => t.id === id);
}
