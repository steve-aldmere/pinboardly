# Phase 3 RLS Audit

Audit checklist and findings for Row Level Security (RLS) policies in Supabase.

## Tables to Review

- [ ] `pinboards`
- [ ] `link_pins`
- [ ] `note_pins`
- [ ] `event_pins`
- [ ] `profiles`

## Expected RLS Behavior

### Public Access (Read-Only)
- [ ] Public SELECT allowed on `pinboards` when `status IN ('trial', 'active')`
- [ ] Public SELECT allowed on `link_pins` when parent `pinboard.status IN ('trial', 'active')`
- [ ] Public SELECT allowed on `note_pins` when parent `pinboard.status IN ('trial', 'active')`
- [ ] Public SELECT allowed on `event_pins` when parent `pinboard.status IN ('trial', 'active')`
- [ ] No public INSERT/UPDATE/DELETE on any table

### Authenticated User Access
- [ ] Users can SELECT their own pinboards (`owner_user_id = auth.uid()`)
- [ ] Users can INSERT/UPDATE/DELETE their own pinboards (`owner_user_id = auth.uid()`)
- [ ] Users can SELECT link_pins/note_pins/event_pins for their own pinboards
- [ ] Users can INSERT/UPDATE/DELETE link_pins/note_pins/event_pins for their own pinboards
- [ ] Users cannot access pinboards owned by other users (unless public and status is trial/active)

## Findings

### RLS Status

| Table | RLS Enabled | Notes |
|-------|-------------|-------|
| `pinboards` | ⬜ Yes / ⬜ No | |
| `link_pins` | ⬜ Yes / ⬜ No | |
| `note_pins` | ⬜ Yes / ⬜ No | |
| `event_pins` | ⬜ Yes / ⬜ No | |
| `profiles` | ⬜ Yes / ⬜ No | |

### Policy Summary

#### `pinboards` table
- **Policy name:** `[FILL IN]`
- **Operation:** SELECT / INSERT / UPDATE / DELETE
- **Definition:** `[FILL IN]`
- **Notes:** `[FILL IN]`

#### `link_pins` table
- **Policy name:** `[FILL IN]`
- **Operation:** SELECT / INSERT / UPDATE / DELETE
- **Definition:** `[FILL IN]`
- **Notes:** `[FILL IN]`

#### `note_pins` table
- **Policy name:** `[FILL IN]`
- **Operation:** SELECT / INSERT / UPDATE / DELETE
- **Definition:** `[FILL IN]`
- **Notes:** `[FILL IN]`

#### `event_pins` table
- **Policy name:** `[FILL IN]`
- **Operation:** SELECT / INSERT / UPDATE / DELETE
- **Definition:** `[FILL IN]`
- **Notes:** `[FILL IN]`

#### `profiles` table
- **Policy name:** `[FILL IN]`
- **Operation:** SELECT / INSERT / UPDATE / DELETE
- **Definition:** `[FILL IN]`
- **Notes:** `[FILL IN]`

### Key Columns Verification

| Table | Column | Type | Nullable | Default | Notes |
|-------|--------|------|----------|---------|-------|
| `pinboards` | `owner_user_id` | `[FILL IN]` | `[FILL IN]` | `[FILL IN]` | |
| `pinboards` | `status` | `[FILL IN]` | `[FILL IN]` | `[FILL IN]` | |
| `link_pins` | `pinboard_id` | `[FILL IN]` | `[FILL IN]` | `[FILL IN]` | |
| `note_pins` | `pinboard_id` | `[FILL IN]` | `[FILL IN]` | `[FILL IN]` | |
| `event_pins` | `pinboard_id` | `[FILL IN]` | `[FILL IN]` | `[FILL IN]` | |

## Verification Queries

### Check RLS Status

```sql
-- Check if RLS is enabled on each table
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('pinboards', 'link_pins', 'note_pins', 'event_pins', 'profiles')
ORDER BY tablename;
```

### List All Policies

```sql
-- List all policies for the tables we care about
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pinboards', 'link_pins', 'note_pins', 'event_pins', 'profiles')
ORDER BY tablename, policyname;
```

### Check Key Columns

```sql
-- Verify key columns exist and have correct types
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('pinboards', 'link_pins', 'note_pins', 'event_pins', 'profiles')
  AND column_name IN ('owner_user_id', 'status', 'pinboard_id')
ORDER BY table_name, column_name;
```

### Test Public Access (Unauthenticated)

```sql
-- Test public SELECT on pinboards (should only return trial/active)
-- Run this as an unauthenticated user (anon role)
SELECT id, slug, title, status, owner_user_id
FROM pinboards
WHERE status IN ('trial', 'active')
LIMIT 5;

-- Test public SELECT on link_pins (should only return for public pinboards)
SELECT lp.id, lp.title, lp.url, lp.pinboard_id, p.status
FROM link_pins lp
JOIN pinboards p ON lp.pinboard_id = p.id
WHERE p.status IN ('trial', 'active')
LIMIT 5;
```

### Test Owner Access (Authenticated)

```sql
-- Test owner SELECT (replace 'USER_ID_HERE' with actual auth.uid())
SELECT id, slug, title, status, owner_user_id
FROM pinboards
WHERE owner_user_id = 'USER_ID_HERE';

-- Test owner can SELECT their own link_pins
SELECT lp.id, lp.title, lp.pinboard_id, p.owner_user_id
FROM link_pins lp
JOIN pinboards p ON lp.pinboard_id = p.id
WHERE p.owner_user_id = 'USER_ID_HERE'
LIMIT 5;
```

### Check Foreign Key Constraints

```sql
-- Verify foreign key relationships
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('link_pins', 'note_pins', 'event_pins')
ORDER BY tc.table_name;
```

## Action Items

- [ ] Review all policies and document findings above
- [ ] Verify public access works for trial/active pinboards only
- [ ] Verify owner access is properly scoped to auth.uid()
- [ ] Test that users cannot access other users' private pinboards
- [ ] Verify foreign key constraints exist and are correct
- [ ] Document any missing policies or security gaps
