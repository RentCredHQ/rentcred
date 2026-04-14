# RentCred — Manual Test Procedure

**Environment**: `http://localhost:3000`
**API**: `http://localhost:3001`
**All demo accounts share the same password**: `Admin123!`

---

## Demo Credentials

| Role | Name | Email |
|------|------|-------|
| Admin | RentCred Admin | admin@rentcred.ng |
| Ops (Verification) | Chidi Nwosu | chidi.nwosu@rentcred.ng |
| Ops (KYB) | Aisha Bello | aisha.bello@rentcred.ng |
| Agent (approved, 12 credits) | Tunde Bakare | contact@premierrealty.ng |
| Agent (approved, 8 credits) | Ngozi Okonkwo | info@luxehomes.ng |
| Agent (KYB pending, 0 credits) | Ibrahim Yusuf | hello@urbanspaces.ng |
| Field Agent | Ola Adeyemi | ola.adeyemi@rentcred.ng |
| Field Agent | Emeka Okafor | emeka.okafor@rentcred.ng |
| Tenant (profile complete) | Adebayo Okonkwo | a.okonkwo@email.com |
| Tenant (profile incomplete) | Grace Obi | grace.obi@email.com |

---

## Test Flows Overview

The platform supports an end-to-end verification lifecycle:

```
Agent submits tenant → Ops reviews & assigns field agent →
Field agent conducts visit & submits report →
Ops approves report → Tenant views report → Tenant leaves review
```

Work through each section below in order for a complete end-to-end test, or jump to individual sections to test specific roles.

---

## Section 1 — Authentication

### 1.1 Login (Happy Path)
1. Go to `http://localhost:3000`
2. Click **Login**
3. Enter `contact@premierrealty.ng` / `Admin123!`
4. **Expected**: Redirected to `/dashboard`; agent name "Tunde Bakare" visible in navbar

### 1.2 Login (Wrong Password)
1. Enter any valid email with password `wrongpass`
2. **Expected**: Error message "Invalid email or password"

### 1.3 Registration
1. Click **Register** on the login page
2. Fill in name, email (use a unique email), password `Test1234!`
3. Select role: **Agent**
4. **Expected**: Account created; prompted to verify email or redirected to dashboard

### 1.4 Logout
1. Click user avatar or logout link in navbar
2. **Expected**: Redirected to login page; accessing `/dashboard` redirects back to login

---

## Section 2 — Agent Dashboard

Login as: **Tunde Bakare** (`contact@premierrealty.ng`)

### 2.1 Dashboard Home
1. Navigate to `/dashboard`
2. **Expected**: Stats cards show credit balance (12), total submissions count, recent activity

### 2.2 Submit a New Tenant for Verification
1. Click **New Submission** or navigate to `/dashboard/submit/1`
2. **Step 1 — Tenant Info**:
   - Tenant Name: `Kemi Adeyinka`
   - Tenant Email: `kemi.adeyinka@email.com`
   - Tenant Phone: `+234 812 000 0001`
   - Click **Next**
3. **Step 2 — Property Description**:
   - Property Type: `2-Bedroom`
   - Bedrooms: `2`
   - Annual Rent: `1800000`
   - Property Address: `14 Akin Adesola Street, Victoria Island, Lagos`
   - Landlord Name: `Mr. Babatunde Adewale`
   - Landlord Phone: `+234 802 555 7777`
   - Property Condition: `Good`
   - (Optional) Upload a property image
   - Click **Next**
4. **Step 3 — Review & Submit**:
   - Confirm tenant and property details are shown correctly
   - Confirm "1 credit will be deducted" warning is shown
   - Click **Submit**
5. **Expected**:
   - Submission created
   - Credit balance drops from 12 to 11
   - Redirected to submission detail or list page

### 2.3 Submit with Shop/Office Space (Bedroom Field Hidden)
1. Start a new submission, go to Step 2
2. Select Property Type: `Shop/Office Space`
3. **Expected**: Bedroom count field is hidden (not visible in the form)

