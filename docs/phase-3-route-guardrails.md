# Phase 3 Route Guardrails

Expected authentication and authorization behavior for Pinboardly routes.

## Owner-Only Routes (`/app/*`)

### Expected Behavior

**When signed out:**
- Redirect to `/app/login`
- No access to protected content
- Implemented via `app/app/(protected)/layout.tsx` using `redirect("/app/login")`

**When signed in:**
- Render page normally
- User can access their own pinboards and content
- Auth state checked via `supabase.auth.getUser()`

### Protected Routes
- `/app/dashboard` - User's pinboard list
- `/app/account` - User account settings
- `/app/pinboards/new` - Create new pinboard
- `/app/pinboards/[pinboardId]/edit` - Edit pinboard (with ownership check)
- `/app/verify-email` - Email verification page

## Public Routes (`/[slug]*`)

### Expected Behavior

**Missing slug (pinboard not found):**
- Main route `/[slug]`: Renders message "Pinboard not found"
- Sub-routes `/[slug]/links`, `/[slug]/notes`, `/[slug]/events`: Call `notFound()` (404 page)

**Inactive pinboard (status not 'trial' or 'active'):**
- Main route `/[slug]`: Renders message "This pinboard is not active"
- Sub-routes: Same as missing (no data leak - should not reveal existence)
- No distinction between missing and inactive to prevent information disclosure

**Active pinboard (status 'trial' or 'active'):**
- Render public, read-only view
- Show Links, Notes, Events sections
- No edit controls or auth-required features

### Public Routes
- `/[slug]` - Main public pinboard view
- `/[slug]/links` - Links-only view
- `/[slug]/notes` - Notes-only view
- `/[slug]/events` - Events-only view
- `/demo` - Redirects to `/tynemouth-scouts`

## Manual Test Checklist

### Owner-Only Routes

- [ ] Navigate to `/app/dashboard` while signed out → redirects to `/app/login`
- [ ] Navigate to `/app/account` while signed out → redirects to `/app/login`
- [ ] Navigate to `/app/pinboards/new` while signed out → redirects to `/app/login`
- [ ] Sign in, then navigate to `/app/dashboard` → page renders
- [ ] Sign in, then navigate to `/app/account` → page renders
- [ ] Sign in, then navigate to `/app/pinboards/[pinboardId]/edit` for own pinboard → page renders
- [ ] Sign in, then navigate to `/app/pinboards/[pinboardId]/edit` for other user's pinboard → shows "Pinboard not found"

### Public Routes

- [ ] Navigate to `/[non-existent-slug]` → shows "Pinboard not found" message
- [ ] Navigate to `/[slug]/links` for non-existent slug → shows 404 page
- [ ] Navigate to `/[slug]` for pinboard with status 'removed' → shows "This pinboard is not active"
- [ ] Navigate to `/[slug]` for pinboard with status 'trial' → renders public view
- [ ] Navigate to `/[slug]` for pinboard with status 'active' → renders public view
- [ ] Navigate to `/demo` → redirects to `/tynemouth-scouts`

## Security Principles

1. **No information disclosure:** Inactive/missing pinboards should not reveal existence or status
2. **Consistent behavior:** Same error handling for missing and inactive pinboards in sub-routes
3. **Auth required:** All `/app/*` routes require authentication
4. **Public read-only:** `/[slug]*` routes are public but read-only (no mutations)

