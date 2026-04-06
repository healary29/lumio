-- ============================================================
-- LUMIO NOTIFICATIONS TABLE
-- Run in Supabase → SQL Editor → New Query → Run
-- ============================================================

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  post_id uuid references public.posts(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

do $$ begin
  drop policy if exists "notifications_select" on public.notifications;
  drop policy if exists "notifications_insert" on public.notifications;
  drop policy if exists "notifications_update" on public.notifications;
  drop policy if exists "notifications_delete" on public.notifications;
exception when others then null;
end $$;

create policy "notifications_select" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_insert" on public.notifications for insert with check ((select auth.uid()) is not null);
create policy "notifications_update" on public.notifications for update using (auth.uid() = user_id);
create policy "notifications_delete" on public.notifications for delete using (auth.uid() = user_id);

-- ── AUTO NOTIFY ON LIKE ──────────────────────────────────────
create or replace function public.notify_on_like()
returns trigger as $$
declare
  post_owner uuid;
  actor_name text;
begin
  select user_id into post_owner from public.posts where id = new.post_id;
  select name into actor_name from public.profiles where id = new.user_id;
  if post_owner is not null and post_owner <> new.user_id then
    insert into public.notifications(user_id, actor_id, type, post_id, message)
    values(post_owner, new.user_id, 'like', new.post_id, actor_name || ' liked your post');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_created on public.likes;
create trigger on_like_created
  after insert on public.likes
  for each row execute procedure public.notify_on_like();

-- ── AUTO NOTIFY ON COMMENT ───────────────────────────────────
create or replace function public.notify_on_comment()
returns trigger as $$
declare
  post_owner uuid;
  actor_name text;
begin
  select user_id into post_owner from public.posts where id = new.post_id;
  select name into actor_name from public.profiles where id = new.user_id;
  if post_owner is not null and post_owner <> new.user_id then
    insert into public.notifications(user_id, actor_id, type, post_id, message)
    values(post_owner, new.user_id, 'comment', new.post_id, actor_name || ' commented on your post');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_comment_created on public.comments;
create trigger on_comment_created
  after insert on public.comments
  for each row execute procedure public.notify_on_comment();

-- ── AUTO NOTIFY ON FOLLOW ────────────────────────────────────
create or replace function public.notify_on_follow()
returns trigger as $$
declare
  actor_name text;
begin
  select name into actor_name from public.profiles where id = new.follower_id;
  if new.following_id <> new.follower_id then
    insert into public.notifications(user_id, actor_id, type, message)
    values(new.following_id, new.follower_id, 'follow', actor_name || ' started following you');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_created on public.follows;
create trigger on_follow_created
  after insert on public.follows
  for each row execute procedure public.notify_on_follow();

-- ── AUTO NOTIFY ON VIDEO LIKE ────────────────────────────────
create or replace function public.notify_on_video_like()
returns trigger as $$
declare
  video_owner uuid;
  actor_name text;
begin
  select user_id into video_owner from public.videos where id = new.video_id;
  select name into actor_name from public.profiles where id = new.user_id;
  if video_owner is not null and video_owner <> new.user_id then
    insert into public.notifications(user_id, actor_id, type, video_id, message)
    values(video_owner, new.user_id, 'video_like', new.video_id, actor_name || ' liked your reel');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_video_like_created on public.video_likes;
create trigger on_video_like_created
  after insert on public.video_likes
  for each row execute procedure public.notify_on_video_like();

-- ── AUTO NOTIFY ON VIDEO COMMENT ─────────────────────────────
create or replace function public.notify_on_video_comment()
returns trigger as $$
declare
  video_owner uuid;
  actor_name text;
begin
  select user_id into video_owner from public.videos where id = new.video_id;
  select name into actor_name from public.profiles where id = new.user_id;
  if video_owner is not null and video_owner <> new.user_id then
    insert into public.notifications(user_id, actor_id, type, video_id, message)
    values(video_owner, new.user_id, 'video_comment', new.video_id, actor_name || ' commented on your reel');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_video_comment_created on public.video_comments;
create trigger on_video_comment_created
  after insert on public.video_comments
  for each row execute procedure public.notify_on_video_comment();