### 2.4 Submit with Insufficient Credits
1. Login as **Ibrahim Yusuf** (`hello@urbanspaces.ng`) — has 0 credits
2. Attempt to create a new submission
3. **Expected**: Error "Insufficient credits" or redirect to purchase credits page

### 2.5 View Submissions List
1. Navigate to `/dashboard/submissions`
2. **Expected**: Only own submissions visible (not other agents' submissions)
3. Test search filter: type part of tenant name
4. Test status filter: select `pending`

### 2.6 View Submission Detail
1. Click any submission in the list
2. **Expected**: Full details visible including tenant info, property description, verification checklist, timeline

### 2.7 View Reports
1. Navigate to `/dashboard/reports`
2. **Expected**: Reports linked to own submissions are visible

### 2.8 Share a Report
1. Open a report that is **approved**
2. Click **Share Report**
3. **Expected**: Modal opens with a shareable link containing a unique token

### 2.9 Purchase Credits
1. Navigate to `/dashboard/credits`
2. Click **Buy Credits** on the Standard bundle (15 credits / ₦60,000)
3. **Expected**: Paystack checkout opens (or sandbox payment page if in test mode)

### 2.10 File a Dispute (Agent)
1. Navigate to `/dashboard/disputes`
2. Click **File Dispute**
3. Select a submission, fill in reason
4. **Expected**: Dispute created; notification sent to ops

### 2.11 Disputes List
1. View `/dashboard/disputes`
2. **Expected**: Only own disputes visible

---

## Section 3 — Ops Dashboard

Login as: **Chidi Nwosu** (`chidi.nwosu@rentcred.ng`)

### 3.1 Ops Home
1. Navigate to `/ops`
2. **Expected**: Overview stats — pending cases, in-progress cases, completed, disputes

### 3.2 Cases (Submissions) List
1. Navigate to `/ops/cases`
2. **Expected**: ALL submissions across all agents are visible (not filtered to one agent)
3. Test filters: status, search by tenant name

### 3.3 Assign Field Agent to a Submission
1. Click a submission with status `pending` or `in_progress`
2. Click **Assign Field Agent**
3. Select `Ola Adeyemi` from the dropdown
4. **Expected**:
   - Assignment created
   - Submission status updates to `field_visit`
   - Field agent receives notification

### 3.4 Review a Report
1. Navigate to `/ops/reports`
2. Click a report with status `pending_review`
3. Click **Approve Report**
   - Enter approval notes
4. **Expected**:
   - Report status → `approved`
   - Submission status → `completed`
   - Agent receives notification

### 3.5 Reject a Report
1. Open a pending report
2. Click **Reject** (or **Request Changes**)
3. Enter rejection reason
4. **Expected**: Report status → `rejected`; agent notified

### 3.6 KYB Review
1. Navigate to `/ops/kyb`
2. **Expected**: List of KYB applications; Ibrahim Yusuf's application should appear with status `submitted`
3. Click on the application
4. Click **Approve**
5. **Expected**: Agent KYB status updates; agent notified

### 3.7 Dispute Resolution
1. Navigate to `/ops/disputes`
2. **Expected**: ALL disputes visible
3. Click a dispute
4. Set status to `under_review`, then `resolved`
5. **Expected**: All parties (agent, tenant, raiser) notified on resolution

### 3.8 Field Agents Management
1. Navigate to `/ops/field-agents`
2. **Expected**: List of all field agents with assignment counts
3. Click a field agent
4. **Expected**: Detail view with stats and recent assignment history

### 3.9 Payments Overview
1. Navigate to `/ops/payments`
2. **Expected**: All payment transactions visible across all agents; filter by type

### 3.10 Audit Log
1. Navigate to `/settings/audit` (or `/ops/audit-log` if accessible via ops nav)
2. **Expected**: All logged actions visible — submissions, reports, disputes, KYB decisions

---

## Section 4 — Field Agent Dashboard

Login as: **Ola Adeyemi** (`ola.adeyemi@rentcred.ng`)

### 4.1 Dashboard Home
1. Navigate to `/field-agent`
2. **Expected**: Stats showing assigned, completed, and pending visits

### 4.2 View Assignments / Schedule
1. Navigate to `/field-agent/schedule`
2. **Expected**: List of assigned submissions showing tenant name, property address, status

### 4.3 Conduct a Field Visit
1. Click an assignment with status `field_visit`
2. Navigate to `/field-agent/visits/[id]`
3. **Expected**: Tenant info, property details, and verification checklist visible
4. Click **Submit Visit Report**
5. Navigate to `/field-agent/visits/[id]/submit`
6. Fill in visit notes and checklist items
7. Click **Submit**
8. **Expected**:
   - Visit report created
   - Assignment status → `completed`
   - Submission's verification checklist updated
   - Agent (real estate agent) notified
   - If all checklist items complete → submission transitions to `report_building`

### 4.4 View Visit Reports
1. Navigate to `/field-agent/reports`
2. **Expected**: Own submitted visit reports listed

### 4.5 Profile
1. Navigate to `/field-agent/profile`
2. **Expected**: Name, email, phone, assignment stats visible
3. Click **Edit Profile** — update phone number
4. **Expected**: Profile updates successfully

---

## Section 5 — Tenant Dashboard

Login as: **Adebayo Okonkwo** (`a.okonkwo@email.com`)

### 5.1 Tenant Home
1. Navigate to `/tenant`
2. **Expected**: Welcome message, profile completion status, quick-action cards

### 5.2 Profile Onboarding — View Completed Profile
1. Navigate to `/tenant/profile/1`
2. **Expected**: Personal info pre-filled (DOB, gender, marital status, NIN, current address)
3. Navigate through each step to `/tenant/profile/5`
4. Each step should show previously saved data

### 5.3 Profile Onboarding — Grace (Incomplete Profile)
1. Logout and login as **Grace Obi** (`grace.obi@email.com`)
2. Navigate to `/tenant`
3. **Expected**: Profile marked as incomplete; prompted to complete profile
4. Go to `/tenant/profile/1` — personal info step
5. Fill in missing details (e.g., NIN number)
6. Click **Save & Continue**
7. Complete all 5 steps
8. On consent step — check consent checkbox, click **I Consent**
9. **Expected**: `profileComplete` set to true; tenant dashboard reflects full profile

### 5.4 View Verification Status
1. Navigate to `/tenant/verification`
2. **Expected**: Active submission status shown; verification checklist progress visible

### 5.5 View Reports
1. Navigate to `/tenant/reports`
2. **Expected**: Only approved reports for submissions where tenant email matches
3. Click a report
4. **Expected**: Full report details visible (limited/sanitized version without ops-only data)

### 5.6 Submit a Review
1. Navigate to `/tenant/reviews`
2. Click **Leave a Review**
3. **Expected**: Only completed submissions are available for review
4. Select a completed submission
5. Rate the agent (1–5 stars), landlord (1–5 stars), property (1–5 stars)
6. Add written feedback
7. Toggle **Anonymous** if desired
8. Click **Submit Review**
9. **Expected**: Review created; visible in reviews list

### 5.7 File a Dispute (Tenant)
1. Navigate to `/tenant/disputes`
2. Click **File Dispute**
3. Select submission, enter dispute reason
4. **Expected**: Dispute created; ops notified

### 5.8 View Disputes
1. Stay on `/tenant/disputes`
2. **Expected**: Only own disputes visible; status updates reflected

---

## Section 6 — Cross-Role End-to-End Flow

This is the complete lifecycle test. Follow each step sequentially, switching accounts as indicated.

| Step | Actor | Action | Expected Outcome |
|------|-------|--------|-----------------|
| 1 | Agent (Tunde) | Submit new tenant verification | Submission created, credit deducted |
| 2 | Ops (Chidi) | View submission in cases list | Submission visible under "All Cases" |
| 3 | Ops (Chidi) | Assign field agent (Ola Adeyemi) | Status → `field_visit`; Ola notified |
| 4 | Field Agent (Ola) | View assignment in schedule | Assignment visible with property address |
| 5 | Field Agent (Ola) | Submit visit report | Visit recorded; checklist updated; agent notified |
| 6 | Ops (Chidi) | Review report, approve it | Status → `approved`; submission → `completed`; agent notified |
| 7 | Agent (Tunde) | View approved report, generate share link | Share link generated with unique token |
| 8 | Tenant (Adebayo) | View report in tenant dashboard | Report visible under `/tenant/reports` |
| 9 | Tenant (Adebayo) | Leave a review | Review submitted for completed submission |
| 10 | Agent (Tunde) | View review on agent profile | Review visible in agent reviews list |

---

## Section 7 — Settings

Login as any user.

### 7.1 Account Settings
1. Navigate to `/settings`
2. **Expected**: Name, email, phone visible; edit profile modal opens on click

### 7.2 Notifications
1. Navigate to `/settings/notifications`
2. **Expected**: Notification history listed; unread count shows in navbar

### 7.3 KYB Application (Agent Only)
Login as **Ibrahim Yusuf** (`hello@urbanspaces.ng`)
1. Navigate to `/settings/kyb`
2. **Expected**: KYB status `submitted` shown; can view application details

### 7.4 Billing (Agent Only)
1. Navigate to `/settings/billing`
2. **Expected**: Credit balance, payment history, available bundles

### 7.5 Audit Log (Admin/Ops Only)
Login as **admin@rentcred.ng**
1. Navigate to `/settings/audit`
2. **Expected**: All system actions logged with timestamp, actor, entity type

---

## Section 8 — Edge Cases & Negative Tests

| Scenario | Steps | Expected |
|----------|-------|----------|
| Agent views another agent's submission | Log in as Ngozi, manually enter Tunde's submission URL | 403 Forbidden or empty result |
| Tenant views another tenant's profile | Log in as Grace, navigate to Adebayo's profile URL | 403 Forbidden |
| File duplicate review | Submit review for same submission twice | Error: review already exists |
| Submit review for incomplete submission | Attempt review on pending submission | Error: submission not completed |
| Agent with 0 credits submits | Login as Ibrahim, try new submission | Error: Insufficient credits |
| Field agent mark own assignment as someone else's | Field agent tries to update assignment not assigned to them | 403 Forbidden |
| Unapproved report share | Attempt to generate share link on pending report | Error: report not approved |
| Access shared report with invalid token | Navigate to `/status/invalid-token` | 404 or "Report not found" |

---

## Section 9 — Shared Report (Public Access)

No login required.

1. As an agent, generate a share link from an approved report
2. Copy the share URL (format: `http://localhost:3000/status/[token]`)
3. Open in a private/incognito browser window
4. **Expected**:
   - Report loads without login
   - Shows tenant name, property address, verification outcome
   - Does not show sensitive NIN, income, or internal notes
   - RentCred branding visible

---

## Quick Smoke Test Checklist

Use this for a rapid sanity check after deployment or code changes:

- [ ] Login works for all 5 role types
- [ ] Agent can create a submission (credit deducted)
- [ ] Ops sees all submissions
- [ ] Ops can assign field agent
- [ ] Field agent sees assignment and submits visit
- [ ] Ops can approve report
- [ ] Tenant sees approved report
- [ ] Tenant can leave a review
- [ ] Dispute can be filed and resolved
- [ ] KYB application can be reviewed and approved
- [ ] Share link opens without login
- [ ] Logout clears session and redirects to login

---

## Notes for Testers

- **Database state**: Each test run may leave data behind. Re-seeding (`npm run db:seed` in `apps/api`) resets demo accounts but does not delete created records.
- **Paystack**: Payment flows use Paystack's test mode. No real money is charged. Use test card `4084 0840 8408 4081`, expiry `12/30`, CVV `408`.
- **File uploads**: Property images and documents go to S3. Ensure `AWS_*` env vars are set, or uploads will fail silently.
- **Notifications**: In-app only — no emails are sent in development mode unless `SMTP_*` env vars are configured.
