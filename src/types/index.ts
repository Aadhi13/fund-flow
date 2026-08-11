// Types shared across the application

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'registration'
  | 'sponsorship'
  | 'donation'
  | 'ticket_sales'
  | 'venue'
  | 'catering'
  | 'equipment'
  | 'decoration'
  | 'transport'
  | 'marketing'
  | 'miscellaneous';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: string; // ISO string
  added_by: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  transaction_count: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
