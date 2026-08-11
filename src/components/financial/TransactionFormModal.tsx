import { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CATEGORY_OPTIONS } from '../../data/mock';
import { createTransaction, updateTransaction } from '../../data/transactions';
import type { Transaction, TransactionType, TransactionCategory } from '../../types';

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
  onSuccess: () => void;
}

export function TransactionFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: TransactionFormModalProps) {
  const isEditing = Boolean(initialData);

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('miscellaneous');
  const [transactionDate, setTransactionDate] = useState(getTodayDate());
  const [transactionTime, setTransactionTime] = useState(getCurrentTime());
  const [person, setPerson] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setDescription(initialData.description);
      setCategory(initialData.category);
      setTransactionDate(initialData.transaction_date || getTodayDate());
      setTransactionTime(initialData.transaction_time ? initialData.transaction_time.slice(0, 5) : getCurrentTime());
      setPerson(initialData.person);
      setNotes(initialData.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setCategory('miscellaneous');
      setTransactionDate(getTodayDate());
      setTransactionTime(getCurrentTime());
      setPerson('');
      setNotes('');
    }
    setFormError(null);
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid positive amount.';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }

    if (!person.trim()) {
      newErrors.person = 'Person/Payee name is required.';
    }

    if (!transactionDate) {
      newErrors.transactionDate = 'Date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;

      if (isEditing && initialData) {
        await updateTransaction(initialData.id, {
          type,
          amount: parsedAmount,
          description: description.trim(),
          category,
          transaction_date: transactionDate,
          transaction_time: transactionTime || '00:00',
          person: person.trim(),
          notes: notes.trim() || null,
        });
      } else {
        await createTransaction({
          type,
          amount: parsedAmount,
          description: description.trim(),
          category,
          transaction_date: transactionDate,
          transaction_time: transactionTime || '00:00',
          person: person.trim(),
          notes: notes.trim() || null,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Record New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-income-50 border-income-600 text-income-700 dark:bg-income-700/20 dark:text-income-400 dark:border-income-500'
                  : 'bg-[var(--surface-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowDownRight size={16} />
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-expense-50 border-expense-600 text-expense-700 dark:bg-expense-700/20 dark:text-expense-400 dark:border-expense-500'
                  : 'bg-[var(--surface-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowUpRight size={16} />
              Expense
            </button>
          </div>
        </div>

        {/* Amount */}
        <Input
          label="Amount (₹)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          required
        />

        {/* Description */}
        <Input
          label="Description"
          type="text"
          placeholder="e.g., Tech Workshop Sponsorship"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />

        {/* Person / Payee */}
        <Input
          label="Person / Payee / Source"
          type="text"
          placeholder="e.g., John Doe / Vendor Name"
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          error={errors.person}
          required
        />

        {/* Category */}
        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value as TransactionCategory)}
        />

        {/* Date and Time: single column on mobile, 2 columns on sm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            error={errors.transactionDate}
            required
          />
          <Input
            label="Time"
            type="time"
            value={transactionTime}
            onChange={(e) => setTransactionTime(e.target.value)}
          />
        </div>

        {/* Notes (Optional) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="txn-notes" className="text-sm font-medium text-[var(--text-primary)]">
            Notes (Optional)
          </label>
          <textarea
            id="txn-notes"
            rows={2}
            placeholder="Add any extra details or reference numbers…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent"
          />
        </div>

        {formError && (
          <p className="text-sm text-expense-600 bg-expense-50 dark:bg-expense-700/20 px-3 py-2 rounded">
            {formError}
          </p>
        )}

        {/* Form actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-primary)]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditing ? 'Save Changes' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
