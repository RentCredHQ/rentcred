# RentCred — Design Opportunities & Audit

> A candid review of the current design, surfacing **inconsistencies, gaps, and improvement
> opportunities** found while studying the codebase. This is the most actionable brief for a design
> pass: it points Claude design at the highest-leverage work rather than redesigning what already
> works. Each item notes the issue, where it shows up, and a suggested direction.

Severity: 🔴 high (trust/usability/consistency risk) · 🟡 medium · 🟢 polish.

---

## 1. Color & token consistency

**🔴 1.1 — Pervasive hard-coded hex instead of tokens.** Raw hex appears constantly in markup
(`#FF8400` ~215×, `#0D0D0D` ~66×, status hexes, `#7A7A7A`, `#161616`, `#2A2A2A`, etc.) rather than
semantic tokens. This makes theming brittle and dark mode partial.
*Direction:* expand the token set to cover the marketing-dark palette and all status pairs, then
migrate hard-coded values to tokens. Designers should specify in tokens, not hex.

**🟡 1.2 — Two competing status palettes.** In-app pills use **muted, desaturated** colors
(`#DFE6E1`/`#004D1A`, etc.) while reports use **vivid** verdict colors (`#22C55E`, `#F59E0B`,
`#EF4444`). The same concept ("verified/warning/failed") reads differently across surfaces.
*Direction:* define one status scale with explicit "muted (in-app)" and "vivid (report)" tiers that
are clearly derived from each other, so they feel like one system at two intensities.

**🟡 1.3 — Dark-mode semantics collapse.** In dark mode `warning` becomes `#FF8400` — the same as
`primary`/`accent`. Warning and brand-accent then look identical.
*Direction:* give dark-mode warning its own distinct value; keep `primary` reserved for brand/CTA.

**🟢 1.4 — Status-pair maps duplicated in components.** The `getStatusStyle()` bg/text map is
re-declared in pages (e.g. dashboard index). Worth centralizing as tokens/a shared map.

---

## 2. Radius & shape language

**🟡 2.1 — Marketing (sharp) vs app (rounded) is intentional but undocumented and occasionally
blurred.** Most marketing is square; most app is `rounded-xl/lg/full`. A few surfaces sit between
moods. *Direction:* codify the rule (done in `DESIGN_SYSTEM.md §5`) and audit any surface that mixes
both — pick the mood per surface and commit.

**🟢 2.2 — Radius scale has minor sprawl** (`rounded`, `-md`, `-lg`, `-xl`, `-2xl`, `-full` all in
use). *Direction:* standardize to **lg (controls) / xl (cards) / 2xl (modals) / full (pills)** and
retire stray `rounded`/`-md` usages in the app.

---

## 3. Buttons & interactive consistency

**🟡 3.1 — Primary button has divergent specs.** Marketing primary is square `px-8 py-3.5` with
`#0D0D0D` text; app primary is `rounded-lg`, sometimes `font-mono`, sometimes `font-sans`,
sometimes `text-foreground` vs `text-white`. On-orange text alternates between near-black and white.
*Direction:* lock a button spec per mood (incl. the on-orange text color — recommend near-black
everywhere for contrast) and a single label font choice.

**🟢 3.2 — `.btn-*` utility classes exist but pages often re-implement buttons inline.** Encourage
reuse so variants don't drift.

**🟢 3.3 — Native `alert(...)` used as a stopgap** (e.g. "Resend Invite" on the dashboard).
*Direction:* design a proper toast/inline-feedback pattern (see §5.1).

---

## 4. Accessibility

**🔴 4.1 — Contrast risk on muted status pills.** Pairs like `#804200` on `#E9E3D8` and
`text-foreground` on `#E7E8E5` are low-contrast at 11px. *Direction:* run a WCAG AA pass on every
status pair; bump text weight/darkness or background as needed (11px text needs AA ≥ 4.5:1).

**🟡 4.2 — Tiny type at 10–11px** for tab labels and badges. Verify legibility and AA; consider 11px
floor for anything load-bearing.

**🟡 4.3 — Focus states.** Inputs have a focus ring; buttons/links/nav items mostly rely on
color/opacity. *Direction:* define a consistent, visible focus style for all interactive elements
(keyboard users).

**🟡 4.4 — Icon-only buttons** (notification bell, modal close) need accessible labels.
*Direction:* specify `aria-label` requirements in the component specs.

**🟢 4.5 — Touch targets.** Confirm mobile tap targets (bottom-tab items, small buttons) meet ≥44px.

---

## 5. Missing / inconsistent patterns

**🟡 5.1 — No defined toast/notification-feedback component.** Success/error after actions is
inconsistent (modals close silently; `alert()` in places). *Direction:* design a toast system
(success/error/info) matching the brand.

**🟡 5.2 — Empty/loading/error states are good but not uniformly applied.** The empty-state and
spinner patterns are strong where present; ensure every list/detail screen uses them (see
`SCREEN_INVENTORY.md §9`). *Direction:* a small "states kit" so coverage is automatic.

**🟢 5.3 — Skeleton loaders absent.** Everything uses a center spinner. *Direction:* consider
skeleton placeholders for tables/cards for perceived performance.

**🟢 5.4 — Form components not centralized.** Inputs use `.input-field`, but selects, textareas,
checkboxes, radios, file-uploaders, and step indicators aren't a documented set. *Direction:* design
a complete form-control kit (esp. the photo uploader and the multi-step indicator used in wizards).

---

## 6. The flagship surfaces (highest leverage)

**🔴 6.1 — Public shared report (`/reports/shared/[token]`)** is the product's conversion moment and
the only landlord touchpoint. *Direction:* invest here most — a definitive, print/PDF-ready,
mobile-perfect report layout with an unmistakable verdict summary and trust framing. Treat it as the
hero deliverable of any design pass.

**🟡 6.2 — Submit wizard** is the agent's core action and the credit-spend moment. *Direction:*
polish the step indicator, validation, photo upload, and the final cost-confirmation.

**🟡 6.3 — Ops case detail** carries a lot of state-dependent actions. *Direction:* design a clear
"current action" model so the right control (assign / checklist / generate / approve) is obvious per
status.

---

## 7. Responsive & theming completeness

**🟡 7.1 — Dark mode is defined but not fully exercised** on marketing-dark and status surfaces (see
§1). *Direction:* decide the dark-mode story per surface and complete the token coverage.

**🟢 7.2 — Tables → cards transform** is well handled on the agent dashboard; verify every data-table
screen (ops queues, payments, audit) has an equally good mobile rendering.

---

## 8. Suggested priority order for a design pass
1. **Public report page** (6.1) — biggest trust/conversion impact.
2. **Color/token + status system** (1.1–1.3, 4.1) — fixes consistency and accessibility at once.
3. **Submit wizard + form-control kit** (6.2, 5.4) — core agent action.
4. **Button + states + toast standardization** (3.1, 5.1–5.2) — app-wide consistency.
5. **Ops case detail action model** (6.3) — operational efficiency.
6. **Accessibility + focus pass** (4.x) — across everything.
7. **Polish:** skeletons, radius cleanup, dark-mode completion (5.3, 2.2, 7.1).

> None of this requires throwing away the current design — it's strong and coherent. These are
> targeted upgrades that make a good system airtight.
