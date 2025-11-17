-- Add stats fields to stories table
-- This migration adds paths_count, views_count, and likes_count columns to track story statistics

do $$
begin
  -- Add paths_count column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'stories' and column_name = 'paths_count'
  ) then
    alter table stories add column paths_count integer not null default 0;
  end if;

  -- Add views_count column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'stories' and column_name = 'views_count'
  ) then
    alter table stories add column views_count integer not null default 0;
  end if;

  -- Add likes_count column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'stories' and column_name = 'likes_count'
  ) then
    alter table stories add column likes_count integer not null default 0;
  end if;
end $$;

-- Add comments for documentation
comment on column stories.paths_count is 'Number of unique paths/branches in this story';
comment on column stories.views_count is 'Total number of views for this story';
comment on column stories.likes_count is 'Total number of likes for this story';

