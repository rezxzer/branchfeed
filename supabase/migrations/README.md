# Supabase Migrations

This directory contains SQL migration files for database schema changes.

## Migration File Naming

- Format: `YYYYMMDD_NN_description.sql` (where NN is sequence number for same-day migrations)
- Example: `20250110_add_branch_paths.sql` (single migration per day)
- Example: `20250115_01_add_profile_creation_trigger.sql` (first migration of the day)
- Example: `20250115_02_add_storage_bucket_and_policies.sql` (second migration of the day)
- Use descriptive names that explain what the migration does
- If multiple migrations on same day, use sequence numbers (01, 02, 03, etc.) to ensure correct order

## Migration Rules

1. **Idempotent**: All migrations must be idempotent (safe to run multiple times)
2. **Complete**: Each migration should be complete and self-contained
3. **RLS Policies**: Use `do $$ ... end $$;` block syntax for RLS policies
4. **Functions**: Use `do $$ ... end $$;` block syntax for functions
5. **Verification**: Include verification queries in migration comments

## Running Migrations

1. Copy the migration SQL file content
2. Open Supabase Dashboard → SQL Editor
3. Paste and run the migration
4. Verify the migration ran correctly using the verification queries

## Migration Order

Migrations are run in chronological order by date prefix:
- `20250110_add_branch_paths.sql` runs before `20250111_add_indexes.sql`

## Initial Setup

The initial database setup is in `supabase/sql/init.sql`. This should be run first before any migrations.

