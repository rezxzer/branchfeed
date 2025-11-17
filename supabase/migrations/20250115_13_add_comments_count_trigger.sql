-- Add comments_count column to stories if missing
alter table if exists public.stories
  add column if not exists comments_count integer not null default 0;

-- Ensure index on comments.story_id for performant counting
create index if not exists idx_comments_story_id
  on public.comments (story_id);

-- Create or replace trigger function to maintain comments_count
create or replace function public.update_comments_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.story_id is not null then
      update public.stories
        set comments_count = comments_count + 1
      where id = new.story_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.story_id is not null then
      update public.stories
        set comments_count = greatest(comments_count - 1, 0)
      where id = old.story_id;
    end if;
    return old;
  elsif tg_op = 'UPDATE' then
    -- If story_id changed, decrement old and increment new
    if old.story_id is distinct from new.story_id then
      if old.story_id is not null then
        update public.stories
          set comments_count = greatest(comments_count - 1, 0)
        where id = old.story_id;
      end if;
      if new.story_id is not null then
        update public.stories
          set comments_count = comments_count + 1
        where id = new.story_id;
      end if;
    end if;
    return new;
  end if;
  return new;
end;
$$;

-- Recreate trigger idempotently
drop trigger if exists tr_comments_count on public.comments;
create trigger tr_comments_count
after insert or delete or update of story_id
on public.comments
for each row
execute function public.update_comments_count();

-- Backfill counts to ensure correctness
update public.stories s
set comments_count = sub.cnt
from (
  select story_id, count(*)::int as cnt
  from public.comments
  where story_id is not null
  group by story_id
) sub
where s.id = sub.story_id;


