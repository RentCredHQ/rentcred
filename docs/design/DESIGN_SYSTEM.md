# RentCred — Design System Guide

> Source of truth for visual design. Every token below is extracted from the live codebase
> (`apps/web/assets/css/main.css`, `apps/web/tailwind.config.ts`, and component usage).
> When designing new screens, match these exactly so the output drops into the existing app.

---

## 1. Design DNA — read this first

RentCred is a **B2B tenant-verification platform for the Nigerian real estate market**. The
visual language is built to feel **trustworthy, precise, and editorial** — closer to a fintech /
infrastructure product than a consumer app.

Three ideas drive every decision:

1. **Document-grade credibility.** The product's output is a *verification report* a landlord must
   trust. The UI borrows from official documents: monospace for anything factual (IDs, amounts,
   statuses, headings), clear color-coded verdicts, generous whitespace, no decorative noise.
2. **Two distinct moods, one brand.**
   - **Marketing / public surfaces** (landing, auth branding, shared report hero) are **dark,
     sharp-cornered, high-contrast, confident** — black canvas (`#0D0D0D`), orange accent, square
     buttons and cards.
   - **In-app / dashboard surfaces** are **light, soft, calm, operational** — warm-grey canvas
     (`#F2F3F0`), white rounded cards, muted status pills. Designed for long working sessions.
   These are intentional, not a drift. Keep them distinct but unmistakably the same brand (same
   orange, same logo, same monospace headings).
3. **Mono for facts, sans for prose.** A dual-typeface system is the single most recognizable
   trait. **JetBrains Mono** carries identity (logo wordmark, headings, numbers, labels, statuses);
   **Geist** carries readability (body copy, descriptions, form text).

**One-line summary for a design brief:** *"Editorial fintech-grade trust tool — monospaced and
precise where it matters, warm and quiet where you work, with a single confident orange."*

---

## 2. Color

Colors are defined as CSS custom properties with **light (default) and dark** themes, exposed to
Tailwind as semantic names. `darkMode: 'class'` — the `.dark` class on a parent flips the theme.
**Always design against semantic tokens, not raw hex, for in-app surfaces.**

### 2.1 Semantic tokens (in-app — use these)

| Token (Tailwind class)      | Light       | Dark        | Use |
|-----------------------------|-------------|-------------|-----|
| `background`                | `#F2F3F0`   | `#111111`   | Page canvas |
| `surface`                   | `#E7E8E5`   | `#2E2E2E`   | Subtle raised fill, hovers, input bg |
| `card`                      | `#FFFFFF`   | `#1A1A1A`   | Card / panel / modal surface |
| `sidebar`                   | `#E7E8E5`   | `#18181b`   | App sidebar fill |
| `border`                    | `#CBCCC9`   | `#2E2E2E`   | All hairlines, dividers, card borders |
| `foreground`                | `#111111`   | `#FFFFFF`   | Primary text |
| `font-primary`              | `#111111`   | `#FFFFFF`   | Primary text (alias) |
| `font-secondary`            | `#666666`   | `#B8B9B6`   | Secondary text |
| `muted-foreground`          | `#666666`   | `#B8B9B6`   | Muted/label text, inactive nav |
| `primary` / `accent`        | `#FF8400`   | `#FF8400`   | **The brand orange** — CTAs, active states, highlights |
| `primary-foreground`        | `#111111`   | `#111111`   | Text/icon on orange (always near-black) |
| `success`                   | `#004D1A`   | `#B6FFCE`   | Positive text/icon |
| `warning`                   | `#804200`   | `#FF8400`   | Caution text/icon |
| `error`                     | `#8C1C00`   | `#FF5C33`   | Negative text/icon |

### 2.2 Brand orange

`#FF8400` is the **only** accent. It never shifts hue between modes. Supporting tints (used as raw
hex throughout):

- `#FF840012` / `#FF84000A` / `#FF840008` — near-transparent orange wash (badge & card backgrounds)
- `#FF840018` / `#FF840020` — soft orange fill (save-badges, avatar chips)
- `#FF840033` — orange border at low alpha (badges)
- `#E67700` — hover/darken on orange marketing buttons
- On-orange text is **always `#0D0D0D`/`#111111`** (near-black), never white.

### 2.3 Marketing dark palette (raw hex — public surfaces only)

These are deliberately hard-coded on marketing/auth/report-hero sections and are **not** theme tokens:

| Hex        | Role |
|------------|------|
| `#0D0D0D`  | Marketing canvas (near-black, warmer than pure black) |
| `#161616`  | Raised card on dark |
| `#2A2A2A`  | Border on dark |
| `#3A3A3A` / `#555`  | Secondary border / hover border on dark |
| `#7A7A7A`  | Muted body text on dark |
| `#B0B0B0`  | Slightly brighter body text on dark |
| `white` / `white/90` / `white/80` | Primary / softened text on dark |

