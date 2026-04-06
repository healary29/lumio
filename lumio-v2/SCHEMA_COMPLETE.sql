-- ============================================================
-- LUMIO COMPLETE DATABASE SCHEMA (FINAL)
-- Run this in Supabase → SQL Editor → New Query → Run
-- Safe to run multiple times — drops old policies first
-- ============================================================

-- ── TABLES ───────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  name text not null,
  bio text default '',
  avatar_url text default '',
  created_at timestamptz default now()
);

create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null default '',
  image_url text default '',
  created_at timestamptz default now()
);

create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

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

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.messages enable row level security;
alter table public.videos enable row level security;
alter table public.video_likes enable row level security;
alter table public.video_comments enable row level security;

-- Drop all old policies safely
do $$ begin
  drop policy if exists "profiles_select" on public.profiles;
  drop policy if exists "profiles_insert" on public.profiles;
  drop policy if exists "profiles_update" on public.profiles;
  drop policy if exists "profiles_delete" on public.profiles;
  drop policy if exists "posts_select" on public.posts;
  drop policy if exists "posts_insert" on public.posts;
  drop policy if exists "posts_delete" on public.posts;
  drop policy if exists "likes_select" on public.likes;
  drop policy if exists "likes_insert" on public.likes;
  drop policy if exists "likes_delete" on public.likes;
  drop policy if exists "comments_select" on public.comments;
  drop policy if exists "comments_insert" on public.comments;
  drop policy if exists "comments_delete" on public.comments;
  drop policy if exists "follows_select" on public.follows;
  drop policy if exists "follows_insert" on public.follows;
  drop policy if exists "follows_delete" on public.follows;
  drop policy if exists "messages_select" on public.messages;
  drop policy if exists "messages_insert" on public.messages;
  drop policy if exists "messages_delete" on public.messages;
  drop policy if exists "videos_select" on public.videos;
  drop policy if exists "videos_insert" on public.videos;
  drop policy if exists "videos_delete" on public.videos;
  drop policy if exists "video_likes_select" on public.video_likes;
  drop policy if exists "video_likes_insert" on public.video_likes;
  drop policy if exists "video_likes_delete" on public.video_likes;
  drop policy if exists "video_comments_select" on public.video_comments;
  drop policy if exists "video_comments_insert" on public.video_comments;
  drop policy if exists "video_comments_delete" on public.video_comments;
exception when others then null;
end $$;

-- Profiles
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete" on public.profiles for delete using (auth.uid() = id);

-- Posts
create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = user_id);

-- Likes
create policy "likes_select" on public.likes for select using (true);
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on public.likes for delete using (auth.uid() = user_id);

-- Comments
create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = user_id);

-- Follows
create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on public.follows for delete using (auth.uid() = follower_id);

-- Messages
create policy "messages_select" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages_insert" on public.messages for insert with check (auth.uid() = sender_id);
create policy "messages_delete" on public.messages for delete using (auth.uid() = sender_id);

-- Videos
create policy "videos_select" on public.videos for select using (true);
create policy "videos_insert" on public.videos for insert with check (auth.uid() = user_id);
create policy "videos_delete" on public.videos for delete using (auth.uid() = user_id);

-- Video likes
create policy "video_likes_select" on public.video_likes for select using (true);
create policy "video_likes_insert" on public.video_likes for insert with check (auth.uid() = user_id);
create policy "video_likes_delete" on public.video_likes for delete using (auth.uid() = user_id);

-- Video comments
create policy "video_comments_select" on public.video_comments for select using (true);
create policy "video_comments_insert" on public.video_comments for insert with check (auth.uid() = user_id);
create policy "video_comments_delete" on public.video_comments for delete using (auth.uid() = user_id);

-- ── STORAGE BUCKETS ──────────────────────────────────────────

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('posts', 'posts', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('videos', 'videos', true) on conflict (id) do nothing;

-- Drop old storage policies safely
do $$ begin
  drop policy if exists "avatars_select" on storage.objects;
  drop policy if exists "avatars_insert" on storage.objects;
  drop policy if exists "avatars_update" on storage.objects;
  drop policy if exists "posts_select" on storage.objects;
  drop policy if exists "posts_insert" on storage.objects;
  drop policy if exists "videos_storage_select" on storage.objects;
  drop policy if exists "videos_storage_insert" on storage.objects;
exception when others then null;
end $$;

create policy "avatars_select" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert" on storage.objects for insert with check (bucket_id = 'avatars' and (select auth.uid()) is not null);
create policy "avatars_update" on storage.objects for update using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);
create policy "posts_select" on storage.objects for select using (bucket_id = 'posts');
create policy "posts_insert" on storage.objects for insert with check (bucket_id = 'posts' and (select auth.uid()) is not null);
create policy "videos_storage_select" on storage.objects for select using (bucket_id = 'videos');
create policy "videos_storage_insert" on storage.objects for insert with check (bucket_id = 'videos' and (select auth.uid()) is not null);

-- ── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
