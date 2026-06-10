# RentCred — Design Hand-off Bundle

A self-contained brief for **Claude design** (or any designer) to design, redesign, or extend the
RentCred product. Everything here was reverse-engineered from the live codebase
(`apps/web/` — Nuxt 3 + Tailwind), so it matches what's actually shipped, not an aspirational spec.

---

## What's in this folder

| File | What it is | Use it to… |
|------|------------|------------|
| **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** | The visual system — color tokens, typography, spacing, radius, elevation, motion, icons, and a full component catalog (all token-exact) | Produce on-brand pixels that drop straight into the app |
| **[PRD.md](./PRD.md)** | Product requirements for design — overview, goals, roles, personas, per-feature requirements, constraints | Understand *what* you're designing and *for whom* |
| **[SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md)** | Every screen, route, layout, and the **states each must cover** | Scope work and never ship a screen missing its empty/loading/error states |
| **[USER_FLOWS.md](./USER_FLOWS.md)** | End-to-end journeys (Mermaid + narration) for each role + the landlord | Design connected flows and the handoffs between roles |
| **[BRAND_AND_VOICE.md](./BRAND_AND_VOICE.md)** | Logo rules, naming/terminology, voice & tone, microcopy patterns | Keep look *and* language consistent |
| **[DESIGN_OPPORTUNITIES.md](./DESIGN_OPPORTUNITIES.md)** | Candid audit of inconsistencies, gaps, and a prioritized improvement backlog | Aim a design pass at the highest-leverage work |
| **[assets/](./assets/)** | Editable logo `.svg` source (icon + lockup, on-dark + on-light) extracted from the app | Drop the real mark into Figma/Pencil |

**Suggested reading order:** PRD → DESIGN_SYSTEM → SCREEN_INVENTORY → USER_FLOWS →
BRAND_AND_VOICE → DESIGN_OPPORTUNITIES.

---

## The product in one paragraph

RentCred is a **B2B tenant-verification platform for Nigerian real estate agents**. Agents pay
(prepaid credits) to submit a prospective tenant; RentCred's ops team and field agents verify
identity, employment, references, and the physical address; the result is a **shareable,
professional verification report** the agent sends to a landlord. Five roles (agent, ops, field
agent, tenant, admin) each have a dedicated workspace, plus public marketing pages and a no-login
shared-report page.

## The design in one paragraph

**Editorial, fintech-grade, trust-first.** A dual-typeface system — **JetBrains Mono** for identity
(logo, headings, numbers, statuses) and **Geist** for prose — over a single confident **orange
(`#FF8400`)** accent. **Two moods, one brand:** marketing/public surfaces are *dark, sharp-cornered,
high-contrast*; in-app surfaces are *light (`#F2F3F0`), soft-rounded, calm*. Material Symbols Rounded
icons, restrained shadows, 1px hairline borders, and subtle fast motion throughout.

---

## Tech context (so designs are buildable)

- **Stack:** Nuxt 3 (Vue 3), Tailwind CSS, `@nuxtjs/color-mode` (class-based light/dark), Pinia.
- **Tokens:** CSS custom properties in `apps/web/assets/css/main.css`, surfaced to Tailwind via
  `apps/web/tailwind.config.ts` as semantic class names (`bg-background`, `text-foreground`,
  `bg-primary`, etc.). **Design in these names**, not raw hex, for in-app surfaces.
- **Fonts:** loaded from Google Fonts (Geist, JetBrains Mono, Material Symbols Rounded).
- **Breakpoint that matters:** `lg` (1024px) — the desktop↔mobile shell switch.
- **Currency/locale:** NGN (₦), Nigerian states/LGAs, NDPR compliance.

---

## How to brief Claude design with this bundle

- **Designing a brand-new screen?** Start from PRD (context) + SCREEN_INVENTORY (which states) +
  DESIGN_SYSTEM (how it should look). State which **role** and **surface mood** (marketing-dark vs
  app-light) up front.
- **Redesigning an existing screen?** Read its row in SCREEN_INVENTORY and the relevant
  DESIGN_OPPORTUNITIES items first.
- **Writing any copy/labels?** Run them through BRAND_AND_VOICE.
- **Doing a quality/consistency pass?** Work the priority list in DESIGN_OPPORTUNITIES §8.
- **Always:** design light *and* dark for in-app surfaces; design the mobile rendering of any
  table/sidebar; cover empty/loading/error, not just the happy path.

---

## Optional next artifacts (not yet produced — ask if you want them)

These would extend the bundle further; flagged here so the scope is explicit:
- **Tokens export** — `design-tokens.json` (W3C format) or a Figma/Pencil variables file generated
  from `main.css`, so the system imports directly into a design tool.
- **Component spec sheets** — one page per component with redlines (padding, sizes, states).
- **Accessibility report** — full WCAG AA contrast audit of every color pair (DESIGN_OPPORTUNITIES
  §1–4 is the starting point).
- **Annotated screenshots** — visual reference captured from the running app (requires running
  `npm run dev` and capturing each screen).
- **Print/PDF spec for the shared report** — the flagship deliverable, specified for export.

> Generated as a design hand-off for RentCred. Reflects the codebase as of this writing; if the app
> evolves, re-derive tokens from `apps/web/assets/css/main.css` and `tailwind.config.ts`.
