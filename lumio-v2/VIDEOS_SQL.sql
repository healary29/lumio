-- ============================================================
-- LUMIO — VIDEOS, VIDEO LIKES & VIDEO COMMENTS SQL
-- Run in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ── TABLES ───────────────────────────────────────────────────

create table if not exists public.videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  caption text default '',
  video_url text not null,
  created_at timestamptz default now()
);

create table if not exists public.video_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  video_id uuid references public.videos(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, video_id)
);

create table if not exists public.video_comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  video_id uuid references public.videos(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────

alter table public.videos enable row level security;
alter table public.video_likes enable row level security;
alter table public.video_comments enable row level security;

-- Drop old policies safely
do $$ begin
  drop policy if exists "videos_select" on public.videos;
  drop policy if exists "videos_insert" on public.videos;
  drop policy if exists "videos_delete" on public.videos;
  drop policy if exists "video_likes_select" on public.video_likes;
  drop policy if exists "video_likes_insert" on public.video_likes;
  drop policy if exists "video_likes_delete" on public.video_likes;
  drop policy if exists "video_comments_select" on public.video_comments;
  drop policy if exists "video_comments_insert" on public.video_comments;
  drop policy if exists "video_comments_delete" on public.video_comments;
  drop policy if exists "videos_storage_select" on storage.objects;
  drop policy if exists "videos_storage_insert" on storage.objects;
exception when others then null;
end $$;

-- Videos policies
create policy "videos_select" on public.videos for select using (true);
create policy "videos_insert" on public.videos for insert with check (auth.uid() = user_id);
create policy "videos_delete" on public.videos for delete using (auth.uid() = user_id);

-- Video likes policies
create policy "video_likes_select" on public.video_likes for select using (true);
create policy "video_likes_insert" on public.video_likes for insert with check (auth.uid() = user_id);
create policy "video_likes_delete" on public.video_likes for delete using (auth.uid() = user_id);

-- Video comments policies
create policy "video_comments_select" on public.video_comments for select using (true);
create policy "video_comments_insert" on public.video_comments for insert with check (auth.uid() = user_id);
create policy "video_comments_delete" on public.video_comments for delete using (auth.uid() = user_id);

-- ── STORAGE BUCKET FOR VIDEOS ────────────────────────────────

insert into storage.buckets (id, name, public)
  values ('videos', 'videos', true)
  on conflict (id) do nothing;

create policy "videos_storage_select" on storage.objects
  for select using (bucket_id = 'videos');

create policy "videos_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'videos' and (select auth.uid()) is not null
  );