### 2.4 Status / verdict color system

Two distinct status palettes exist — **know which surface you're on.**

**A. In-app status pills** (muted, desaturated — light mode). Each is a `bg`/`text` pair on a
`rounded-full` pill:

| Status            | Background  | Text        |
|-------------------|-------------|-------------|
| Completed / success | `#DFE6E1` | `#004D1A`   |
| In progress / report building / warning | `#E9E3D8` | `#804200` |
| Pending / neutral | `#E7E8E5`   | `foreground`|
| Field visit       | `#DFDFE6`   | `#000066`   |
| Rejected / error  | `#E5DCDA`   | `#8C1C00`   |

**B. Report verdict colors** (vivid, saturated — used in the report itself & sample previews, on
dark): `#22C55E` (verified/pass), `#F59E0B` (partial/caution), `#EF4444` (failed/risk). These are
intentionally brighter than the in-app pills because a verification verdict must read instantly.

> **Note for design pass:** the two palettes (muted A vs vivid B) and the dark-mode `warning` token
> collapsing to orange are known inconsistencies — see `DESIGN_OPPORTUNITIES.md`.

---

## 3. Typography

Two families, loaded from Google Fonts:

- **Geist** — `font-sans`. Weights 300/400/500/600/700. Body, UI, form text, descriptions.
- **JetBrains Mono** — `font-mono`. Weights 400/500/600/700. **Identity layer**: logo, all headings,
  numbers, eyebrow labels, statuses, case IDs, prices.

Stacks:
```
sans: 'Geist', system-ui, -apple-system, sans-serif
mono: 'JetBrains Mono', 'Fira Code', monospace
```

### 3.1 Type scale (as actually used)

| Role | Font | Size (mobile → desktop) | Weight | Tracking / leading |
|------|------|--------------------------|--------|--------------------|
| Marketing H1 (hero) | mono | 32 → 44 → 56px | 600 | `tracking-tight`, `leading-[1.1]` |
| Marketing H2 (section) | mono | 24 → 28 → 32px | 500 | `tracking-tight` |
| Report hero title | mono | 30 → 36 → 48px | 600 | center |
| **Eyebrow label** | mono | 11px | 600 | `tracking-[2px]`, **UPPERCASE**, orange |
| App page title | sans | 20px (`text-xl`) | 600 | — |
| Card / modal title | mono | 16px (`text-base`) | 700 | — |
| Section heading (app) | mono/sans | 15–16px | 600 | — |
| KPI / stat number | mono | 28px | 700 | `leading-none` |
| Hero stat number | mono | 28px | 700 | — |
| Price | mono | 22–24px | 700 | — |
| Body (marketing) | sans | 15 → 16 → 18px | 400 | `leading-relaxed` |
| Body / description (app) | sans | 13–15px | 400 | `leading-relaxed` |
| Table cell / label | sans/mono | 12–13px | 400–500 | — |
| Badge / pill | sans/mono | 11px | 500–600 | — |
| Sidebar section header | mono | 11px | 600 | `uppercase tracking-wider`, muted |
| Caption / meta | sans | 11–12px | 400 | muted |

**Rules of thumb**
- Headings, the eyebrow label, any **number** (counts, prices, credits, stats, dates in reports),
  **status text**, and **case IDs** → `font-mono`.
- Everything a human reads as a sentence → `font-sans`.
- Eyebrow labels (`font-mono` 11px, uppercase, `tracking-[2px]`, orange) precede most marketing
  section headings — a signature pattern. Reuse it.

---

## 4. Spacing, layout & grid

- **Base unit:** 4px (Tailwind default scale). Common gaps: `gap-2` (8), `gap-3` (12), `gap-4` (16),
  `gap-5` (20), `gap-6` (24).
- **Max content width:** `max-w-[1440px]` centered, for both marketing and full-width app content.
- **Horizontal page padding:** `px-5 sm:px-8 lg:px-20` (20 → 32 → 80px).
- **Marketing section rhythm:** `py-16 lg:py-28` (64 → 112px) vertical per section.
- **App content padding:** `p-5 lg:p-8`, with `pt-20`/`pb-28` on mobile to clear the fixed top bar
  and bottom tab bar.
- **Card padding:** `p-5` (compact app cards), `p-6` (modals, pricing), `p-7` (marketing feature
  cards).

