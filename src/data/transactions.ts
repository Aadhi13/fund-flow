/**
 * Transaction data access layer.
 *
 * All Supabase queries for the transactions table go through here.
 * Components should never import supabase directly for data operations.
 */

import { supabase } from '../lib/supabase';
import type {
  Transaction,
  FinancialSummary,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../types';

/** Raw row shape from Supabase — amount is a string (numeric type). */
interface TransactionRow {
  id: string;
  type: string;
  amount: string; // numeric comes back as string
  description: string;
  category: string;
  transaction_date: string;
  transaction_time: string;
  person: string;
  receipt_path: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

/** Parse a raw database row into our typed Transaction. */
function parseTransaction(row: TransactionRow): Transaction {
  return {
    ...row,
    amount: parseFloat(row.amount),
  } as Transaction;
}

// ─── Read operations ─────────────────────────────────────────────────────────

/**
 * Fetch all transactions, ordered by date descending.
 * Public users see only active; authenticated users see all (via RLS).
 */
export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })
    .order('transaction_time', { ascending: false });

  if (error) throw error;
  return (data as TransactionRow[]).map(parseTransaction);
}

/**
 * Fetch a single transaction by ID.
 */
export async function getTransaction(id: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return parseTransaction(data as TransactionRow);
}

/**
 * Compute financial summary from active transactions only.
 * Calculated on the client from the fetched data, not from user input.
 */
/**
 * Compute financial summary from active transactions only.
 * Calculated on the client from the fetched data using integer paise
 * arithmetic to prevent floating-point inaccuracies.
 */
export function computeSummary(transactions: Transaction[]): FinancialSummary {
  const active = transactions.filter(t => t.status === 'active');

  const totalIncomePaise = active
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.round(t.amount * 100), 0);

  const totalExpensesPaise = active
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.round(t.amount * 100), 0);

  const balancePaise = totalIncomePaise - totalExpensesPaise;

  return {
    total_income: totalIncomePaise / 100,
    total_expenses: totalExpensesPaise / 100,
    balance: balancePaise / 100,
    transaction_count: active.length,
  };
}

// ─── Write operations (require authentication) ──────────────────────────────

/**
 * Create a new transaction. The created_by field is set from the
 * current authenticated user.
 */
export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...input,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return parseTransaction(data as TransactionRow);
}

/**
 * Update an existing transaction.
 */
export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return parseTransaction(data as TransactionRow);
}

/**
 * Void a transaction (soft delete).
 * Sets status to 'voided' instead of physically deleting.
 */
export async function voidTransaction(id: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'voided' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return parseTransaction(data as TransactionRow);
}
