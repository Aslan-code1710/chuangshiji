create table if not exists public.novels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null,
  genre text not null default '待定义',
  logline text not null default '',
  world text not null default '',
  timeline text not null default '',
  characters jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.novels enable row level security;
create policy "Users manage only their novels" on public.novels
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
