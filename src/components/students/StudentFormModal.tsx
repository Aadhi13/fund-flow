import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { createStudent, updateStudent } from '../../data/students';
import type { Student } from '../../types';

interface StudentFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Student | null;
  onSuccess: () => void;
}

export function StudentFormModal({ open, onClose, initialData, onSuccess }: StudentFormModalProps) {
  const [name, setName] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setExpectedAmount(initialData.expected_amount.toString());
      } else {
        setName('');
        setExpectedAmount('500'); // Default
      }
      setError(null);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(expectedAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Expected amount must be a valid number greater than or equal to 0.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    try {
      if (initialData) {
        await updateStudent(initialData.id, {
          name: name.trim(),
          expected_amount: amountNum,
        });
      } else {
        await createStudent({
          name: name.trim(),
          expected_amount: amountNum,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {initialData ? 'Edit Student' : 'Add Student'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3 text-xs bg-expense-50 text-expense-700 border border-expense-200 rounded-md dark:bg-expense-950/30 dark:text-expense-400 dark:border-expense-800">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">Expected Amount (₹)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={expectedAmount}
              onChange={(e) => setExpectedAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent"
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
