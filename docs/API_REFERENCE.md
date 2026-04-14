# RentCred — API Reference

**Base URL**: `http://localhost:4000/api`
**Swagger UI**: `http://localhost:4000/api/docs`

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication

### POST /auth/register
Register a new user. Role must be `agent` or `tenant`.

**Body**
```json
{
  "name": "Tunde Bakare",
  "email": "tunde@example.com",
  "password": "SecurePass1!",
  "role": "agent"
}
```

**Response** `201`
```json
{
  "user": { "id": "...", "name": "Tunde Bakare", "email": "...", "role": "agent" },
  "token": "<jwt>"
}
```

---

### POST /auth/login
```json
{ "email": "tunde@example.com", "password": "SecurePass1!" }
```

**Response** `200`
```json
{
  "user": { "id": "...", "name": "Tunde Bakare", "role": "agent", "creditBalance": 12, "kybStatus": "approved" },
  "token": "<jwt>"
}
```

---

### GET /auth/me
Returns authenticated user's profile.

**Response** `200`
```json
{
  "id": "...",
  "name": "Tunde Bakare",
  "email": "...",
  "role": "agent",
  "kybStatus": "approved",
  "creditBalance": 12,
  "companyName": "Premier Realty Ltd"
}
```

---

### POST /auth/forgot-password
```json
{ "email": "user@example.com" }
```

### POST /auth/reset-password
```json
{ "token": "<reset-token>", "password": "NewPass1!" }
```

### POST /auth/verify-email
```json
{ "token": "<email-verify-token>" }
```

---

## Submissions

All endpoints require authentication. Agents see only their own submissions; ops/admin see all.

### POST /submissions
Create a new tenant verification request. Deducts 1 credit from agent balance.

**Roles**: `agent`

**Body**
```json
{
  "tenantName": "Kemi Adeyinka",
  "tenantEmail": "kemi@email.com",
  "tenantPhone": "+234 812 000 0001",
  "propertyAddress": "14 Akin Adesola Street, Victoria Island",
  "propertyType": "2-Bedroom",
  "bedrooms": 2,
  "annualRent": 1800000,
  "state": "Lagos",
  "lga": "Eti-Osa",
  "neighborhood": "Victoria Island",
  "landlordName": "Mr. Adewale",
  "landlordPhone": "+234 802 555 7777",
  "propertyCondition": "Good",
  "propertyImages": ["property-images/abc123.jpg"],
  "consentObtained": true
}
```

---

### GET /submissions
List submissions. Agents see only theirs.

**Query params**: `page`, `limit`, `status`, `search`

**Response** `200`
```json
{
  "data": [{ "id": "...", "tenantName": "...", "status": "pending", ... }],
  "pagination": { "total": 24, "page": 1, "limit": 10, "pages": 3 }
}
```

---

### GET /submissions/:id
Get single submission with full details including checklist, field assignments, and report summary.

---

### PATCH /submissions/:id/status
Update submission status.

**Roles**: `ops`, `admin`

**Body**: `{ "status": "in_progress" }`

---

### POST /submissions/:id/assign
Assign a field agent to a submission.

**Roles**: `ops`, `admin`

**Body**
```json
{
  "fieldAgentId": "field-agent-user-id",
  "scheduledDate": "2026-04-15T09:00:00Z"
}
```

---

## Reports

### GET /reports
List reports. Agents see only reports for their submissions.

**Query params**: `page`, `limit`, `status`

---

### GET /reports/:id
Get a single report with full content.

---

### PATCH /reports/:id/review
Approve or reject a report.

**Roles**: `ops`, `admin`

**Body**
```json
{
  "status": "approved",
  "notes": "All checks verified. Strong candidate."
}
```

---

### POST /reports/:id/share
Generate a public shareable link for an approved report.

**Roles**: Agent who owns the submission.

**Response** `201`
```json
{
  "shareToken": "uuid-v4-token",
  "shareUrl": "http://localhost:3000/reports/shared/uuid-v4-token"
}
```

---

### GET /reports/shared/:token
**Public — no authentication required.**

Returns sanitized report data for display.

