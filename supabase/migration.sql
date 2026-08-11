-- FundFlow: transactions table and RLS policies
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


-- ─── Row Level Security ──────────────────────────────────────────────────────

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

-- Note: No DELETE policy. Transactions are voided, not deleted.
-- The database enforces this by having no delete policy with RLS enabled.

-- ─── Table Grants ─────────────────────────────────────────────────────────────
-- Grant basic table access to PostgREST roles so RLS policies can take effect.
grant select on public.transactions to anon, authenticated;
grant insert, update on public.transactions to authenticated;

