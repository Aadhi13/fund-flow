import { useState, useEffect } from 'react';
import { X, Save, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { updateStudent } from '../../data/students';
import type { Student } from '../../types';

interface UpdatePaymentModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export function UpdatePaymentModal({ open, onClose, student, onSuccess }: UpdatePaymentModalProps) {
  const [paidAmount, setPaidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && student) {
      setPaidAmount(student.paid_amount.toString());
      setError(null);
    }
  }, [open, student]);

  if (!open || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(paidAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Paid amount must be a valid number greater than or equal to 0.');
      return;
    }

    setLoading(true);
    try {
      await updateStudent(student.id, {
        expected_amount: student.expected_amount, // Need both to compute status safely in backend wrapper
        paid_amount: amountNum,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = () => {
    setPaidAmount(student.expected_amount.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Update Payment
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-expense-50 text-expense-700 border border-expense-200 rounded-md dark:bg-expense-950/30 dark:text-expense-400 dark:border-expense-800">
              {error}
            </div>
          )}

          <div className="mb-2">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">{student.name}</h3>
            <p className="text-sm text-[var(--text-secondary)]">Expected: ₹{student.expected_amount.toLocaleString('en-IN')}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)] flex justify-between items-center">
              <span>Paid Amount (₹)</span>
              {parseFloat(paidAmount) !== student.expected_amount && (
                <button
                  type="button"
                  onClick={handleMarkPaid}
                  className="text-xs text-income-600 hover:text-income-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Check size={12} /> Mark as Paid
                </button>
              )}
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent text-lg font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} icon={<Save size={16} />}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