**Response** `200`
```json
{
  "id": "...",
  "content": { "summary": "...", "riskLevel": "low", "recommendations": "..." },
  "submission": {
    "tenantName": "Kemi Adeyinka",
    "propertyAddress": "14 Akin Adesola Street",
    "propertyType": "2-Bedroom",
    "annualRent": 1800000,
    "state": "Lagos",
    "neighborhood": "Victoria Island",
    "propertyImages": [...]
  },
  "approvedAt": "2026-04-10T14:22:00Z",
  "sharedAt": "2026-04-11T09:00:00Z"
}
```

**Errors**:
- `404` — Token not found or report not yet approved

---

## Disputes

### POST /disputes
File a dispute against a submission.

**Roles**: `agent`, `tenant`

**Body**
```json
{
  "submissionId": "submission-id",
  "reason": "Incorrect information",
  "description": "The property address listed is incorrect."
}
```

---

### GET /disputes
List disputes. Non-ops users see only disputes they raised.

**Query params**: `page`, `limit`, `status`

---

### GET /disputes/:id

---

### PATCH /disputes/:id/resolve
**Roles**: `ops`, `admin`

**Body**
```json
{
  "status": "resolved",
  "resolution": "Verified with agent and corrected address."
}
```

**Status values**: `under_review`, `resolved`, `closed`

---

## Reviews

### POST /reviews
Submit a review. Only allowed after a submission is `completed`. One review per submission.

**Roles**: `tenant`

**Body**
```json
{
  "submissionId": "submission-id",
  "agentRating": 4,
  "agentComment": "Very professional",
  "landlordRating": 3,
  "landlordComment": "Responsive but slow with repairs",
  "propertyRating": 5,
  "propertyComment": "Excellent condition",
  "isAnonymous": false
}
```

---

### GET /reviews/my
Returns all reviews submitted by the authenticated tenant.

---

### GET /reviews/submission/:submissionId
Returns the review for a specific submission.

---

### GET /reviews/agent/:agentId
**Public — no authentication required.**

Returns paginated reviews for an agent with average rating.

**Query params**: `page`, `limit`

---

### PATCH /reviews/:id/status
Flag or remove a review.

**Roles**: `ops`, `admin`

**Body**: `{ "status": "flagged" }` or `{ "status": "removed" }`

---

## Tenants

### GET /tenants/profile
Returns authenticated tenant's full profile.

**Roles**: `tenant`

---

### GET /tenants/profile/status
Returns completion status for each profile step.

**Response** `200`
```json
{
  "steps": {
    "personalInfo": true,
    "employment": true,
    "references": true,
    "documents": false,
    "consent": false
  },
  "completionPercent": 60,
  "profileComplete": false
}
```

---

### PATCH /tenants/profile/personal
### PATCH /tenants/profile/employment
### PATCH /tenants/profile/references
### PATCH /tenants/profile/documents
### POST /tenants/profile/consent

---

### GET /tenants/my-submissions
Returns submissions where `tenantEmail` matches the authenticated user's email.

**Query params**: `page`, `limit`

---

### GET /tenants/my-reports
Returns approved reports for the tenant's submissions.

---

### GET /tenants/:id/profile
**Roles**: `ops`, `admin`

View any tenant's profile.

---

## Field Agents

### GET /field-agents
List all field agents with assignment counts.

**Roles**: `ops`, `admin`

**Query params**: `page`, `limit`, `search`

---

### GET /field-agents/:id
Field agent detail with stats and recent assignments.

**Roles**: `ops`, `admin`

---

### GET /field-agents/my-assignments
Returns assignments for the authenticated field agent.

**Roles**: `field_agent`

**Query params**: `page`, `limit`, `status`

---

### PATCH /field-agents/assignments/:id/status
Update assignment status.

**Roles**: `field_agent` (own assignments only)

**Body**: `{ "status": "in_progress" }` or `{ "status": "completed" }`

---

### POST /field-agents/visits
Submit a field visit report.

**Roles**: `field_agent`

**Body**
```json
{
  "submissionId": "submission-id",
  "visitDate": "2026-04-12T10:30:00Z",
  "notes": "Property is in good condition...",
  "summary": "Tenant profile matches physical inspection.",
  "checklistItems": {
    "propertyExists": true,
    "tenantPresent": true,
    "addressMatches": true,
    "propertyConditionMatch": true
  },
  "photos": ["field-visits/photo1.jpg", "field-visits/photo2.jpg"],
  "gpsLatitude": 6.4281,
  "gpsLongitude": 3.4219
}
```

---

