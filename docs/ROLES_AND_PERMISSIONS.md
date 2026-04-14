# RentCred — Roles & Permissions

## Roles Overview

| Role | Dashboard | Created By | Description |
|------|-----------|------------|-------------|
| `admin` | `/ops` | Seeded / ops team | Full system access, cannot be self-registered |
| `ops` | `/ops` | Seeded / admin | Operations staff — reviews cases, approves reports |
| `agent` | `/dashboard` | Self-registration | Real estate agents who submit tenants |
| `field_agent` | `/field-agent` | Seeded / ops | Staff who conduct physical property visits |
| `tenant` | `/tenant` | Self-registration | Tenants who have been submitted for verification |

---

## Access Control Matrix

### Submissions

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| Create submission | — | — | ✅ own only | — | — |
| View all submissions | ✅ | ✅ | own only | — | — |
| View own submission | ✅ | ✅ | ✅ | — | — |
| Update status | ✅ | ✅ | — | — | — |
| Assign field agent | ✅ | ✅ | — | — | — |

### Reports

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| View reports | ✅ all | ✅ all | own only | — | own only (approved) |
| Review (approve/reject) | ✅ | ✅ | — | — | — |
| Share report | — | — | ✅ own only | — | — |
| View shared report (public) | ✅ | ✅ | ✅ | ✅ | ✅ |

### Disputes

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| File dispute | — | — | ✅ | — | ✅ |
| View disputes | ✅ all | ✅ all | own only | — | own only |
| Resolve dispute | ✅ | ✅ | — | — | — |

### Reviews

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| Submit review | — | — | — | — | ✅ (completed subs only) |
| View reviews | ✅ | ✅ | own agent reviews | — | own reviews |
| Flag/remove review | ✅ | ✅ | — | — | — |
| View agent reviews (public) | ✅ | ✅ | ✅ | ✅ | ✅ |

### Tenant Profiles

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| View own profile | — | — | — | — | ✅ |
| Update own profile | — | — | — | — | ✅ |
| View any profile | ✅ | ✅ | — | — | — |

### Field Agent Operations

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| View all field agents | ✅ | ✅ | — | — | — |
| View own assignments | — | — | — | ✅ | — |
| Update own assignment status | — | — | — | ✅ | — |
| Submit visit report | — | — | — | ✅ | — |

### Payments & Credits

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| Purchase credits | — | — | ✅ | — | — |
| View own transactions | — | — | ✅ | — | — |
| View all transactions | ✅ | ✅ | — | — | — |
| View payment stats (all) | ✅ | ✅ | — | — | — |
| View payment stats (own) | — | — | ✅ | — | — |

### KYB

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| Submit KYB application | — | — | ✅ | — | — |
| View own application | — | — | ✅ | — | — |
| View all applications | ✅ | ✅ | — | — | — |
| Review (approve/reject) | ✅ | ✅ | — | — | — |

### Verification Checklist

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| View checklist | ✅ | ✅ | ✅ own | — | — |
| Update checklist | ✅ | ✅ | — | — | — |

### Notifications

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| View own notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark as read | ✅ | ✅ | ✅ | ✅ | ✅ |

### Audit Log

| Action | admin | ops | agent | field_agent | tenant |
|--------|-------|-----|-------|-------------|--------|
| View audit log | ✅ | ✅ | — | — | — |

---

## Notification Events by Role

Each role receives notifications for events relevant to them:

| Event | Recipients |
|-------|-----------|
| Submission created | Ops team |
| Field agent assigned | Field agent |
| Field visit submitted | Agent (submitting agent) |
| Report approved | Agent |
| Report rejected | Agent |
| Report shared | (no notification) |
| Dispute filed | Agent + Ops + Tenant |
| Dispute resolved | Agent + Tenant + Raiser |
| KYB application submitted | Ops team |
| KYB approved | Agent |
| KYB rejected | Agent |
| Credit purchase successful | Agent |

---

## Registration vs. Seeded Accounts

| Role | How Created |
|------|------------|
| `agent` | Self-registration via `/auth/register` |
| `tenant` | Self-registration via `/auth/register` |
| `ops` | Seeded by admin or created manually in database |
| `field_agent` | Seeded by admin or created manually in database |
| `admin` | Seeded via `npm run db:seed` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars |

The registration endpoint explicitly rejects `role: 'ops'`, `role: 'field_agent'`, and `role: 'admin'` to prevent unauthorized privilege escalation.

---

## Guard Implementation

```typescript
// Any authenticated user
@UseGuards(JwtAuthGuard)

// Specific roles only
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ops', 'admin')

// Mixed: class-level auth, method-level roles
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
  @Post()
  @UseGuards(RolesGuard)
  @Roles('agent', 'tenant')
  create() { ... }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles('ops', 'admin')
  resolve() { ... }
}

// Public endpoint (no auth)
@Public()
@Get('shared/:token')
findByShareToken() { ... }
```

---

## Ops Department Permissions

The `OpsProfile` model stores a `permissions` string array that can be used for granular ops-level control (in addition to the role-level guard). Current values used in seed data:

| Permission | Purpose |
|-----------|---------|
| `manage_users` | User management |
| `manage_submissions` | Create/edit all submissions |
| `manage_reports` | Approve/reject reports |
| `manage_disputes` | Resolve disputes |
| `manage_kyb` | Review KYB applications |
| `view_analytics` | Access platform analytics |
| `view_cases` | Read-only case access |
| `edit_cases` | Edit case details |
| `approve_reports` | Report approval only |
| `view_kyb` | Read-only KYB access |
| `review_kyb` | KYB approval access |
