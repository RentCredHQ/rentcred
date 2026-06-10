# RentCred — Screen Inventory & State Matrix

> Every screen in the product, grouped by surface, with the routes, layout, and the **states each
> screen must cover**. Use this as the checklist when designing: a screen is not "done" until its
> empty, loading, and error states are designed — not just the happy path. Routes map 1:1 to files
> under `apps/web/pages/`.

**Layouts:** `default` (marketing, dark nav/footer) · `auth` (split-screen) · `dashboard` (agent) ·
`ops` · `field-agent` · `tenant`. Each in-app layout = sidebar + top bar (desktop) / drawer + bottom
tabs (mobile).

**Universal states to design for every data screen:**
`loading` (spinner) · `empty` (icon + heading + helper) · `error` (message + retry/CTA) ·
`populated` · `paginated` (where lists exceed a page) · plus `mobile` vs `desktop` rendering.

---

## 1. Marketing / public (`default` layout)

| Screen | Route | Notes & key states |
|--------|-------|--------------------|
| Landing | `/` | Hero (floating stat cards, animated) · Problem (with/without grid) · How it works (3 steps) · Sample report card · Testimonials · Pricing (4 bundles, "Most Popular") · Final CTA. Prerendered. |
| For Landlords | `/for-landlords` | Audience-specific value prop. |
| About | `/about` | Company story. |
| Contact | `/contact` | Form: idle / submitting / success / error. |
| Careers (list) | `/careers` | List + empty state. |
| Career detail | `/careers/[slug]` | Detail + not-found. |
| Status tracker | `/status` | Public case-status lookup: idle / found / not-found. |
| Status detail | `/status/[id]` | Timeline of a case by id. |
| Privacy | `/privacy` | Legal long-form. |
| Terms | `/terms` | Legal long-form. |
| NDPR | `/ndpr` | Compliance long-form (trust surface). |
| **Shared report (public)** | `/reports/shared/[token]` | **Flagship.** States: loading · valid report (verified badge, property + tenant details, per-check verdicts, recommendation) · **expired/invalid link** (`link_off`, "Report Not Found"). No login. Print/PDF-friendly. |

---

## 2. Auth (`auth` layout — split screen)

| Screen | Route | States |
|--------|-------|--------|
| Login | `/auth/login` | idle / validating / error (bad creds) / loading. |
| Register | `/auth/register` | multi-field form; success → verify-email. |
| Forgot password | `/auth/forgot-password` | idle / sent confirmation / error. |
| Reset password | `/auth/reset-password` | valid token form / invalid-expired token / success. |
| Verify email | `/auth/verify-email` | pending / verifying / verified / failed. |

---

## 3. Agent (`dashboard` layout)

| Screen | Route | Notes & key states |
|--------|-------|--------------------|
| Dashboard | `/dashboard` | KYB banner (if not approved) · 3 KPI tiles (credits w/ progress bar, active checks, reports ready) · submissions table (desktop) / recent-activity cards (mobile). Loading / empty / populated / paginated. |
| Submit wizard | `/dashboard/submit/[step]` | 4 steps: tenant info → property → package → review. Per-step validation, progress, photo upload (0–5), KYB/credit gate, confirm-before-spend. |
| My submissions (list) | `/dashboard/submissions` | Filterable/searchable list. loading/empty/error/paginated. |
| Submission detail | `/dashboard/submissions/[id]` | Status timeline, details, actions (view/share/resend). not-found. |
| Reports (list) | `/dashboard/reports` | List of ready/approved reports. empty/loading. |
| Report detail | `/dashboard/reports/[id]` | Full report view + share action. |
| Credits | `/dashboard/credits` | Balance + bundles; opens Purchase Credits modal. |
| Payments | `/dashboard/payments` | Invoice/transaction history; detail modal. empty/loading. |
| Disputes | `/dashboard/disputes` | List + new-dispute modal + detail modal. empty. |

**Agent modals:** Purchase Credits · Edit Profile · Invoice Detail · Share Report · Notifications
dropdown · Profile dropdown.

---

## 4. Ops / Admin (`ops` layout)

