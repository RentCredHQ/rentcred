# RentCred — Product Requirements Document (Design Hand-off Edition)

> This PRD is written for design work, not engineering. It gives Claude design (or any designer) the
> product context, users, jobs-to-be-done, and per-feature requirements needed to design or redesign
> any screen. It reflects the product **as built today**; "Opportunities" call out where design
> attention is most valuable.

---

## 1. Product overview

**RentCred** is a B2B SaaS platform that lets **Nigerian real estate agents submit prospective
tenants for professional background verification**. It manages the full lifecycle: submission →
operations review → field inspection → report generation → approval → sharing → post-verification
reviews and disputes.

**The core value exchange:** an agent pays (via credits) to turn a "trust me, this tenant is fine"
conversation into a **shareable, professional verification report** a landlord actually believes —
covering identity, employment, references, and a physically-verified address.

**Tagline in product:** *"Tenant Verification Made Simple."*
**Positioning:** *"Screen tenants faster. Close deals with confidence."*

### 1.1 The workflow (end to end)
```
Agent submits tenant   →  Ops reviews & assigns field agent
       ↓                              ↓
Credit deducted           Field agent conducts site visit
                                      ↓
                          Ops compiles & approves report
                                      ↓
        Agent receives report  →  Tenant views report
                                      ↓
                          Tenant reviews agent / landlord / property
```

---

## 2. Goals & success signals

| Goal | Why it matters | Design implication |
|------|----------------|--------------------|
| Make submission effortless | Agents are mobile, busy, often non-technical | 4-step wizard must be fast, forgiving, mobile-first |
| Make the report trustworthy | The report *is* the product | Document-grade clarity; unambiguous verdicts |
| Make sharing frictionless | Landlords won't create accounts | Public, no-login report link that looks credible |
| Keep ops efficient | Ops throughput = business throughput | Dense but scannable queues, fast triage, clear assignment |
| Gate quality (KYB) | Only verified businesses should screen | KYB must feel like a quick unlock, not a wall |

---

## 3. Users, roles & permissions

Five roles, each with a dedicated dashboard and layout. **Design each role's home as a purpose-built
workspace, not a generic dashboard.**

| Role | Lands on | Primary job | Mindset |
|------|----------|-------------|---------|
| **Agent** | `/dashboard` | Submit tenants, buy credits, view & share reports, raise disputes | "I need a report I can send my landlord, fast." Mobile, deal-driven. |
| **Ops** | `/ops` | Review submissions, assign field agents, approve reports, review KYB, resolve disputes | "I'm processing a queue." Desktop, throughput-driven. |
| **Field Agent** | `/field-agent` | Receive visit assignments, conduct site visits, submit field reports | "Where am I going, and what do I record?" Mobile-first, in-the-field. |
| **Tenant** | `/tenant` | Complete profile, view own report, leave reviews | "What does my report say, and who's asking?" Occasional, trust-sensitive. |
| **Admin** | `/ops` | Everything ops can do + user management + full audit log | "I oversee the system." Desktop. |

Full matrix: `docs/ROLES_AND_PERMISSIONS.md`. **Designers should treat Agent and Field Agent as
mobile-first; Ops/Admin as desktop-first; Tenant as mobile-first and low-frequency.**

---

## 4. Personas (lightweight)

- **Tobi — the Agent.** Lagos real-estate agent, 32, runs his business from WhatsApp and his phone.
  Wants to look professional to landlords and close faster. Low patience for forms; high motivation
  to share a polished report.
- **Amara — the Ops reviewer.** Works at RentCred HQ on a laptop all day, moving cases through a
  pipeline. Values density, keyboard speed, clear status, and not missing SLA.
- **Emeka — the Field Agent.** On a bike/bus across the city. Needs his schedule, the address, what
  to photograph, and a simple submit form that works on a small screen with spotty data.
- **Ngozi — the Tenant.** Invited to complete her profile. Cares about privacy (NDPR), wants to
  understand her report, and may review the agent afterward.
- **The Landlord (non-user).** Never logs in. Receives a shared report link. Must trust what they
  see in ~30 seconds. **Designs for the public report page are designing for this person.**

---

## 5. Feature requirements

### 5.1 Tenant Verification Submission (Agent)
- **4-step wizard:** Tenant info → Property description → Package selection → Review & submit.
- Inputs: tenant identity & contact, Nigerian **state/LGA** dropdowns, property type (Self-Contained,
  Mini Flat, 2/3-Bedroom, Duplex, Detached House, Penthouse, Shop/Office), rent, **up to 5 property
  photos** (S3 upload).
- **1 credit deducted per submission.** Submission is blocked until **KYB is approved** and credits
  are available.
- On submit, the tenant is emailed an invite to complete their profile.
- *Requirements:* progress indication across steps, save/validation per step, mobile-first,
  forgiving error handling, a clear review summary before the credit is spent.

### 5.2 KYB — Know Your Business (Agent → Ops)
- Agent uploads business docs (CAC certificate, director ID, utility bill).
- States: not started → submitted → under review → approved / rejected.
- **KYB gates submissions and credit purchases.** A dark banner persists on the dashboard until
  approved (states: "Start KYB" CTA / "Under Review" chip).
