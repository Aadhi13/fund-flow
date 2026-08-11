import { createTransaction } from './transactions';
import type { CreateTransactionInput } from '../types';

const SAMPLE_TRANSACTIONS: CreateTransactionInput[] = [
  {
    type: 'income',
    amount: 75000.0,
    description: 'Title Sponsorship — TechCorp Systems',
    category: 'sponsorship',
    transaction_date: '2026-08-01',
    transaction_time: '10:30',
    person: 'Rahul Sharma (TechCorp)',
    notes: 'Approved sponsorship deal for main stage branding.',
  },
  {
    type: 'income',
    amount: 32500.0,
    description: 'Early Bird Ticket Sales (130 Passes)',
    category: 'ticket_sales',
    transaction_date: '2026-08-03',
    transaction_time: '14:15',
    person: 'Registration Desk',
    notes: 'Online collection via payment gateway.',
  },
  {
    type: 'expense',
    amount: 24800.0,
    description: 'Auditorium Booking & AV Setup Fee',
    category: 'venue',
    transaction_date: '2026-08-05',
    transaction_time: '11:00',
    person: 'College Management',
    notes: 'Advance receipt #AV-4821.',
  },
  {
    type: 'income',
    amount: 15000.0,
    description: 'Faculty Alumni Donation Fund',
    category: 'donation',
    transaction_date: '2026-08-06',
    transaction_time: '16:45',
    person: 'Prof. Ananya Roy',
    notes: 'Direct bank transfer to event account.',
  },
  {
    type: 'expense',
    amount: 18500.0,
    description: 'Catering Advance — Lunch & Refreshments',
    category: 'catering',
    transaction_date: '2026-08-08',
    transaction_time: '09:30',
    person: 'Delight Caterers',
    notes: 'Order for 250 participants and guests.',
  },
  {
    type: 'expense',
    amount: 4200.0,
    description: 'Flex Banners & Promotional Posters Printing',
    category: 'marketing',
    transaction_date: '2026-08-09',
    transaction_time: '17:20',
    person: 'PrintFast Press',
    notes: '15 main hall banners and 50 A3 posters.',
  },
  {
    type: 'expense',
    amount: 6500.0,
    description: 'Stage Lighting & Mic Stand Rentals',
    category: 'equipment',
    transaction_date: '2026-08-10',
    transaction_time: '13:00',
    person: 'SoundWave Events',
    notes: 'Wireless mics and spot lights.',
  },
];

export async function seedSampleData(): Promise<number> {
  let count = 0;
  for (const item of SAMPLE_TRANSACTIONS) {
    await createTransaction(item);
    count++;
  }
  return count;
}
