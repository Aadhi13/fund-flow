import { useState, useMemo } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { bulkCreateStudents } from '../../data/students';
import type { Student } from '../../types';

interface BulkAddStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingStudents: Student[];
}

export function BulkAddStudentModal({ open, onClose, onSuccess, existingStudents }: BulkAddStudentModalProps) {
  const [inputText, setInputText] = useState('');
  const [defaultExpectedAmount, setDefaultExpectedAmount] = useState('500');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const existingNamesLower = useMemo(() => {
    return new Set(existingStudents.map(s => s.name.toLowerCase().trim()));
  }, [existingStudents]);

  const parsedStudents = useMemo(() => {
    if (!inputText.trim()) return { newStudents: [] as string[], duplicates: [] as string[] };
    
    // Split by comma or newline
    const rawNames = inputText.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    
    // Remove exact duplicates from the input itself
    const uniqueNames = Array.from(new Set(rawNames));
    
    const newStudents: string[] = [];
    const duplicates: string[] = [];
    
    uniqueNames.forEach(name => {
      if (existingNamesLower.has(name.toLowerCase())) {
        duplicates.push(name);
      } else {
        newStudents.push(name);
      }
    });
    
    return { newStudents, duplicates };
  }, [inputText, existingNamesLower]);

  if (!open) return null;

  const handlePreview = () => {
    setError(null);
    if (parsedStudents.newStudents.length === 0 && parsedStudents.duplicates.length === 0) {
      setError('No students found in input.');
      return;
    }
    
    const amountNum = parseFloat(defaultExpectedAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Expected amount must be a valid number greater than or equal to 0.');
      return;
    }
    
    if (parsedStudents.newStudents.length === 0) {
      setError('All provided students already exist in the database.');
      return;
    }
    
    setStep(2);
  };

  const handleConfirm = async () => {
    const amountNum = parseFloat(defaultExpectedAmount);
    setLoading(true);
    setError(null);
    
    try {
      const payloads = parsedStudents.newStudents.map(name => ({
        name,
        expected_amount: amountNum
      }));
      
      await bulkCreateStudents(payloads);
      onSuccess();
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setStep(1);
        setInputText('');
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create students.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Bulk Add Students
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-expense-50 text-expense-700 border border-expense-200 rounded-md dark:bg-expense-950/30 dark:text-expense-400 dark:border-expense-800">
              {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--text-secondary)] flex justify-between">
                  <span>Student Names (comma or newline separated)</span>
                </label>
                <textarea
                  required
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent min-h-[150px] font-mono resize-y"
                  placeholder="Rahul&#10;Adhil&#10;Anu, Fathima"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">Default Expected Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={defaultExpectedAmount}
                  onChange={(e) => setDefaultExpectedAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--input-border)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:border-transparent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={handlePreview} icon={<FileText size={16} />}>
                  Preview
                </Button>
              </div>
            </>
          ) : (
            <>
              {parsedStudents.duplicates.length > 0 && (
                <div className="p-3 bg-warning-50 border border-warning-200 rounded-md dark:bg-warning-950/30 dark:border-warning-800">
                  <h4 className="text-xs font-semibold text-warning-800 dark:text-warning-400 mb-1">
                    Already Exists ({parsedStudents.duplicates.length})
                  </h4>
                  <ul className="text-xs text-warning-700 dark:text-warning-300 list-disc pl-4 max-h-[100px] overflow-y-auto">
                    {parsedStudents.duplicates.map(name => <li key={name}>{name}</li>)}
                  </ul>
                  <p className="text-[11px] text-warning-600 dark:text-warning-500 mt-2">
                    These students will be skipped.
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2 flex items-center justify-between">
                  <span>New Students to Add</span>
                  <span className="text-[var(--text-tertiary)]">{parsedStudents.newStudents.length} students</span>
                </h4>
                <div className="border border-[var(--border-primary)] rounded-md bg-[var(--surface-secondary)] max-h-[200px] overflow-y-auto p-2">
                  {parsedStudents.newStudents.map(name => (
                    <div key={name} className="text-sm text-[var(--text-secondary)] py-1 px-2 border-b border-[var(--border-primary)] last:border-0">
                      {name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                  Back to Edit
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleConfirm} disabled={loading} icon={<CheckCircle2 size={16} />}>
                    {loading ? 'Adding…' : `Add ${parsedStudents.newStudents.length} Students`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