- Ops reviews in a **KYB queue** and approves/rejects with reason.
- *Requirements:* the gate should feel like progress (clear next step, status visibility), not a
  dead end. Ops side needs fast doc review + decision.

### 5.3 Credits & Payments (Agent)
- Credits bought in **bundles** (e.g. Single, 5/10/25-check; or Basic/Standard/Premium). Volume
  discounts; per-credit price shown; "Most Popular" highlighted.
- **Paystack** integration (bank transfer / card), webhook-verified.
- Purchase modal: select bundle → choose method → see total → pay.
- Payments/invoices history with detail view.
- *Requirements:* pricing legibility (mono numbers), clear savings framing, trustworthy payment
  step, receipt/invoice surfaces.

### 5.4 Reports (Ops generate/approve → Agent/Tenant view → public share)
- Generated after **field visit + verification checklist** complete.
- **Ops must approve** before anyone sees the final report.
- Contains: tenant + property details, color-coded check results (identity, employment, references,
  address), risk assessment, and a clear **recommendation**.
- **Shareable via unique token** at `/reports/shared/[token]` — **public, no login.**
- Tenant can view their own approved report.
- *Requirements:* this is the flagship artifact. Document-grade layout, instant-read verdicts
  (verdict band + per-check rows), credible public page (verified badge, RentCred attribution),
  printable/PDF-friendly, expired/invalid-link state.

### 5.5 Field Visits (Field Agent)
- Receives assignments; views **schedule**, visit detail (address, tenant, what to check), and a
  **submit-visit form** (findings + photos).
- Has its own profile, notifications, and report history.
- *Requirements:* mobile-first, map/address clarity, a checklist-style submit flow, works on small
  screens; minimize typing.

### 5.6 Disputes (Agent & Tenant → Ops)
- Agents and tenants can file disputes against a submission/report.
- Ops reviews and resolves; all parties notified on status change.
- *Requirements:* clear dispute states, threaded context, who-said-what, resolution outcome.

### 5.7 Reviews (Tenant)
- After a completed verification, tenant reviews **agent, landlord, and property** — 1–5 stars per
  category, optional comment, anonymous toggle. One review per completed submission.
- *Requirements:* friendly, low-pressure form; clear that it's optional and (optionally) anonymous.

### 5.8 Notifications (all roles)
- In-app notifications for key events; unread badge in the top bar; dropdown panel.
- *Requirements:* scannable list, clear unread state, empty state.

### 5.9 Audit Log (Ops/Admin)
- All significant actions logged (submissions, approvals, disputes, KYB decisions).
- *Requirements:* filterable, dense, timestamped, read-only.

### 5.10 Settings (shared)
- Profile, billing, KYB, notifications, disputes, audit — shared settings area across roles.

### 5.11 Marketing & public
- Landing page (hero, problem, how-it-works, sample report, testimonials, pricing, CTA),
  For-Landlords, About, Contact, Careers, Status tracker, Privacy/Terms/**NDPR** legal pages.
- *Requirements:* dark editorial aesthetic, conversion-focused, SEO-prerendered.

---

## 6. Key user journeys (summary — full detail in `USER_FLOWS.md`)
1. **Agent first run:** register → KYB → buy credits → submit tenant → track → receive report →
   share link with landlord.
2. **Ops case processing:** new submission → review → assign field agent → checklist → generate
   report → approve → notify agent.
3. **Field agent visit:** assignment → schedule → travel → on-site checks → submit visit report.
4. **Tenant:** invite email → complete profile → (later) view report → leave reviews.
5. **Landlord (non-user):** open shared link → read report → decide. No account.

---

## 7. Non-functional & contextual requirements

- **Market:** Nigeria. Currency **NGN (₦)**, Nigerian states/LGAs, local property types, names, and
  examples. Use real Nigerian context in any sample content.
- **Mobile reality:** agents and field agents work on phones, sometimes on poor connections. Design
  mobile-first for those roles; assume touch; keep payloads/images sensible.
- **Compliance:** **NDPR** (Nigeria Data Protection Regulation). Privacy is a trust feature —
  tenants must feel their data is handled lawfully. Reflect "NDPR Registered" trust marks where
  appropriate.
- **Trust > flash:** the brand sells credibility. Favor clarity, evidence, and restraint over
  decoration.
- **Accessibility:** maintain legible contrast (note: some muted status pairs and dark-mode tokens
  need a contrast audit — see `DESIGN_OPPORTUNITIES.md`). Touch targets ≥ 44px on mobile.
- **Theming:** light and dark themes exist (`darkMode: 'class'`); design both for in-app surfaces.

---

## 8. Out of scope / non-goals (for current design work unless stated)
- Native mobile apps (web is responsive; PWA manifest exists).
- Tenant-initiated verification (agents drive submissions).
- Landlord accounts (landlords only consume shared links).
- Multi-currency / multi-country (Nigeria only today).

---

## 9. Glossary
- **KYB** — Know Your Business; agent business verification gating platform access.
- **Case / Submission** — one tenant verification request (costs 1 credit).
- **Credit** — prepaid unit; 1 = one verification.
- **Field visit** — physical inspection of the property/address by a field agent.
- **Report** — the approved verification output; shareable via token.
- **Verdict** — per-check outcome (verified / partial / failed) and overall recommendation.
- **Ops** — RentCred internal operations team processing cases.