### 4.1 Breakpoints (Tailwind defaults)
`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280. The app's primary mobile↔desktop switch is **`lg`
(1024px)** — sidebars, tables, and top bars appear at `lg`; mobile gets a slide-out menu + bottom
tab bar below `lg`.

### 4.2 App shell layouts
- **Sidebar (dashboard/ops/field-agent/tenant):** fixed `w-[260px]`, `bg-[#E7E8E5]`, right border,
  sticky full-height. Logo block → grouped nav (`Screening`/`Account`, etc.) → profile footer.
- **Top bar:** `px-8 py-4`, bottom border, greeting on left + actions (primary CTA, notification
  bell, avatar) on right.
- **Mobile:** fixed top bar (`h-14`) + dark slide-out drawer (`w-[280px]`) + fixed bottom tab bar
  (pill-shaped, 5 items, `rounded-full` white container).
- **Auth:** split screen — left `w-[720px]` dark branding panel, right form area on `card` bg,
  `max-w-[420px]` form column.

---

## 5. Border radius

Radius is **mood-dependent** — this is intentional and important:

- **Marketing surfaces → sharp (no radius).** Hero buttons, feature cards, pricing cards, badges on
  dark all have square corners. The only exception is the hero "Built for…" pill (`rounded-full`).
- **In-app surfaces → soft.** Scale:
  - `rounded-lg` (8px) — inputs, nav items, small buttons, icon buttons
  - `rounded-xl` (12px) — cards, KPI tiles, list rows
  - `rounded-2xl` (16px) — modals
  - `rounded-full` — pills, badges, avatars, progress bars, mobile tab bar

When designing **new app screens**, default to `rounded-xl` cards + `rounded-lg` controls +
`rounded-full` pills. When designing **new marketing sections**, default to square corners.

---

## 6. Elevation (shadow)

Restrained. Flat by default; shadow signals layering, not decoration.

- `shadow-sm` — app cards / KPI tiles (barely-there lift on white).
- `shadow-lg` / `shadow-xl` / `shadow-2xl` — modals and floating dropdowns.
- Marketing hero stat cards use a custom deep shadow: `shadow-[0_8px_30px_rgba(0,0,0,0.4)]`,
  deepening to `0_12px_40px_rgba(0,0,0,0.5)` on hover.
- Marketing report card: `shadow-[0_16px_50px_rgba(0,0,0,0.15)]`.

Most surfaces rely on **1px `border` hairlines**, not shadow, to separate. Borders do the structural
work; shadows are reserved for things that truly float above the page.

---

## 7. Iconography

- **Material Symbols Rounded**, loaded with axes `opsz 24, wght 400, FILL 1` (filled, rounded).
- Class: `material-symbols-rounded`. Sized via `text-[Npx]` — common: 14, 16, 18, 20, 24, 28.
- Used everywhere (~395 instances): nav, buttons, status, empty states, the spinner.
- **Spinner / loading:** the `progress_activity` glyph + `animate-spin` is the universal loader.
- Common glyphs in use: `dashboard`, `person_add`, `folder_open`, `description`, `inventory_2`,
  `receipt_long`, `gavel`, `settings`, `notifications`, `add`, `search`, `close`, `check`,
  `check_circle`, `warning`, `verified`, `thumb_up`, `share`, `account_balance`, `credit_card`,
  `payments`, `how_to_reg`, `person_pin_circle`, `history`, `star`, `menu`, `link_off`.

Keep iconography filled + rounded for consistency. Don't mix in outline or other icon sets.

---

## 8. Motion

Subtle, fast, functional.

- **Default transition:** `transition-colors` or `transition-all duration-200`.
- **Press feedback:** `active:scale-[0.98]` on buttons.
- **Hover:** `hover:opacity-90` on filled buttons; `hover:bg-surface` on bordered/ghost; lift
  (`translate-y`) on marketing cards.
- **Modal:** fade (`opacity`, 0.2s ease) on overlay + panel.
- **Drawer / slide-out:** `translateX` 0.3s ease (left for app menu, right for marketing menu).
- **Hero entrance:** `floatUp` keyframe — `translateY(24px) scale(0.95)` → rest, `0.7s
  cubic-bezier(0.16, 1, 0.3, 1)`, staggered `0.15s`/`0.3s`/`0.45s` delays.

Keep it under ~300ms, ease-out, and never block interaction.

---

## 9. Component catalog

Each component below exists in code. Specs are the canonical version — reproduce these, don't invent
variants.

### 9.1 Buttons
| Variant | Spec |
|---------|------|
| **Primary (app)** | `bg-primary text-foreground rounded-lg px-5 py-2.5`, `font-mono` or `font-sans` 13–15px medium/semibold, `hover:opacity-90`, `active:scale-[0.98]`, `disabled:opacity-50`. Icon + label common. |
| **Primary (marketing)** | `bg-[#FF8400] text-[#0D0D0D]` **square**, `px-8 py-3.5`, semibold 15px, `hover:bg-[#E67700]`. |
| **Secondary** | `border border-border text-foreground px-6 py-3 rounded-lg`, `hover:bg-surface`. |
| **Ghost** | `text-muted-foreground px-4 py-2`, `hover:bg-surface hover:text-foreground`. |
| **Icon button** | `w-10 h-10 rounded-lg border border-border`, muted icon, `hover:bg-surface`. |
> Predefined classes exist: `.btn-primary`, `.btn-secondary`, `.btn-ghost` in `main.css`.

### 9.2 Input field (`.input-field`)
`w-full px-4 py-3 rounded-lg border border-border bg-background`, placeholder muted,
`focus:ring-2 focus:ring-primary focus:border-primary` (ring opacity 0.3), `transition-all 200ms`.

### 9.3 Card
Base (`.card`): `bg-card border border-border p-6`. App data card: add `rounded-xl shadow-sm`.
Marketing feature card: `border border-border p-7` (square) — on dark, `bg-[#161616] border-[#2A2A2A]`.

### 9.4 Status pill / badge
`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium` + a status `bg`/`text`
pair from §2.4-A. Count badges: `px-2 py-0.5 rounded-full bg-[#E7E8E5] font-mono text-[12px] muted`.

### 9.5 KPI / metric tile
`bg-white border border-border rounded-xl p-5 shadow-sm`, vertical stack: label (13px muted) +
trailing icon (18px muted) on a row, then a `font-mono text-[28px] font-bold` number, then either a
status pill or a `rounded-full` progress bar (`h-1.5 bg-[#E7E8E5]` track, `bg-primary` fill).

### 9.6 Data table (desktop) → card list (mobile)
Desktop: white `rounded-xl` container, header row (title + count badge + inline search), a
`bg-background` column-header strip (12px mono/sans muted), then bordered rows
(`hover:bg-surface/30`), and a footer with "Showing X of Y" + Previous/Next. **Below `lg` the same
data renders as stacked `rounded-xl` cards.** Always design both.

### 9.7 Modal
`Teleport` to body. Overlay `bg-black/40`, centered panel `bg-white rounded-2xl border border-border
shadow-2xl`, `max-w-[560px] max-h-[90vh]`, three regions: header (title `font-mono text-base
font-bold` + `rounded-lg` close button), scrollable body (`p-6`), bordered footer with the primary
action full-width (`h-11 rounded-lg bg-primary`). Fade transition.

### 9.8 Empty state
Centered: `w-16 h-16 rounded-full bg-[#E7E8E5]` circle holding a 28px muted icon, then a `font-mono
text-base font-semibold` heading and a `font-sans text-sm muted` line (`max-w-[320px]`, centered).

### 9.9 Loading state
Centered `progress_activity` icon, 24–40px, muted, `animate-spin`; optional caption below.

### 9.10 Banner (alert strip)
Full-width dark strip (`bg-[#0D0D0D] text-white px-5 py-4`), orange warning icon, title + subtext,
trailing CTA (orange) or status chip (`bg-white/10`). Used for KYB gating.

### 9.11 Eyebrow label
`font-mono text-[11px] font-semibold text-[#FF8400] tracking-[2px] uppercase`. Sits above section
headings.

### 9.12 Logo (`UiRentCredLogo`)
Shield (orange `#FF8400` outer, inner fill flips by variant) + roof line + checkmark, with optional
`RentCred` wordmark in `font-mono font-bold`. Props: `size`, `variant` (`dark`=for dark bg,
`light`=for light bg), `showText`, `horizontal`. Wordmark size = `0.55 × size`. Shield aspect ≈
80:94. See `BRAND_AND_VOICE.md` for usage rules.

### 9.13 Sidebar nav item
`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans`. Active: `bg-[#CBCCC9]
text-foreground font-semibold`. Inactive: `text-muted-foreground hover:text-foreground
hover:bg-[#CBCCC9]/50`. Leading 20px icon. Grouped under mono uppercase section headers.

### 9.14 Mobile bottom tab bar
Fixed bottom, `rounded-full` white container with 1px border, 5 equal items, each a stacked 18px
icon + 10px uppercase label; active item gets `bg-primary text-foreground` pill.

### 9.15 Report verdict band
Thin horizontal bar split into segments colored by §2.4-B verdict colors — a quick visual summary of
check outcomes at the top of a report card.

---

## 10. Hand-off checklist for new designs

When producing a new screen, confirm:
- [ ] Correct surface mood (marketing dark+sharp vs app light+rounded).
- [ ] Semantic color tokens (not arbitrary hex) on in-app surfaces; both light & dark considered.
- [ ] Mono for headings/numbers/labels/status; sans for prose.
- [ ] Eyebrow label above marketing section headings.
- [ ] `1440` max width, correct responsive padding, `lg` breakpoint for shell changes.
- [ ] Empty / loading / error states designed, not just the happy path (see `SCREEN_INVENTORY.md`).
- [ ] Mobile variant for any table or sidebar.
- [ ] Material Symbols Rounded (filled) icons only.
- [ ] Single orange accent; on-orange text is near-black.