| Screen | Route | Notes & key states |
|--------|-------|--------------------|
| Ops dashboard | `/ops` | Queue overview / KPIs. |
| Cases (list) | `/ops/cases` | The main work queue. Filters (FilterBar/Tabs/Dropdown/Search), dense table, paginated, empty. |
| Case detail | `/ops/cases/[id]` | Review submission, assign/reassign field agent, generate report, approve report. Multiple sub-states by case status. |
| Kanban board | `/ops/kanban` | Cases by pipeline stage (columns), drag context. empty columns. |
| KYB queue | `/ops/kyb` | Pending KYB apps; review modal (approve/reject + reason). empty. |
| Field agents | `/ops/field-agents` | Roster; add-agent modal; agent-detail modal. |
| Payments | `/ops/payments` | All transactions; detail modal. |
| Disputes | `/ops/disputes` | All disputes; new + detail modals; resolve. |
| Audit log | `/ops/audit-log` | Read-only, filterable, timestamped, dense. |
| Reports | `/ops/reports` | All reports across agents; approval surface. |

**Ops modals:** Add Agent · Agent Detail · Case Reassign · Dispute Detail · New Dispute · KYB Review
· Report Approval · Transaction Detail · Notifications · Profile.

---

## 5. Field Agent (`field-agent` layout)

| Screen | Route | Notes & key states |
|--------|-------|--------------------|
| Home | `/field-agent` | Today's assignments / summary. empty (no visits). |
| Visits (list) | `/field-agent/visits` | Assigned visits; status. empty. |
| Visit detail | `/field-agent/visits/[id]` | Address, tenant, what to verify. |
| Submit visit | `/field-agent/visits/[id]/submit` | Field report form: findings + photos. validation / submitting / success. |
| Schedule | `/field-agent/schedule/index` | Calendar/agenda of upcoming visits. empty. |
| Reports | `/field-agent/reports` | Past submitted visit reports. |
| Notifications | `/field-agent/notifications` | List + empty. |
| Profile | `/field-agent/profile` | View profile. |
| Edit profile | `/field-agent/profile/edit` | Form. |

---

## 6. Tenant (`tenant` layout)

| Screen | Route | Notes & key states |
|--------|-------|--------------------|
| Home | `/tenant` | Overview / status of their verification. |
| Profile wizard | `/tenant/profile/[step]` | Multi-step profile completion (post-invite). progress, validation. |
| Verification | `/tenant/verification` | Status of checks on them. |
| Reports | `/tenant/reports` | Their own approved report(s). empty/locked-until-approved. |
| Reviews | `/tenant/reviews` | Leave/view reviews (agent/landlord/property); ReviewForm. |
| Disputes | `/tenant/disputes` | File/track disputes. |

---

## 7. Shared settings (`/settings`)

| Screen | Route | Notes |
|--------|-------|-------|
| Settings home | `/settings` | Hub. |
| Billing | `/settings/billing` | Plan/credits/payment methods. |
| KYB | `/settings/kyb` | KYB application form + status. |
| Notifications | `/settings/notifications` | Preferences. |
| Audit | `/settings/audit` | Personal action history. |
| Disputes | `/settings/disputes` + `/settings/disputes/[id]` | List + detail. |

---

## 8. System / cross-cutting

| Surface | Notes |
|---------|-------|
| Error page | `error.vue` — global error/404 boundary. Design a branded 404 + generic error. |
| Notifications dropdown | Per-role panel from the bell; unread/empty states. |
| Profile dropdown | Avatar menu: profile, settings, sign out. |
| KYB gate banner | Persistent dark strip until KYB approved (states: start / under review). |
| Toasts / inline alerts | Success/error feedback after actions (define if not yet consistent). |

---

## 9. State-coverage checklist (per screen)
- [ ] **Loading** — spinner (`progress_activity` + `animate-spin`).
- [ ] **Empty** — icon-in-circle + heading + helper + (optional) primary CTA.
- [ ] **Error** — clear message + recovery action; for public/expired links, a dedicated state.
- [ ] **Populated** — happy path.
- [ ] **Paginated / overflow** — long lists, "Showing X of Y", Prev/Next.
- [ ] **Permission/gate** — e.g. KYB-blocked, insufficient credits.
- [ ] **Mobile vs desktop** — tables → cards; sidebar → drawer + bottom tabs.
- [ ] **Light & dark** (in-app surfaces).
