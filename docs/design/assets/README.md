# RentCred — Logo Assets

Vector source for the RentCred mark, extracted verbatim from the live component
[`apps/web/components/ui/RentCredLogo.vue`](../../../apps/web/components/ui/RentCredLogo.vue).
There was no editable logo file in the repo before this — only the inline-SVG component and flattened
favicon PNGs in `apps/web/public/`. These `.svg` files are the editable source for design tools.

## Files

| File | Contents | Place it on |
|------|----------|-------------|
| `logo-icon-on-dark.svg` | Shield icon only | **Dark** backgrounds (white check, near-black shield interior) |
| `logo-icon-on-light.svg` | Shield icon only | **Light** backgrounds (dark check, off-white shield interior) |
| `logo-on-dark.svg` | Icon + "RentCred" wordmark | **Dark** backgrounds (white wordmark) |
| `logo-on-light.svg` | Icon + "RentCred" wordmark | **Light** backgrounds (dark wordmark) |

> Naming is by **the background the logo sits on**. (The code component's `variant` prop is the
> opposite-sounding `dark`/`light`, where `variant="dark"` means "for dark backgrounds" — these files
> use the clearer `on-dark` / `on-light` convention. See `../BRAND_AND_VOICE.md §2`.)

## Construction (for reference / recreation)
- **Icon viewBox:** `0 0 80 94` (aspect ≈ 80:94). Shield outer = brand orange `#FF8400`; inner fill
  `#0A0A0A` (on-dark) / `#F8F8F8` (on-light); roof line orange `#FF8400` (2px @ scale, `stroke-width
  3.5`); check `#FFFFFF` (on-dark) / `#1A1A1A` (on-light), `stroke-width 4`, rounded caps/joins.
- **Wordmark:** "RentCred" in **JetBrains Mono, weight 700**. In the lockups it sits at icon-relative
  `font-size 44`, `x 108` (gap ≈ 28 native units after the icon), baseline `y 63` (vertically centered
  on the icon). Color `#FFFFFF` (on-dark) / `#1A1A1A` (on-light).

## Important: the wordmark uses a live font
The lockup `.svg` files render the wordmark with a `<text>` element referencing **JetBrains Mono**.
For a fully portable asset (no font dependency), open the lockup in your design tool and **convert the
text to outlines/paths**, or install JetBrains Mono (Google Fonts) before exporting. The icon-only
files have no font dependency and are safe to use anywhere as-is.

## Brand rules (summary — full rules in `../BRAND_AND_VOICE.md`)
- Keep the shield's orange constant (`#FF8400`); never recolor it.
- Match the variant to the background (don't put `on-dark` on a light surface).
- Wordmark is **only** ever JetBrains Mono bold.
- No gradients, shadows, or outlines on the mark.
