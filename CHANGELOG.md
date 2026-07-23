# Changelog

## Release Readiness Remediation — July 2026

A full audit found the platform not release-ready. This pass fixed the findings
across security, data integrity, lifecycle correctness, and the frontend. The
two documents that previously described the project as "production ready"
(`IMPLEMENTATION_COMPLETE.md`, `HIGH_PRIORITY_IMPLEMENTATION.md`) were aspirational
and have been removed.

### Security

- **Shared reports no longer leak PII.** The public share link returned the full
  report — tenant email/phone, landlord phone, employer, income, and field-visit
  GPS and photos. It now carries only the verification outcome and property basics.
- **IDOR closed.** Reading a submission, report, KYB application, or verification
  checklist by id only checked `role === 'agent'`, so any tenant or field agent
  could read anyone's records, and any field agent could edit any checklist.
  Access is now decided per role in one place.
- **KYB and tenant documents are private.** They were served from permanent public
  bucket URLs; they now use short-lived signed downloads behind an ownership check.
  Uploads also enforce which role may write to which folder, and sanitize the
  object key.
- **Payments hardened.** The Paystack webhook now reconciles the amount collected
  against the bundle price, uses a constant-time signature comparison, and
  `verifyTransaction` requires a locally-owned pending transaction.
- **Account suspension is effective immediately.** `jwt.strategy` resolves the user
  per request and rejects suspended accounts, rather than trusting a 7-day token.
- Verification and reset tokens are stored hashed; emails are normalized on write
  and on every join; production env validation rejects the example JWT secret and
  the demo admin password.

### Data & deployment

- **Prisma migrations now exist.** They were git-ignored, so the documented
  `migrate deploy` applied nothing and a fresh environment came up empty. A
  baseline plus the release schema changes are committed, and the deploy path is
  verified in CI against an empty database.
- Demo seed data is now internally consistent (a completed case has its visit,
  checklist and report) and idempotent.
- The four orphaned string foreign keys (`assignedOpsId`, `approvedBy`,
  `reviewedBy`, `resolvedBy`) are real relations with referential integrity.

### Lifecycle

- Tenant invitation links now register tenants as tenants (they were being made
  agents), keyed to a normalized email so the tenant sees their own case.
- A rejected KYB application can be resubmitted; a rejected report can be
  regenerated — both were previously dead ends.
- Agents can cancel a pending submission and get their credit back; ops rejection
  refunds too, guarded against double refunds.
- Reassigning a field agent supersedes the previous assignment instead of leaving
  it active forever.
- Report generation requires a completed field visit and checklist.
- Endpoints the frontend already called but that never existed were added:
  `PATCH /auth/me`, `POST /auth/change-password`, `POST /auth/resend-verification`,
  `POST /field-agents`, `PATCH /field-agents/:id/status`, `PATCH /submissions/:id/cancel`.

### Frontend

- The header notification dropdowns and the ops audit log showed fabricated data
  to every user; both now read real data with loading, empty and error states.
- Broken modals repaired: report sharing, credit purchase (with the Paystack
  redirect and return handling), transaction detail, agent add/suspend, and new
  dispute. The orphaned invoice modal was removed.
- Email verification works end to end, with an unverified-account banner that
  nudges rather than blocks.
- Dark mode: the shared filter bar and remaining hardcoded status colours across
  the dashboards use design tokens, so they follow the theme.

### Tooling

- CI now type-checks the API, runs lint across the workspace, and verifies
  migrations apply to an empty database — none of which it did before.
