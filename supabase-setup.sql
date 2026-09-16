-- RUSTAM Dashboard: run once in Supabase SQL Editor
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

create policy "Users can read own dashboard"
on public.user_data for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own dashboard"
on public.user_data for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own dashboard"
on public.user_data for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own dashboard"
on public.user_data for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_data_updated_at on public.user_data;
create trigger user_data_updated_at
before update on public.user_data
for each row execute function public.set_updated_at();
