create table if not exists public.workspace_state (
  workspace_id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_workspace_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_workspace_state_updated_at on public.workspace_state;
create trigger set_workspace_state_updated_at
before update on public.workspace_state
for each row
execute function public.set_workspace_state_updated_at();

alter table public.workspace_state enable row level security;

drop policy if exists "workspace_state_select_own" on public.workspace_state;
create policy "workspace_state_select_own"
on public.workspace_state
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "workspace_state_insert_own" on public.workspace_state;
create policy "workspace_state_insert_own"
on public.workspace_state
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "workspace_state_update_own" on public.workspace_state;
create policy "workspace_state_update_own"
on public.workspace_state
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "workspace_state_delete_own" on public.workspace_state;
create policy "workspace_state_delete_own"
on public.workspace_state
for delete
to authenticated
using (owner_id = auth.uid());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'workspace_state'
  ) then
    alter publication supabase_realtime add table public.workspace_state;
  end if;
end;
$$;
