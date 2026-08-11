/**
 * Format a number as Indian Rupee currency.
 * Uses the en-IN locale for proper lakh/crore grouping.
 */
/**
 * Format a number as Indian Rupee currency.
 * Uses the en-IN locale for proper lakh/crore grouping with 2 decimal places.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate a short, human-readable transaction identifier.
 * Example: TXN-8A2F4B
 */
export function formatTxnId(id: string): string {
  if (!id) return 'TXN-000000';
  const clean = id.replace(/-/g, '');
  return `TXN-${clean.slice(0, 6).toUpperCase()}`;
}

/**
 * Format a number with sign prefix for display.
 * Income shows +, expense shows −.
 */
export function formatSignedCurrency(amount: number, type: 'income' | 'expense'): string {
  const formatted = formatCurrency(amount);
  return type === 'income' ? `+${formatted}` : `−${formatted}`;
}

/**
 * Format an ISO date string to a human-readable format.
 */
export function formatDate(isoString: string): string {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format an ISO date string to a short format for compact views.
 */
export function formatDateShort(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Format an ISO date string with time.
 */
export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Simple classname concatenation utility.
 * Filters out falsy values and joins with space.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
