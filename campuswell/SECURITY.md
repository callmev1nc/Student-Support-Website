# Security model

CampusWell uses **Supabase as a PostgreSQL host only**. There is **no Supabase
Auth** and **no Row-Level Security (RLS)**. Every data access goes through
Prisma in server code, so **the application layer is the only access gate**.
Keep it that way.

## Rules for any code that touches the database

1. **Authenticate first.** Use `requireUser()` / `requireRole()` /
   `getSessionUser()` from [`src/lib/session.ts`](src/lib/session.ts). Never
   read or mutate user-owned data without an authenticated `userId`.
2. **Scope every query by the caller.** Every `findMany` / `findUnique` /
   `update` on user-owned rows (tickets, appointments, messages, notifications,
   and the upcoming wellbeing / academic / community tables) MUST include the
   caller's `userId`, or be preceded by a `findUnique` + ownership check. Do
   not run unscoped `findMany` on user-owned tables.
3. **Authorize by role in the action/route, not at the DB.** Role checks
   (STUDENT / STAFF / ADMIN) happen in server actions and route handlers
   (e.g. `requireRole("ADMIN")`), not via database policies.
4. **Validate input.** Use the zod schemas in
   [`src/lib/validation.ts`](src/lib/validation.ts) (`parseForm` / `safeParse`)
   for all mutations.
5. **Verify ownership before mutating.** Mirror the existing pattern:
   `findUnique` the row, confirm `row.studentId === userId` (or the role
   allows), then mutate. See `closeTicket`, `cancelAppointment`.

## Error handling

- **API routes** wrap handlers in `try/catch` and return a generic
  `{ error: "Internal server error" }` (HTTP 500). No Prisma or internal
  detail is sent to the client; diagnostics go to server logs only.
- **Server actions** throw explicit, hand-written messages for validation and
  permission failures (these are intended to surface to the user). Unexpected
  errors are redacted by Next.js in production and surfaced as a digest, so raw
  error text does not leak.

## Rate limiting

[`src/lib/rate-limit.ts`](src/lib/rate-limit.ts) provides an in-memory,
**per-instance** fixed-window limiter covering `/login`, message send/start,
password change, and ticket creation. Because Vercel serverless instances do
not share memory, limits are enforced per instance — acceptable for the current
scale. The `rateLimit({ key, limit, windowMs })` signature is stable so the
backend can later be swapped to a DB-backed token bucket or Upstash Redis
without changing call sites.

## Secrets

- `AUTH_SECRET` (NextAuth JWT signing) is required in production; the dev-only
  static fallback throws loudly if unset in prod ([`src/lib/auth.ts`](src/lib/auth.ts)).
- `JOURNAL_ENCRYPTION_KEY` (Phase 2 wellbeing journal, AES-256-GCM) and
  `ANTHROPIC_API_KEY` (Phase 4 assistant) must be provisioned in Vercel and
  **never** prefixed with `NEXT_PUBLIC_`.

## Reporting

Found a security issue? Please report it privately rather than opening a
public issue.
