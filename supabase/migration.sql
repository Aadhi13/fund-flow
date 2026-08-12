-- FundFlow: transactions table, storage bucket, and RLS policies
-- Run this in the Supabase SQL Editor.

-- ─── Table ───────────────────────────────────────────────────────────────────

create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('income', 'expense')),
  amount        numeric(12, 2) not null check (amount > 0),
  description   text not null,
  category      text not null check (category in (
    'registration', 'sponsorship', 'donation', 'ticket_sales',
    'venue', 'catering', 'equipment', 'decoration',
    'transport', 'marketing', 'miscellaneous'
  )),
  transaction_date  date not null,
  transaction_time  time not null default '00:00',
  person            text not null,
  receipt_path      text,
  status            text not null default 'active' check (status in ('active', 'voided')),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid not null references auth.users(id)
);

-- Index for common queries
create index if not exists idx_transactions_status on public.transactions (status);
create index if not exists idx_transactions_type on public.transactions (type);
create index if not exists idx_transactions_date on public.transactions (transaction_date desc);

-- Auto-update updated_at on row change
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.transactions
  for each row
  execute function public.update_updated_at();


-- ─── Row Level Security (Transactions Table) ─────────────────────────────────

alter table public.transactions enable row level security;

-- Public: anyone can read active transactions (no auth required)
create policy "Public can read active transactions"
  on public.transactions
  for select
  using (status = 'active');

-- Authenticated: can read ALL transactions (including voided)
create policy "Authenticated users can read all transactions"
  on public.transactions
  for select
  to authenticated
  using (true);

-- Authenticated: can insert new transactions
create policy "Authenticated users can create transactions"
  on public.transactions
  for insert
  to authenticated
  with check (true);

-- Authenticated: can update transactions
create policy "Authenticated users can update transactions"
  on public.transactions
  for update
  to authenticated
  using (true)
  with check (true);

-- Table Grants
grant select on public.transactions to anon, authenticated;
grant insert, update on public.transactions to authenticated;


-- ─── Storage Bucket & Policies (Receipts) ─────────────────────────────────────

-- Create public storage bucket for receipts
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Clean up existing policies if re-running
drop policy if exists "Public users can view receipt files" on storage.objects;
drop policy if exists "Authenticated users can upload receipt files" on storage.objects;
drop policy if exists "Authenticated users can update receipt files" on storage.objects;
drop policy if exists "Authenticated users can delete receipt files" on storage.objects;

-- Policy: Anyone can view/download receipt files
create policy "Public users can view receipt files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'receipts');

-- Policy: Only authenticated users can upload receipt files
create policy "Authenticated users can upload receipt files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'receipts');

-- Policy: Only authenticated users can update receipt files
create policy "Authenticated users can update receipt files"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'receipts');

-- Policy: Only authenticated users can delete receipt files
create policy "Authenticated users can delete receipt files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'receipts');

