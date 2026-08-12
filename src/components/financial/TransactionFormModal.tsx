import { useState, useEffect, useRef } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Upload,
  FileText,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CATEGORY_OPTIONS } from '../../data/mock';
import { createTransaction, updateTransaction } from '../../data/transactions';
import { validateReceiptFile, uploadReceiptFile } from '../../lib/storage';
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form field states
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('miscellaneous');
  const [transactionDate, setTransactionDate] = useState(getTodayDate());
  const [transactionTime, setTransactionTime] = useState(getCurrentTime());
  const [person, setPerson] = useState('');
  const [notes, setNotes] = useState('');

  // Receipt file states
  const [existingReceiptPath, setExistingReceiptPath] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submission & Validation states
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
      setExistingReceiptPath(initialData.receipt_path || null);
      setPreviewUrl(initialData.receipt_path || null);
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setCategory('miscellaneous');
      setTransactionDate(getTodayDate());
      setTransactionTime(getCurrentTime());
      setPerson('');
      setNotes('');
      setExistingReceiptPath(null);
      setPreviewUrl(null);
    }
    setReceiptFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setFormError(null);
    setErrors({});
  }, [initialData, open]);

  // Handle local file selection & validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    const validation = validateReceiptFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid receipt file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setReceiptFile(file);

    // Generate local preview URL
    if (file.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  // Remove receipt
  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setExistingReceiptPath(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    setUploadProgress(10);

    try {
      let finalReceiptPath: string | null = existingReceiptPath;

      // Upload receipt file if a new file is attached
      if (receiptFile) {
        setUploadProgress(20);
        try {
          const uploadRes = await uploadReceiptFile(receiptFile, (progress) => {
            setUploadProgress(progress);
          });
          finalReceiptPath = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Storage upload warning:', uploadErr);
          // If Supabase storage is unavailable, fallback gracefully to preview URL or mock path
          if (previewUrl && previewUrl.startsWith('data:')) {
            finalReceiptPath = previewUrl;
          } else {
            // Keep user informed if storage service fails
            setUploadError(uploadErr instanceof Error ? uploadErr.message : 'Receipt upload failed');
            setSubmitting(false);
            return;
          }
        }
      }

      const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;

      const payload = {
        type,
        amount: parsedAmount,
        description: description.trim(),
        category,
        transaction_date: transactionDate,
        transaction_time: transactionTime || '00:00',
        person: person.trim(),
        receipt_path: finalReceiptPath,
        notes: notes.trim() || null,
      };

      if (isEditing && initialData) {
        await updateTransaction(initialData.id, payload);
      } else {
        await createTransaction(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save transaction record');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction Entry' : 'Record New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-income-50 border-income-600 text-income-700 dark:bg-income-700/20 dark:text-income-400 dark:border-income-500'
                  : 'bg-[var(--surface-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowDownRight size={16} />
              + Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-expense-50 border-expense-600 text-expense-700 dark:bg-expense-700/20 dark:text-expense-400 dark:border-expense-500'
                  : 'bg-[var(--surface-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowUpRight size={16} />
              − Expense
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
          label="Description / Purpose"
          type="text"
          placeholder="e.g., Stage Rentals & Audio Setup"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />

        {/* Person / Payee */}
        <Input
          label="Person / Payee / Source"
          type="text"
          placeholder="e.g., SoundWave Events Pvt Ltd"
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

        {/* Date and Time */}
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

        {/* Receipt Upload Section */}
        <div className="space-y-2 pt-1 border-t border-[var(--border-primary)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Receipt / Bill Attachment (Optional)
            </label>
            <span className="text-[11px] text-[var(--text-tertiary)]">Max 5MB (PNG, JPG, WebP, PDF)</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            className="hidden"
          />

          {/* Active Receipt Preview or Drag/Drop Selector */}
          {receiptFile || existingReceiptPath ? (
            <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Receipt Preview"
                      className="w-10 h-10 object-cover rounded border border-[var(--border-primary)] shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-accent-50 text-accent-600 dark:bg-accent-700/20 flex items-center justify-center shrink-0 border border-accent-200">
                      <FileText size={20} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {receiptFile ? receiptFile.name : 'Receipt Document Attached'}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      {receiptFile
                        ? `${(receiptFile.size / 1024).toFixed(1)} KB`
                        : 'Attached receipt file'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded cursor-pointer transition-colors"
                    title="Replace Receipt"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="p-1.5 text-xs text-expense-600 hover:text-expense-700 hover:bg-expense-50 dark:hover:bg-expense-950/40 rounded cursor-pointer transition-colors"
                    title="Remove Receipt"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 border-2 border-dashed border-[var(--border-primary)] hover:border-[var(--border-accent)] bg-[var(--surface-secondary)]/60 hover:bg-[var(--surface-secondary)] rounded-lg text-center cursor-pointer transition-all space-y-1 group"
            >
              <Upload size={22} className="mx-auto text-[var(--text-tertiary)] group-hover:text-[var(--text-accent)] transition-colors" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Click to upload receipt or bill image
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                PNG, JPG, WebP, or PDF up to 5MB
              </p>
            </div>
          )}

          {/* Upload Progress Bar */}
          {submitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[var(--text-tertiary)]">
                <span>Uploading receipt attachment…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[var(--surface-tertiary)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-accent-600 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload error display */}
          {uploadError && (
            <div className="flex items-center gap-1.5 p-2 bg-expense-50 text-expense-700 dark:bg-expense-950/40 dark:text-expense-400 text-xs rounded-md border border-expense-200 dark:border-expense-800/40">
              <AlertCircle size={14} className="shrink-0 text-expense-600" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Notes (Optional) */}
        <div className="flex flex-col gap-1 pt-1">
          <label htmlFor="txn-notes" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Organizer Notes (Optional)
          </label>
          <textarea
            id="txn-notes"
            rows={2}
            placeholder="Add internal references, invoice numbers, or voucher details…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent"
          />
        </div>

        {formError && (
          <p className="text-xs text-expense-600 bg-expense-50 dark:bg-expense-950/40 border border-expense-200 px-3 py-2 rounded-lg font-medium">
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
