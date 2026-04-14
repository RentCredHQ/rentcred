# RentCred — Nigeria's Tenant Verification Platform

RentCred is a B2B SaaS platform that enables Nigerian real estate agents to submit tenants for professional background verification. The platform manages the full lifecycle from submission through field inspection, report generation, and post-verification review.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Documentation](#documentation)
- [Demo Credentials](#demo-credentials)

---

## Overview

### How It Works

```
Agent submits tenant  →  Ops reviews & assigns field agent
       ↓                              ↓
Credits deducted         Field agent conducts site visit
                                      ↓
                         Ops compiles & approves report
                                      ↓
              Agent receives report  →  Tenant views report
                                      ↓
                         Tenant leaves review for agent,
                         landlord, and property
```

### Who Uses It

| User Type | What They Do |
|-----------|-------------|
| **Agent** | Submits tenants, purchases credits, views reports, manages disputes |
| **Ops** | Reviews cases, assigns field agents, approves reports, manages KYB |
| **Field Agent** | Conducts physical property visits, submits visit reports |
| **Tenant** | Completes profile, views their own report, leaves reviews |
| **Admin** | Full system access, audit log, user management |

---

## Quick Start

### Prerequisites

- Node.js >= 20
- PostgreSQL 14+ (running on port 5433 locally)
- Redis 6+
- npm 10+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` — at minimum set:

```env
DATABASE_URL="postgresql://rentcred:rentcred@localhost:5433/rentcred?schema=public"
JWT_SECRET="your-secret-minimum-32-characters"
```

### 3. Start infrastructure

```bash
docker-compose up -d   # starts PostgreSQL + Redis
```

### 4. Set up database

```bash
npm run db:generate    # generate Prisma client
npm run db:push        # sync schema to database
npm run db:seed        # seed demo data
```

### 5. Start dev servers

```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Swagger Docs**: http://localhost:4000/api/docs

See [SETUP.md](./SETUP.md) for detailed setup instructions.

---

## Project Structure

```
rentcred/
├── apps/
│   ├── api/                        # NestJS backend (port 4000)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema
│   │   │   └── seed.ts             # Demo data seeder
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/           # Registration, login, JWT, /me
│   │       │   ├── submissions/    # Tenant verification requests
│   │       │   ├── reports/        # Verification reports & sharing
│   │       │   ├── disputes/       # Dispute management
│   │       │   ├── reviews/        # Post-verification reviews
│   │       │   ├── tenants/        # Tenant profile management
│   │       │   ├── field-agents/   # Field visit management
│   │       │   ├── payments/       # Paystack integration & credits
│   │       │   ├── kyb/            # Know Your Business for agents
│   │       │   ├── verification/   # Verification checklist
│   │       │   ├── notifications/  # In-app notifications
│   │       │   ├── audit/          # Audit log
│   │       │   ├── upload/         # AWS S3 presigned URLs
│   │       │   └── agents/         # Agent profile & stats
│   │       └── common/
│   │           ├── guards/         # JwtAuthGuard, RolesGuard
│   │           └── decorators/     # @Roles(), @Public()
│   │
│   └── web/                        # Nuxt 3 frontend (port 3000)
│       ├── pages/
│       │   ├── auth/               # Login, register, forgot password
│       │   ├── dashboard/          # Agent dashboard
│       │   ├── ops/                # Ops dashboard
│       │   ├── field-agent/        # Field agent dashboard
│       │   ├── tenant/             # Tenant portal
│       │   ├── settings/           # Shared settings
│       │   └── reports/shared/     # Public shared report viewer
│       ├── composables/            # API wrapper composables
│       ├── stores/                 # Pinia auth store
│       ├── layouts/                # Per-role layouts
│       └── components/             # Shared UI components
│
└── packages/
    └── shared/                     # Shared between API and web
        └── src/
            ├── schemas/            # Zod validation schemas
            └── constants/          # Nigerian property types, states, LGAs
```

---

## User Roles

| Role | Dashboard | Description |
|------|-----------|-------------|
| `admin` | `/ops` | Full access to all features and audit logs |
| `ops` | `/ops` | Reviews submissions, approves reports, manages KYB |
| `agent` | `/dashboard` | Submits tenants, buys credits, views own reports |
| `field_agent` | `/field-agent` | Receives visit assignments, submits field reports |
| `tenant` | `/tenant` | Views their report, manages their profile, leaves reviews |

Full permissions matrix: [docs/ROLES_AND_PERMISSIONS.md](./docs/ROLES_AND_PERMISSIONS.md)

---

## Core Features

### Tenant Verification Workflow
- **4-step submission form**: Tenant info → Property description → Package selection → Review
- Property types: Self-Contained, Mini Flat, 2-Bedroom, 3-Bedroom, Duplex, Detached House, Penthouse, Shop/Office Space
- Nigerian state/LGA dropdowns, property image upload (up to 5 photos via AWS S3)
- Credit deduction on submission (1 credit per case)

### KYB (Know Your Business)
- Agents must submit KYB application before accessing the platform fully
- Document upload (CAC certificate, director ID, utility bill)
- Ops reviews and approves/rejects applications
- KYB status gates credit purchases and submissions

### Credit System
- Credits purchased in bundles: Basic (5 credits / ₦25,000), Standard (15 / ₦60,000), Premium (50 / ₦175,000)
- Paystack payment integration with webhook verification
- 1 credit deducted per verified submission

### Reports
- Generated after field visit + checklist completion
- Ops review and approve before agents can see final report
- Shareable via unique token — public page at `/reports/shared/[token]` (no login required)
- Tenant can also view their own approved report

### Disputes
- Agents and tenants can file disputes against submissions
- Ops team reviews and resolves
- All parties notified on status changes

### Reviews
- Tenants can review agent, landlord, and property after a completed verification
- 1–5 star rating per category with optional comments
- Anonymous submission toggle
- One review per completed submission (enforced by backend)

### Notifications
- In-app notification system for all key events
- Stored in database, fetched on demand
- Unread count badge in navbar

### Audit Log
- All significant actions logged (submissions, report approvals, disputes, KYB decisions)
- Accessible to admins and ops

---

## Tech Stack

### Backend (`apps/api`)
| Technology | Purpose |
|-----------|---------|
| NestJS 10 | API framework |
| Prisma 6 | ORM & schema management |
| PostgreSQL 14 | Primary database |
| Redis | Queue backing (BullMQ) |
| Passport + JWT | Authentication |
| Zod | Request validation (shared schemas) |
| Paystack | Payment processing |
| AWS S3 | File/image storage |
| Resend | Transactional email |
| Swagger | Auto-generated API docs |
| Jest 29 | Unit testing |

### Frontend (`apps/web`)
| Technology | Purpose |
|-----------|---------|
| Nuxt 3 | Vue 3 SSR framework |
| Tailwind CSS | Styling |
| Pinia | State management (auth store) |
| `$fetch` / `useApi` | API communication |
| Material Symbols | Icons |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Turborepo | Monorepo build orchestration |
| Docker Compose | Local PostgreSQL + Redis |
| TypeScript | Shared across all packages |

---

## Documentation

| Document | Contents |
|----------|---------|
| [SETUP.md](./SETUP.md) | Local development setup, environment variables, troubleshooting |
| [TEST_PROCEDURE.md](./TEST_PROCEDURE.md) | Manual QA test procedure for all user roles |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture, data model, request flows |
| [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) | Full REST API endpoint reference |
| [docs/ROLES_AND_PERMISSIONS.md](./docs/ROLES_AND_PERMISSIONS.md) | Roles, guards, and access control matrix |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Production deployment guide |

---

## Demo Credentials

All demo accounts use password: **`Admin123!`**

| Role | Email | Notes |
|------|-------|-------|
| Admin | admin@rentcred.ng | Full access |
| Ops (Verification) | chidi.nwosu@rentcred.ng | Case management |
| Ops (KYB) | aisha.bello@rentcred.ng | KYB review |
| Agent | contact@premierrealty.ng | KYB approved, 12 credits |
| Agent | info@luxehomes.ng | KYB approved, 8 credits |
| Agent | hello@urbanspaces.ng | KYB pending, 0 credits |
| Field Agent | ola.adeyemi@rentcred.ng | |
| Field Agent | emeka.okafor@rentcred.ng | |
| Tenant | a.okonkwo@email.com | Profile complete |
| Tenant | grace.obi@email.com | Profile incomplete |

---

## License

Proprietary — RentCred Nigeria. All rights reserved.
