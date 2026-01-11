# Phase 3 Smoke Test

Baseline smoke test checklist to verify known-good state before Phase 3 changes.

## Prerequisites

- [ ] Environment variables configured (`.env.local`)
- [ ] Supabase project accessible
- [ ] Test user account available

## Build & Lint

- [ ] Run `npm run build` - completes without errors
- [ ] Run `npm run lint` - passes with no errors
- [ ] Run `npm run dev` - server starts on port 3000

**Expected result:** All scripts execute successfully.

## Authentication

- [ ] Navigate to `/app/login`
- [ ] Sign in with test credentials
- [ ] TopNav shows "Dashboard" and "Account" links (user authenticated)
- [ ] Navigate to `/app/dashboard` - loads successfully
- [ ] POST to `/auth/signout` (or use sign-out UI if present)
- [ ] TopNav shows "Sign in" link (user not authenticated)

**Expected result:** Sign-in works, TopNav reflects auth state, sign-out works.

## Pinboard CRUD - Links

- [ ] Navigate to `/app/pinboards/[pinboardId]/edit`
- [ ] Add a new link: title, URL, optional description
- [ ] Verify link appears in list
- [ ] Edit the link: change title or URL
- [ ] Verify changes are saved
- [ ] Delete the link
- [ ] Verify link is removed from list

**Expected result:** Link CRUD operations work correctly.

## Pinboard CRUD - Notes

- [ ] Navigate to `/app/pinboards/[pinboardId]/edit`
- [ ] Add a new note: title, markdown body
- [ ] Verify note appears in list
- [ ] Edit the note: change title or body
- [ ] Verify changes are saved
- [ ] Delete the note
- [ ] Verify note is removed from list

**Expected result:** Note CRUD operations work correctly.

## Pinboard CRUD - Events

- [ ] Navigate to `/app/pinboards/[pinboardId]/edit`
- [ ] Add a new event: title, date, optional time, location, description
- [ ] Verify event appears in list
- [ ] Edit the event: change date, time, or other fields
- [ ] Verify changes are saved
- [ ] Delete the event
- [ ] Verify event is removed from list

**Expected result:** Event CRUD operations work correctly.

## Reordering

- [ ] Navigate to `/app/pinboards/[pinboardId]/edit`
- [ ] Drag and drop links to reorder
- [ ] Verify new order persists after page refresh
- [ ] Drag and drop notes to reorder
- [ ] Verify new order persists after page refresh

**Expected result:** Drag-and-drop reordering works and persists.

## Public Pinboard View

- [ ] Navigate to `/[slug]` for a pinboard with status 'trial' or 'active'
- [ ] Verify Links section displays
- [ ] Verify Notes section displays (with markdown rendered)
- [ ] Verify Events section displays (with formatted dates)
- [ ] Navigate to `/demo` - redirects to `/tynemouth-scouts`

**Expected result:** Public pinboard renders correctly, demo redirects.



