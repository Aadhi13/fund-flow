import type { TransactionCategory } from '../types';

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  registration: 'Registration',
  sponsorship: 'Sponsorship',
  donation: 'Donation',
  ticket_sales: 'Ticket Sales',
  venue: 'Venue',
  catering: 'Catering',
  equipment: 'Equipment',
  decoration: 'Decoration',
  transport: 'Transport',
  marketing: 'Marketing',
  miscellaneous: 'Miscellaneous',
};

export function getCategoryLabel(category: TransactionCategory): string {
  return CATEGORY_LABELS[category];
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);
