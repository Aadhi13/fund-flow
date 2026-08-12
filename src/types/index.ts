// Types shared across the application

export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'active' | 'voided';

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

/**
 * Transaction as stored in the database.
 * `amount` comes back as a string from Supabase (numeric/decimal type)
 * but we parse it to number in the data layer.
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory;
  transaction_date: string; // YYYY-MM-DD
  transaction_time: string; // HH:MM
  person: string;
  receipt_path: string | null;
  status: TransactionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * Payload for creating a new transaction.
 * Omits server-managed fields.
 */
export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory;
  transaction_date: string;
  transaction_time: string;
  person: string;
  receipt_path?: string | null;
  notes?: string | null;
}

/**
 * Payload for updating a transaction.
 * All fields optional except what you change.
 */
export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type StudentStatus = 'not_paid' | 'partial' | 'paid' | 'overpaid' | 'inactive';

export interface Student {
  id: string;
  name: string;
  expected_amount: number;
  paid_amount: number;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateStudentInput {
  name: string;
  expected_amount: number;
}

export type UpdateStudentInput = Partial<Omit<Student, 'id' | 'created_at' | 'updated_at' | 'created_by'>>;

export interface StudentSummary {
  total_students: number;
  paid: number;
  partial: number;
  not_paid: number;
  total_expected: number;
  total_collected: number;
  total_remaining: number;
}


export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  transaction_count: number;
}
