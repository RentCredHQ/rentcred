# RentCred — User Flows & Journeys

> The key end-to-end journeys, as flow diagrams + narration. Use these to design connected
> experiences (not isolated screens), to place CTAs, and to design the transition/handoff moments
> between roles. Diagrams are Mermaid (render in any Mermaid-aware viewer).

---

## 1. The master lifecycle (all roles)

```mermaid
flowchart TD
    A[Agent submits tenant<br/>1 credit deducted] --> B[Ops reviews submission]
    B --> C{Needs field visit?}
    C -->|Yes| D[Ops assigns Field Agent]
    D --> E[Field Agent conducts site visit]
    E --> F[Field Agent submits visit report]
    C -->|No| G[Ops runs checklist]
    F --> G[Ops completes verification checklist]
    G --> H[Ops generates report]
    H --> I[Ops approves report]
    I --> J[Agent notified: report ready]
    J --> K[Agent shares report link with Landlord]
    I --> L[Tenant can view own report]
    K --> M[Landlord reads public report, decides]
    L --> N[Tenant leaves reviews:<br/>agent / landlord / property]
    J --> O{Issue?}
    O -->|Yes| P[Agent/Tenant files dispute]
    P --> Q[Ops resolves dispute]
```

---

## 2. Agent onboarding → first report (primary activation journey)

```mermaid
flowchart LR
    R[Register] --> V[Verify email]
    V --> KYB[Submit KYB docs]
    KYB --> KW{KYB approved?}
    KW -->|Under review| WAIT[Dashboard shows<br/>'Under Review' banner]
    KW -->|Approved| BUY[Buy credit bundle<br/>Paystack]
    BUY --> SUB[Submit tenant<br/>4-step wizard]
    SUB --> TRACK[Track case status]
    TRACK --> RDY[Report ready]
    RDY --> SHARE[Share link with landlord]
```

**Design notes**
- The **KYB → credits → submit** chain is the activation funnel. Every gate must show the *next*
  action, not just a block. The dark KYB banner is the recurring nudge.
- The submit wizard's final **review step** is the last moment before a credit is spent — make the
  cost and what's being purchased unmistakable.
- "Report ready" → "Share" should be one tap; sharing is the agent's payoff moment.

---

## 3. Submit-tenant wizard (4 steps)

```mermaid
flowchart LR
    G{KYB approved<br/>& credits > 0?} -->|No| BLOCK[Gate: prompt KYB / buy credits]
    G -->|Yes| S1[Step 1: Tenant info]
    S1 --> S2[Step 2: Property<br/>type, state/LGA, rent, up to 5 photos]
    S2 --> S3[Step 3: Select package]
    S3 --> S4[Step 4: Review & confirm]
    S4 --> DONE[Submit → 1 credit deducted<br/>→ tenant invite email sent]
```

**Design notes:** persistent step progress; per-step validation with forgiving inline errors; photo
uploader with thumbnails + remove; a clear cost summary on the review step; mobile-first (most agents
submit on a phone).

---

## 4. Ops case processing (throughput journey)

```mermaid
flowchart TD
    Q[Cases queue / Kanban] --> OPEN[Open case detail]
    OPEN --> REV[Review submission + docs]
    REV --> ASSIGN[Assign / reassign Field Agent]
    ASSIGN --> WAITV[Await field visit report]
    WAITV --> CHK[Complete verification checklist]
    CHK --> GEN[Generate report]
    GEN --> APP{Approve?}
    APP -->|Approve| PUB[Report published<br/>→ agent & tenant notified]
    APP -->|Send back| REV
```

**Design notes:** Ops is desktop, queue-driven. Optimize for **triage speed** — scannable statuses,
filters/tabs, bulk awareness of SLA, and a case-detail page that exposes the right action for the
current status (assign vs checklist vs generate vs approve). The Kanban view is the spatial
alternative to the table.

---

## 5. Field agent visit journey (mobile-first)

```mermaid
flowchart LR
    N[Assignment notification] --> SCH[Schedule / agenda]
    SCH --> VD[Visit detail:<br/>address, tenant, checklist]
    VD --> GO[Travel to property]
    GO --> ONSITE[On-site verification]
    ONSITE --> FORM[Submit visit report<br/>findings + photos]
    FORM --> SENT[Report sent to Ops]
```

**Design notes:** everything reachable with one thumb; address prominent (consider map/Maps link);
the submit form should be checklist-shaped with photo capture; tolerant of poor connectivity
(autosave/draft if possible).

---

## 6. Tenant journey (low-frequency, trust-sensitive)

```mermaid
flowchart LR
    INV[Invite email from submission] --> PROF[Complete profile wizard]
    PROF --> WAITR[Verification in progress]
    WAITR --> VIEW[View own approved report]
    VIEW --> REVIEW[Leave reviews:<br/>agent / landlord / property]
    VIEW --> DISP{Disagree with report?}
    DISP -->|Yes| FILE[File dispute → Ops]
```

**Design notes:** the tenant arrives cold from an email — orient them quickly and reassure on
privacy (NDPR). The report view should help them *understand* their result. Reviews and disputes are
optional, low-pressure.

---

## 7. Landlord journey (non-user — public report)

```mermaid
flowchart LR
    LINK[Receives shared link] --> OPEN[Opens /reports/shared/token]
    OPEN --> S{Link valid?}
    S -->|Expired/invalid| ERR[Report Not Found state]
    S -->|Valid| READ[Reads report:<br/>verified badge, property, tenant,<br/>per-check verdicts, recommendation]
    READ --> DECIDE[Decides: proceed / decline]
```

**Design notes:** this is the **conversion moment of the whole product** and the only touchpoint for
a landlord. ~30 seconds to establish trust: RentCred attribution, "Verification Complete" badge,
scannable verdicts, an unambiguous recommendation. Must look credible with zero prior context, work
on mobile, and be print/PDF-friendly. Design the expired-link state with equal care.

---

## 8. Cross-role handoff moments (design these seams carefully)
| Handoff | From → To | What must be clear |
|---------|-----------|--------------------|
| Submission | Agent → Ops | New case appears in queue with all context |
| Assignment | Ops → Field Agent | Notification + everything needed to do the visit |
| Visit report | Field Agent → Ops | Findings feed the checklist/report |
| Approval | Ops → Agent & Tenant | "Report ready" notification + access |
| Share | Agent → Landlord | Public link that stands alone |
| Invite | Submission → Tenant | Email that explains why and what to do |
| Dispute | Agent/Tenant → Ops | Context + status updates to all parties |
