import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { exportToCSV, exportToExcel } from '../../lib/export';
import type { Transaction, FinancialSummary } from '../../types';

interface ExportDropdownProps {
  transactions: Transaction[];
  summary: FinancialSummary;
}

export function ExportDropdown({ transactions, summary }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    setOpen(false);
    exportToCSV(transactions);
  };

  const handleExportExcel = () => {
    setOpen(false);
    exportToExcel(transactions, summary);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setOpen(!open)}
        icon={<Download size={14} />}
      >
        <span>Export</span>
        <ChevronDown size={13} className="ml-0.5 opacity-70" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-lg z-50 py-1 divide-y divide-[var(--border-primary)]">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            Export Data
          </div>

          <div className="py-1">
            <button
              onClick={handleExportCSV}
              className="w-full text-left px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileText size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium leading-tight">Export as CSV</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">UTF-8 formatted table</p>
              </div>
            </button>

            <button
              onClick={handleExportExcel}
              className="w-full text-left px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileSpreadsheet size={14} className="text-accent-600 dark:text-accent-400 shrink-0" />
              <div>
                <p className="font-medium leading-tight">Export Excel (.xlsx)</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">2 sheets (Txns + Summary)</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
