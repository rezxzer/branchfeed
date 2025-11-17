-- Create lightweight aggregate RPC for total story views
create or replace function public.total_story_views()
returns bigint
language sql
stable
as $$
  select coalesce(sum(views_count)::bigint, 0)
  from public.stories;
$$;

-- Verification helper: select public.total_story_views();


