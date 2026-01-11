# Pinboardly Launch Checklist (v1.5)

This checklist is designed to be run in order.
Goal: confirm public guardrails, paid creation enforcement, and Stripe checkout + webhook flows end-to-end.

---

## 0) Snapshot
Record:
- Git commit SHA:
- Environment: Local / Vercel Preview / Vercel Production
- Supabase project:
- Stripe mode: Test / Live
- Canonical domain (NEXT_PUBLIC_SITE_URL / APP_URL):

---

## 1) Environment variables (Vercel)
Confirm these exist and are correct in the target environment:

### Supabase
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (webhooks/admin only)

### Stripe
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_MONTHLY
- STRIPE_PRICE_YEARLY

### App
- NEXT_PUBLIC_SITE_URL (canonical public URL)
- APP_URL (same canonical domain)

Notes:
- NEXT_PUBLIC_SITE_URL and APP_URL should match the final domain and scheme (https).
- Price IDs must match the Stripe mode (test IDs in test mode, live IDs in live mode).

---

## 2) Build integrity
### Local
- npm run lint
- npm run build

### Deployed
- Vercel build is green
- No unexpected runtime errors in logs

---

## 3) Public access guardrails (must be enforced)
Using a known pinboard slug:
- Status = active or trial:
  - GET /{slug} loads
  - GET /{slug}/links loads
  - GET /{slug}/notes loads
  - GET /{slug}/events loads

- Status = inactive (anything not trial/active):
  - /{slug} blocked appropriately
  - /{slug}/links blocked appropriately
  - /{slug}/notes blocked appropriately
  - /{slug}/events blocked appropriately

Also verify:
- Random/non-existent slug returns sensible not-found behaviour

Record results:
- Active/trial slug tested:
- Inactive slug tested:
- Behaviour observed:

---

## 4) Stripe checkout end-to-end (TEST MODE first)
### A) Create pinboard flow
1. Start from the “create pinboard” path used by the app
2. Choose monthly and complete checkout with Stripe test card
3. Confirm redirect returns to /billing/success (or equivalent success route)
4. Confirm webhook processes the event and updates the pinboard status as expected

Repeat for yearly.

Record:
- Monthly checkout session id:
- Monthly webhook event id:
- Resulting pinboard status:
- Yearly checkout session id:
- Yearly webhook event id:
- Resulting pinboard status:

### B) Failure paths
- Cancel at Stripe checkout:
  - Confirm /billing/cancel flow is sane
  - Confirm pinboard remains not-active / not-created (as designed)

---

## 5) Refund / chargeback behaviour (if implemented)
For the pinboard created in test mode:
- Trigger a refund in Stripe (test mode)
- Confirm webhook:
  - Marks the pinboard as revoked/deleted (per spec)
  - Releases the slug (per spec)
  - Public pages become blocked (trial/active rule should stop access)

Record:
- Refund event id:
- Pinboard status after:
- Slug released (Y/N):

---

## 6) Email verification post-payment (if implemented)
- Complete checkout and confirm verification email sent (or verification requirement enforced)
- Confirm expected behaviour until verified:
  - Can/can’t access owner area as designed
  - Public access remains as designed

Record:
- Email sent (Y/N):
- Verified flow works (Y/N):

---

## 7) Rate limits and abuse guardrails (spot check)
- Attempt rapid repeat requests to public pages
- Attempt repeated pin creation calls (if applicable)
- Confirm responses are stable and not producing log spam

---

## 8) Observability spot check
- Stripe webhook logs show expected high-level entries
- Errors are actionable and not noisy
- No secrets are printed to logs

---

## 9) Go/No-Go decision
Go if all are true:
- Build + deploy green
- Public guardrails enforced on all four public routes
- Stripe checkout + webhook flow works for monthly + yearly
- Refund/chargeback behaviour matches spec (if present)
- No unexpected log noise or errors

Decision:
- GO / NO-GO
- Notes:
