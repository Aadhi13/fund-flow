import * as XLSX from 'xlsx';
import { formatTxnId, formatCurrency } from './utils';
import { getCategoryLabel } from '../data/mock';
import type { Transaction, FinancialSummary } from '../types';

/**
 * Escapes a single string field for CSV formatting.
 * Properly wraps with double quotes and escapes existing quotes.
 */
function escapeCSVField(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Export transactions list to CSV file.
 * Includes UTF-8 BOM so Excel opens with proper UTF-8 encoding (supporting Indian currency symbols & Unicode).
 */
export function exportToCSV(transactions: Transaction[], filename = 'fundflow_transactions.csv') {
  const headers = [
    'Transaction ID',
    'Date',
    'Time',
    'Type',
    'Amount (INR)',
    'Person / Payee',
    'Description',
    'Category',
    'Status',
    'Created At',
    'Updated At',
  ];

  const rows = transactions.map((t) => [
    formatTxnId(t.id),
    t.transaction_date || '',
    t.transaction_time ? t.transaction_time.slice(0, 5) : '00:00',
    t.type,
    t.amount.toFixed(2),
    t.person || '',
    t.description || '',
    getCategoryLabel(t.category) || t.category,
    t.status,
    t.created_at || '',
    t.updated_at || '',
  ]);

  const csvLines = [
    headers.map(escapeCSVField).join(','),
    ...rows.map((row) => row.map(escapeCSVField).join(',')),
  ];

  // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export transactions and summary to clean Excel workbook (.xlsx).
 * Sheet 1: Transactions
 * Sheet 2: Summary
 */
export function exportToExcel(
  transactions: Transaction[],
  summary: FinancialSummary,
  filename = 'fundflow_financial_report.xlsx'
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Transactions
  const txnRows = transactions.map((t) => ({
    'Transaction ID': formatTxnId(t.id),
    'Date': t.transaction_date || '',
    'Time': t.transaction_time ? t.transaction_time.slice(0, 5) : '00:00',
    'Type': t.type.toUpperCase(),
    'Amount (INR)': t.amount,
    'Person / Payee': t.person || '',
    'Description': t.description || '',
    'Category': getCategoryLabel(t.category) || t.category,
    'Status': t.status.toUpperCase(),
    'Created At': t.created_at || '',
    'Updated At': t.updated_at || '',
  }));

  const wsTransactions = XLSX.utils.json_to_sheet(txnRows);

  // Set column widths for readability
  wsTransactions['!cols'] = [
    { wch: 15 }, // ID
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 10 }, // Type
    { wch: 15 }, // Amount
    { wch: 24 }, // Payee
    { wch: 32 }, // Description
    { wch: 16 }, // Category
    { wch: 10 }, // Status
    { wch: 22 }, // Created At
    { wch: 22 }, // Updated At
  ];

  XLSX.utils.book_append_sheet(workbook, wsTransactions, 'Transactions');

  // Sheet 2: Summary
  const summaryRows = [
    { 'Financial Metric': 'Total Collected (Income)', 'Value': summary.total_income, 'Formatted': formatCurrency(summary.total_income) },
    { 'Financial Metric': 'Total Expenses', 'Value': summary.total_expenses, 'Formatted': formatCurrency(summary.total_expenses) },
    { 'Financial Metric': 'Current Net Balance', 'Value': summary.balance, 'Formatted': formatCurrency(summary.balance) },
    { 'Financial Metric': 'Total Active Records', 'Value': summary.transaction_count, 'Formatted': `${summary.transaction_count} entries` },
    { 'Financial Metric': 'Report Generated At', 'Value': new Date().toISOString(), 'Formatted': new Date().toLocaleString('en-IN') },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 28 }, // Metric
    { wch: 16 }, // Value
    { wch: 20 }, // Formatted
  ];

  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Summary');

  // Trigger browser download
  XLSX.writeFile(workbook, filename);
}
