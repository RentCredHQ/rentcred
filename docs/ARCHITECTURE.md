# RentCred — System Architecture

## Overview

RentCred is a monorepo built with Turborepo containing three packages:

```
rentcred/
├── apps/api        NestJS REST API
├── apps/web        Nuxt 3 SSR frontend
└── packages/shared Zod schemas + Nigerian constants (shared types)
```

All packages are TypeScript-first. The shared package is the single source of truth for validation logic consumed by both the API and the frontend.

---

## Request Flow

### Authenticated Request

```
Browser → Nuxt (apps/web)
           └─ useApi() composable
                └─ $fetch with Authorization: Bearer <JWT>
                     └─ NestJS API (apps/api)
                          ├─ JwtAuthGuard  (validates token, attaches req.user)
                          ├─ RolesGuard    (checks @Roles() decorator)
                          └─ Controller → Service → Prisma → PostgreSQL
```

### File Upload Flow

```
Browser selects file
  └─ POST /upload/presign  (API returns S3 presigned URL + final key)
       └─ Browser PUTs file directly to S3
            └─ key stored in DB (e.g. Submission.propertyImages[])
```

### Payment Flow

```
Agent clicks "Buy Credits"
  └─ POST /payments/purchase  → returns Paystack authorization_url
       └─ Browser redirected to Paystack checkout
            └─ Paystack POSTs webhook to POST /payments/webhook
                 ├─ HMAC signature verified
                 ├─ Transaction marked completed
                 └─ Agent credit balance incremented
```

### Public Report Sharing

```
Agent clicks "Share Report"
  └─ POST /reports/:id/share  → generates UUID shareToken stored in DB
       └─ Returns shareUrl = FRONTEND_URL/reports/shared/:token

Anyone opens shareUrl (no login required)
  └─ GET /reports/shared/:token  → returns sanitized report data
       └─ Nuxt renders /reports/shared/[token].vue
```

---

## Database Schema

### Entity Relationships

```
User ──────────── AgentProfile ─── KybApplication
  │                    └──────────── Transaction[]
  │
  ├──────────── TenantProfile
  │
  ├──────────── OpsProfile
  │
  ├── Submission[] (as agent)
  │       ├── VerificationChecklist (1:1)
  │       ├── FieldAssignment[]
  │       ├── FieldVisit[]
  │       ├── Report (1:1)
  │       ├── Dispute[]
  │       └── Review (1:1)
  │
  ├── Notification[]
  ├── AuditLog[]
  ├── Dispute[] (as raisedBy)
  ├── FieldVisit[] (as fieldAgent)
  ├── FieldAssignment[] (as fieldAgent)
  └── Review[] (as tenant)
```

### Key Models

#### User
Central identity model. Role determines which profile relationship is populated.

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| email | String | Unique |
| role | Enum | admin, agent, tenant, ops, field_agent |
| agentProfile | Relation | Populated when role=agent |
| tenantProfile | Relation | Populated when role=tenant |
| opsProfile | Relation | Populated when role=ops or admin |

#### Submission
Core workflow entity. One submission = one tenant verification request.

| Field | Type | Notes |
|-------|------|-------|
| status | String | pending → in_progress → field_visit → report_building → completed / rejected |
| agentId | FK → User | Submitting agent |
| propertyType | String | Self-Contained, Mini Flat, 2-Bedroom, etc. |
| annualRent | Float | Annual rent in naira |
| propertyImages | String[] | S3 object keys |
| bedrooms | Int | 0 = studio, 1–6 for residential |

#### Submission Status Machine

```
pending
  └─ in_progress    (ops picks up case)
       └─ field_visit     (field agent assigned)
            └─ report_building  (all checklist items complete)
                 └─ completed   (report approved)
                 └─ rejected    (report rejected or case closed)
```

#### Report
Generated once all verification checklist items are complete.

| Field | Type | Notes |
|-------|------|-------|
| status | String | draft → pending_approval → approved / rejected |
| content | Json | Structured report body (summary, risk level, recommendations) |
| shareToken | String? | UUID generated on share action |
| approvedBy | FK → User | Ops user who approved |

#### TenantProfile (5-step onboarding)

| Step | Fields |
|------|--------|
| 1 — Personal | dateOfBirth, gender, maritalStatus, stateOfOrigin, currentAddress, ninNumber |
| 2 — Employment | employerName, employerAddress, jobTitle, monthlyIncome, employmentType |
| 3 — References | ref1Name, ref1Phone, ref1Relationship, ref2Name, ref2Phone, ref2Relationship |
| 4 — Documents | idDocumentUrl, proofOfIncomeUrl, utilityBillUrl |
| 5 — Consent | consentGiven, consentDate, profileComplete |

---

## Module Architecture (API)

Each NestJS module follows the same structure:

```
modules/[name]/
├── [name].module.ts       Imports, providers, exports
├── [name].controller.ts   HTTP routes, guards, @Roles decorators
├── [name].service.ts      Business logic, Prisma calls
├── [name].service.spec.ts Unit tests (Jest + @nestjs/testing)
└── dto/
    └── [name].dto.ts      class-validator DTOs
```

### Modules

