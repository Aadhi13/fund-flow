import { useState, useEffect, useCallback } from 'react';
import { getTransactions, computeSummary } from '../data/transactions';
import type { Transaction, FinancialSummary } from '../types';

interface UseTransactionsResult {
  transactions: Transaction[];
  summary: FinancialSummary;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetch transactions and compute summary.
 * Provides loading/error states and a refetch callback.
 */
export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const summary = computeSummary(transactions);

  return { transactions, summary, loading, error, refetch: fetch };
}
