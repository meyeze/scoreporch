-- ScorePorch Embed Widget Schema
-- Run this in Supabase SQL Editor AFTER the base schema

-- 1. Embeds table — stores widget configurations
create table if not exists public.embeds (
  id text primary key default encode(gen_random_bytes(12), 'hex'),  -- short embed ID
  user_id uuid references public.profiles(id) on delete cascade not null,
  team_id integer not null,
  modules text[] default '{scores,headlines,countdown,standings}',
  branding boolean default true,  -- false = white-label (Pro only)
  label text,                     -- user's label for this embed ("My Blog Widget")
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Indexes
create index if not exists idx_embeds_user_id on public.embeds(user_id);

-- 3. Enable RLS
alter table public.embeds enable row level security;

-- 4. RLS Policies
create policy "Users can view own embeds"
  on public.embeds for select
  using (auth.uid() = user_id);

create policy "Users can insert own embeds"
  on public.embeds for insert
  with check (auth.uid() = user_id);

create policy "Users can update own embeds"
  on public.embeds for update
  using (auth.uid() = user_id);

create policy "Users can delete own embeds"
  on public.embeds for delete
  using (auth.uid() = user_id);

-- 5. Service role can read any embed (for widget API validation)
-- Service role bypasses RLS by default, so no policy needed.

-- 6. Auto-update updated_at
drop trigger if exists embeds_updated_at on public.embeds;
create trigger embeds_updated_at
  before update on public.embeds
  for each row execute function public.update_updated_at();