| Module | Responsibility |
|--------|---------------|
| `auth` | Register, login, JWT strategy, `/auth/me`, email verification, password reset |
| `submissions` | Create/list/update tenant verification cases |
| `reports` | Generate, review, approve, share verification reports |
| `disputes` | File and resolve disputes against submissions |
| `reviews` | Post-verification tenant reviews (agent/landlord/property ratings) |
| `tenants` | Tenant profile CRUD, consent, find submissions/reports by email |
| `field-agents` | Assignment management, visit submission, dashboard stats |
| `payments` | Credit bundles, Paystack purchase/webhook/verification, history |
| `kyb` | Agent KYB application submission and ops review |
| `verification` | Verification checklist get/update (drives checklist items to completion) |
| `notifications` | List and mark-as-read for in-app notifications |
| `audit` | Read-only audit log (admin/ops only) |
| `upload` | Generate S3 presigned PUT URLs for client-side uploads |
| `agents` | Agent profile + public reviews endpoint |
| `ops` | Ops-only endpoints (kanban board, etc.) |

---

## Authentication & Authorization

### JWT Strategy

Tokens are signed with `JWT_SECRET` and expire in `JWT_EXPIRES_IN` (default: 7 days). The payload contains:

```json
{
  "sub": "user-cuid",
  "email": "user@example.com",
  "role": "agent"
}
```

### Guards

| Guard | Applied | Purpose |
|-------|---------|---------|
| `JwtAuthGuard` | Most routes | Validates bearer token, attaches `req.user` |
| `RolesGuard` | Role-restricted routes | Checks `req.user.role` against `@Roles(...)` |

### Guard Usage Pattern

```typescript
@UseGuards(JwtAuthGuard)           // require any authenticated user
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ops', 'admin')             // require specific roles
```

Public routes use `@Public()` decorator to bypass `JwtAuthGuard`.

---

## Frontend Architecture

### State Management

Single Pinia store (`useAuthStore`) holds:
- `user` — authenticated user object (id, name, email, role, creditBalance, kybStatus)
- `token` — JWT stored in `localStorage`
- `isLoading` — login/register loading state

The `auth.client.ts` plugin calls `fetchUser()` on every page load (client-side only) to restore the session from `localStorage`.

### Composables (API Layer)

All API communication is centralized in composables. Each composable wraps the base `useApi()` composable which injects the JWT token automatically.

| Composable | API Coverage |
|-----------|-------------|
| `useSubmissions` | Create, list, get, update, assign field agent |
| `useReports` | List, get, share, review, get shared (public) |
| `useDisputes` | Create, list, get, resolve |
| `useReviews` | Create, get mine, get by agent, update status |
| `useTenantProfile` | Get/update profile steps, consent, get submissions/reports |
| `usePayments` | Bundles, purchase, verify, history, stats |
| `useKyb` | Apply, get applications, review |
| `useNotifications` | List, mark read, unread count |
| `useAuditLog` | List audit entries |
| `useAgents` | Profile, stats, dashboard |
| `useUpload` | S3 presigned upload flow |

### Layout System

Each role has its own Nuxt layout with its own sidebar navigation:

| Layout | Used by |
|--------|---------|
| `dashboard.vue` | Agents (`/dashboard/*`) |
| `ops.vue` | Ops and Admin (`/ops/*`) |
| `field-agent.vue` | Field agents (`/field-agent/*`) |
| `tenant.vue` | Tenants (`/tenant/*`) |
| `default.vue` | Public pages (landing, status, shared reports) |
| `auth.vue` | Login, register, forgot password |

---

## Shared Package

`packages/shared` is consumed by both `apps/api` (DTOs) and `apps/web` (form validation):

```
packages/shared/src/
├── schemas/
│   ├── auth.schema.ts          loginSchema, registerSchema
│   ├── submission.schema.ts    createSubmissionSchema
│   ├── review.schema.ts        createReviewSchema
│   └── tenant.schema.ts        tenantPersonalInfoSchema, tenantEmploymentSchema, ...
└── constants/
    ├── property-types.ts       PROPERTY_TYPES, PROPERTY_CONDITIONS
    └── nigeria.ts              NIGERIAN_STATES, NIGERIAN_LGAS (36 states + FCT)
```

---

## Security Measures

| Layer | Measure |
|-------|---------|
| API | Helmet middleware (security headers) |
| API | Rate limiting via `@nestjs/throttler` |
| API | JWT expiry (7 days default) |
| API | `bcrypt` password hashing (10 rounds) |
| API | Input validation via `class-validator` on all DTOs |
| API | CORS configured to allow only `FRONTEND_URL` |
| API | Paystack webhook HMAC-SHA512 signature verification |
| File uploads | Presigned URLs expire; files go directly to S3 (API never handles binary) |
| DB | `DATABASE_URL` never exposed to frontend |
| Frontend | JWT stored in `localStorage` (client-only plugin, no SSR) |

---

## Testing

Unit tests use Jest 29 with `@nestjs/testing`. All 10 backend service modules have spec files.

```bash
cd apps/api && npm test              # run all tests
cd apps/api && npm test -- --coverage # with coverage report
```

Test files follow the `*.service.spec.ts` naming convention and live alongside the source files in `src/modules/`. Mock providers use `jest.fn()` with `jest.clearAllMocks()` in `beforeEach`.

See test file locations:
- `src/modules/submissions/submissions.service.spec.ts`
- `src/modules/reports/reports.service.spec.ts`
- `src/modules/disputes/disputes.service.spec.ts`
- `src/modules/reviews/reviews.service.spec.ts`
- `src/modules/tenants/tenants.service.spec.ts`
- `src/modules/field-agents/field-agents.service.spec.ts`
- `src/modules/payments/payments.service.spec.ts`
- `src/modules/verification/verification.service.spec.ts`
- `src/modules/kyb/kyb.service.spec.ts`
- `src/modules/auth/auth.service.spec.ts`
- `packages/shared/src/__tests__/validation.spec.ts`