### GET /field-agents/dashboard
Returns statistics for the authenticated field agent.

---

## Payments

### GET /payments/bundles
**Public.**

Returns active credit bundles.

**Response** `200`
```json
[
  { "id": "basic", "name": "Basic", "credits": 5, "priceNgn": 25000 },
  { "id": "standard", "name": "Standard", "credits": 15, "priceNgn": 60000 },
  { "id": "premium", "name": "Premium", "credits": 50, "priceNgn": 175000 }
]
```

---

### POST /payments/purchase
Initiate a Paystack payment for a credit bundle.

**Roles**: `agent`

**Body**: `{ "bundleId": "standard" }`

**Response** `201`
```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "RC-TXN-xxxxxx"
}
```

---

### POST /payments/verify/:reference
Verify a Paystack transaction after redirect.

**Roles**: `agent`

---

### POST /payments/webhook
**Public — called by Paystack, not the frontend.**

Verifies HMAC-SHA512 signature on `x-paystack-signature` header before processing.

---

### GET /payments/history
Returns transaction history for the authenticated user (or all transactions for ops/admin).

**Query params**: `page`, `limit`, `type` (purchase|deduction|refund)

---

### GET /payments/stats
**Roles**: `ops`, `admin` (see all); `agent` (see own).

Returns total and current-month payment stats.

---

## KYB

### POST /kyb/apply
Submit a KYB application.

**Roles**: `agent`

**Body**
```json
{
  "companyName": "Premier Realty Ltd",
  "rcNumber": "RC-284819",
  "cacDocumentUrl": "kyb-docs/cac.pdf",
  "directorIdUrl": "kyb-docs/director-id.jpg",
  "utilityBillUrl": "kyb-docs/utility.jpg"
}
```

---

### GET /kyb/applications
**Roles**: `ops`, `admin` (see all); `agent` (see own).

---

### GET /kyb/applications/:id

---

### PATCH /kyb/applications/:id/review
**Roles**: `ops`, `admin`

**Body**
```json
{
  "status": "approved",
  "notes": "All documents verified."
}
```

**Status values**: `approved`, `rejected`, `under_review`

---

## Verification Checklist

### GET /verification/:submissionId
Returns the verification checklist with completion percentage.

---

### PATCH /verification/:submissionId
Update checklist items. When all 6 items are true, submission transitions to `report_building`.

**Roles**: `ops`, `admin`

**Body**
```json
{
  "identityVerified": true,
  "employmentVerified": true,
  "referencesVerified": true,
  "addressVerified": true,
  "criminalCheckDone": true,
  "fieldVisitCompleted": true
}
```

---

## Notifications

### GET /notifications
Returns notifications for the authenticated user.

**Query params**: `page`, `limit`, `unreadOnly` (boolean)

---

### PATCH /notifications/:id/read
Mark a notification as read.

---

### PATCH /notifications/read-all
Mark all notifications as read.

---

## Audit Log

### GET /audit
**Roles**: `ops`, `admin`

**Query params**: `page`, `limit`, `entityType`, `userId`, `from`, `to`

---

## File Upload

### POST /upload/presign
Generate an S3 presigned URL for direct client-side upload.

**Body**
```json
{
  "filename": "property-photo.jpg",
  "contentType": "image/jpeg",
  "folder": "property-images"
}
```

**Response** `201`
```json
{
  "presignedUrl": "https://s3.eu-west-1.amazonaws.com/rentcred-uploads/...",
  "key": "property-images/uuid-filename.jpg",
  "publicUrl": "https://rentcred-uploads.s3.eu-west-1.amazonaws.com/property-images/uuid-filename.jpg"
}
```

The client then PUTs the file directly to `presignedUrl`. Store `key` in the database.

---

## Agents

### GET /agents/profile
Returns authenticated agent's profile.

**Roles**: `agent`

---

### PATCH /agents/profile
Update agent profile.

**Roles**: `agent`

---

### GET /agents/dashboard
Returns dashboard stats for the authenticated agent.

---

## Ops

### GET /ops/kanban
Returns submission counts grouped by status for kanban board.

**Roles**: `ops`, `admin`

---

## Common Error Responses

| Code | Meaning |
|------|---------|
| `400` | Bad Request — validation failed or invalid input |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — authenticated but insufficient role/ownership |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — duplicate resource (e.g., review already submitted) |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error |

**Error shape**:
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```
