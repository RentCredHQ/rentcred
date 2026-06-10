# RentCred — Brand & Voice Guide

> How the brand should look (logo, naming) and sound (voice, tone, microcopy). Pairs with
> `DESIGN_SYSTEM.md` (the visual tokens). Use this so any new copy or branded surface feels like
> RentCred.

---

## 1. Brand essence

**RentCred = "rental credibility."** The product turns trust from a verbal claim into verifiable
evidence. The brand should feel:

- **Trustworthy** — like an official document or a fintech, not a startup toy.
- **Precise** — exact, factual, no fluff (the monospace typography embodies this).
- **Confident, not loud** — one bold orange, lots of restraint.
- **Local & credible** — built for Nigeria, by people who know the market.

**Brand adjectives:** credible · precise · professional · direct · warm-but-serious.
**Not:** playful, cute, hype-y, jargon-heavy, corporate-stiff.

---

## 2. Logo

The `UiRentCredLogo` component: a **shield** (security/trust) containing a **house roof line**
(real estate) and a **checkmark** (verified), plus the **RentCred** wordmark in JetBrains Mono bold.

**Construction**
- Shield outer = brand orange `#FF8400`; inner fill flips by variant (near-black `#0A0A0A` on dark,
  off-white `#F8F8F8` on light); roof line orange; checkmark contrasts the inner fill.
- Wordmark: `font-mono`, bold, size = `0.55 × icon size`, color flips with variant.
- Shield aspect ratio ≈ **80 : 94**.

**Variants & usage**
| Variant | Use on | Example |
|---------|--------|---------|
| `dark` | dark backgrounds (marketing nav/footer, auth panel) | white wordmark, near-black shield interior |
| `light` | light backgrounds (app sidebar, mobile light header) | dark wordmark, off-white shield interior |

**Props:** `size` (px), `variant` (`dark`/`light` — name = the *background* it sits on),
`showText`, `horizontal`.

**Do**
- Keep the shield's orange constant across variants.
- Use `horizontal` lockup in nav/sidebars; the stacked form for splash/centered moments.
- Give it clear space; pair with the right variant for the background.

**Don't**
- Recolor the shield away from `#FF8400`.
- Put the `dark` variant on a light background (or vice-versa).
- Set the wordmark in any font but JetBrains Mono bold.
- Add effects (gradients, shadows, outlines) to the mark.

---

## 3. Naming & terminology

Use these exact terms in UI and copy (consistency = credibility):

| Term | Meaning | Avoid |
|------|---------|-------|
| **RentCred** | Product name (one word, camel-cap C) | "Rent Cred", "Rentcred" |
| **Verification report** / **report** | The output artifact | "background check doc", "file" |
| **Case** / **submission** | One tenant verification request | "order", "ticket" |
| **Credit** | Prepaid verification unit | "token", "point" |
| **Bundle** | A pack of credits | "plan", "subscription" (there are no subscriptions) |
| **KYB** | Know Your Business (agent verification) | "KYC" (that's for individuals) |
| **Field agent** | Person doing the site visit | "inspector", "surveyor" |
| **Ops** | RentCred operations team | "admin" (admin is a separate role), "support" |
| **Field visit** | Physical property inspection | "inspection appointment" |
| **Agent** | Real estate agent (the customer) | "user", "client" |

**Currency:** always **₦ / NGN** with thousands separators (e.g. `₦12,000`, `NGN 100,000`).
**Geography:** Nigerian states & LGAs; use real Nigerian names in samples (e.g. "Adebayo Ogundimu",
"Premier Realty Lagos", "Lekki", "Port Harcourt").

---

## 4. Voice

**Voice (constant):** a knowledgeable, plain-spoken professional who respects your time. Speaks in
clear, short sentences. States facts and outcomes. Avoids hype and hedging.

**Principles**
1. **Plain over clever.** "Get verified tenant reports in 48 hours" — not "Supercharge your rental
   journey."
2. **Concrete over vague.** Name the checks (identity, employment, references, address), the SLA,
   the price. Specifics build trust.
3. **Active & direct.** "Submit your tenant," "Share the report," "Buy credits."
4. **Honest about effort & cost.** "Pay only when you screen." "No contracts. No monthly fees."
5. **Respect privacy.** When handling tenant data, acknowledge it (NDPR). Don't be cavalier.

---

## 5. Tone by surface

Voice stays constant; **tone flexes by context:**

| Surface | Tone | Example |
|---------|------|---------|
| Marketing | Confident, benefit-led, a little bold | "Screen tenants faster. Close deals with confidence." |
| In-app (working) | Calm, efficient, instructional | "Complete your KYB verification to start submitting tenants." |
| Reports | Neutral, factual, authoritative | "Identity — Verified." "Recommendation: Proceed — verify references independently." |
| Errors | Plain, reassuring, actionable | "This report is not available or the link has expired." |
| Empty states | Encouraging, directive | "No submissions yet. Submit your first tenant to get started." |
| Success | Brief, confirming | "Report ready to share." |

---

## 6. Microcopy patterns (reuse these)

**Eyebrow labels (marketing):** short, uppercase, mono — `THE PROBLEM`, `HOW IT WORKS`, `WHAT YOU
DELIVER`, `PRICING`, `VERIFICATION REPORT`.

**Section headlines:** declarative, often two beats —
- "Nigerian rentals run on trust. But trust doesn't scale."
- "A report your landlord actually trusts."
- "Pay per check. Save with bundles."

**CTAs:** verb-first, specific —
- Primary: "Start Screening Tenants", "Create Your Free Account", "Submit Tenant", "Proceed to
  Payment", "Start KYB".
- Secondary: "See Pricing", "Get Started", "View", "Share".

**Status text (mono, in pills):** "Completed", "In Progress", "Pending", "Field Visit", "Report
Building", "Rejected", "Under Review".

**Verdicts (reports):** "Verified", "Confirmed", "Partially Verified", "Validated", paired with a
recommendation line beginning "Recommendation: …".

**Empty state copy:** `[heading: nothing here yet]` + `[helper: the one action to take]`.
e.g. "No submissions yet" / "Submit your first tenant to get started."

**Error copy:** state what happened + the way out, no blame, no jargon.
e.g. "Report Not Found" / "This report is not available or the link has expired." / "Go to RentCred."

**Trust marks (footer/legal):** "NDPR Registered • Lagos, Nigeria", "© RentCred Technologies Ltd."

---

## 7. Writing rules
- **Numbers, money, dates, IDs, statuses → monospace.** (Visual contract with the type system.)
- Sentence case for UI labels and buttons; UPPERCASE only for eyebrow labels and small tab labels.
- Oxford-clear, short sentences. One idea per line in helper text.
- Never invent metrics in product copy; sample/marketing numbers are illustrative (e.g. "200+
  agents", "48hr turnaround") — keep them plausible and consistent.
- Address the reader as "you"; refer to the company as "we" sparingly, "RentCred" by name when it
  builds trust.
- Localize: ₦ not $, Nigerian places and names, NDPR not GDPR.
