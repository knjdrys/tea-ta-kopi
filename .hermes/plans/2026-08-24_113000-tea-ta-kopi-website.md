# Tea-Ta Kopi Website — BEST-IN-CLASS Roadmap

> Synthesizes: `design-taste-frontend`, `high-end-visual-design`, `gpt-taste`, `imagegen-frontend-web`,
> `frontend-anti-slop-polish`, `frontend-layout-qa`, `frontend-verification`, `claude-design`, `plan`.

**Goal:** A 4-page, mobile-first, light/dark cafe website that presents the Tea-Ta Kopi brand, the full
menu, the story, and visit info, ending in a single "Message us to order" CTA. Agency-tier craft, zero
AI-slop, verified in a real headless browser, deployable free, editable by a non-developer.

**Brand (locked, from owner):** Tea-Ta Kopi, EST 2024, Dolores, Capas, Tarlac. Hours: Everyday 3 PM-10 PM.
Logo: line-art barista, house-icon "A", coffee-bean "O", monochrome base. Full ₱-priced menu.

**Design Read (taste §0):** Multi-page info site for a neighborhood takeout cafe, warm homey/cozy language,
leaning toward a self-hosted geometric-sans system, monochrome base + ONE warm clay accent, light/dark,
mobile-first, using the owner's real storefront + menu photography as primary imagery.

**Surface (claude-design):** PRIMARY surface = *Decide/Learn* (marketing). So a hero is correct, but every
other section must avoid the "hero + 3 equal cards" tell and use varied composition.

**Dials (taste §1):** `DESIGN_VARIANCE: 6`, `MOTION_INTENSITY: 4`, `VISUAL_DENSITY: 4`.
**Motion quality (high-end):** fluid custom cubic-bezier `cubic-bezier(0.32,0.72,0,1)`, no `linear`/`ease-in-out`.
**Vibe Archetype (high-end §3A):** *Editorial Luxury / Soft Structuralism* blend (warm, premium-casual) — NOT
Ethereal Glass (too techy for a cafe). Subtle fixed film-grain overlay at 0.03 opacity.

---

## Phase 0 — Art Direction (imagegen-frontend-web discipline)
No generative still-image tool exists here; the discipline is applied as **direction**, not generation.
- ONE visual concept per section; all sections share: clay accent, warm cream/espresso neutrals, Space Grotesk
  type, pill-button language, 16px card radius, same photo grade (warm, slightly desaturated).
- Composition variety (gpt-taste + imagegen §18): hero = bottom-left text over full-bleed storefront-night
  image (NOT the overused left-text/right-image). Other sections rotate anchors (centered-low, editorial
  offset, split, mini-minimalist) so no anchor repeats >2x in a row.
- Real photos mapped to slots: `storefront-night.jpg` (hero + visit), `menu-board.jpg` (menu hero + about
  gallery), plus 3-4 drink close-ups the owner can shoot with a phone (we leave clearly-labeled slots).
- Deliverable: a one-page **mood/section map** (this plan's section list) the owner approves before build.

## Phase 1 — Design System (taste §2/§3 + high-end §4)
Files: `css/tokens.css`, `css/style.css`.
- **Color (one accent, locked, taste §4.2/§4.11):** warm clay `#C2603C` (light) / `#D9744E` (dark). Off-white
  `#FCFBF9`, warm near-black `#1B1712` (light) / `#15110C` (dark). Tints within family only. No pure #000/#fff,
  no AI-purple, no banned beige+brass hexes. No section flips theme mid-page.
- **Type:** Display+body **Space Grotesk** (geometric, matches blocky logo; not Inter/Roboto — passes both
  bans). Labels/prices **Space Mono**. Self-hosted woff2 (`@font-face`, `font-display:swap`), never `<link>`
  Google Fonts. Scale: hero `clamp(2.4rem,6vw,4rem)` tight leading-none; section `clamp(1.6rem,3vw,2.4rem)`;
  body `1rem` `--ink-soft` `max-width:65ch`. No serif. No Inter.
- **Shape lock (taste §4.4):** buttons/inputs pill `999px`, cards `16px`, images `16px`. Documented, consistent.
- **Elevation (high-end Double-Bezel):** hero + feature cards use nested shell (tinted bg, hairline, `p-2`,
  `rounded-[2rem]`) > inner core (own bg, `inset` top highlight, concentric smaller radius). Shadows tinted to
  bg (no pure-black drop shadows). No 1px gray borders, no harsh shadows (high-end §2 bans).
- **Tokens:** spacing scale, radii, tinted shadow, `@font-face`, light + `[data-theme="dark"]` blocks.

## Phase 2 — Build 4 pages (claude-design surface + gpt-taste AIDA + high-end craft)
Shared: floating glass **Fluid Island nav** (`mt-6 mx-auto rounded-full backdrop-blur`, solid fallback),
single-line desktop (<=80px), hamburger morphs to X on mobile, staggered link reveal.
One CTA intent site-wide: "Message us to order" (nav, hero, contact) — no duplicate intent (taste §4.5).

- **Home (`index.html`)** — AIDA flow, >=4 distinct layout families:
  1. Hero: full-bleed storefront-night, tonal wash, bottom-left, headline 2 lines ("Your neighborhood cup,
     every afternoon."), subtext <=20 words, ONE CTA visible without scroll. `min-height:88dvh` (not `h-screen`).
  2. Best Sellers: **gapless bento** (`grid-flow-dense`, exact cells = items, no empty voids, gpt-taste §4)
     with real drink photos + brand 4-point star on best-sellers.
  3. Story teaser: **editorial offset** (asymmetric) text + storefront image (different family from hero).
  4. Visit snippet: split, mini map + hours 3PM-10PM everyday + CTA.
  5. Footer: logo, socials, copyright.
- **Menu (`menu.html`)** — mini-minimalist hero (negative space) + menu-board reference; categories as gapless
  2-col card grid, prices in Space Mono, brand-star best-sellers; Add-Ons strip. Exact cell count = item count.
  No 20-row hairline table (taste §4.9).
- **About (`about.html`)** — story (house "A"=home, bean "O"=coffee, EST 2024), real-photo gallery, values.
  Different families from Home.
- **Visit/Contact (`contact.html`)** — hours, address, Google Maps embed (no API key), `#order` anchor with the
  single order CTA (opens owner's Messenger), socials. No fake contact details.

## Phase 3 — Behavior (js/main.js, vanilla, no deps)
- Theme toggle (saved > `prefers-color-scheme`), persisted in `localStorage`.
- Mobile nav toggle (hamburger morph, `aria-expanded`).
- Scroll reveal via **IntersectionObserver** (taste §5.D hard-ban on `window.addEventListener('scroll')`).
- Reduced-motion: if set, reveal content instantly; no blur/translate (high-end §6, taste §6.B).
- Hover: `@media (hover:hover) and (pointer:fine)` only, so touch has no sticky-press (layout-qa).

## Phase 4 — Anti-Slop Gate (frontend-anti-slop-polish)
- Baseline: `npx impeccable detect . --no-config` -> capture count + file:line.
- Triage via reconciliation: FIX dark-glow, side-tab, gradient-text, overused-font, layout-transition,
  skipped-heading. KEEP the brand clay accent (taste: "use what the brand already uses" overrides detector's
  ai-color-palette flag).
- Grep body copy for em-dash `—` / en-dash `–`; replace with period/comma/hyphen (taste §9.G zero-tolerance).
- Re-run detector -> count must drop. Keep brand color deliberately.
- Slop self-audit (claude-design 10 tells): target score low; if compositional tells (3/8/10) fire, re-layout
  not recolor.

## Phase 5 — Layout QA + Headless Verification (frontend-layout-qa + frontend-verification)
- Serve `python -m http.server 8410`; `curl` 200.
- `npm install puppeteer-core --no-save`; drive system Chrome
  (`C:\Program Files\Google\Chrome\Application\chrome.exe`, `headless:'new'`,
  `args:['--no-sandbox','--disable-setuid-sandbox']`).
- Per page x light/dark x viewport (390 mobile, 1280 desktop, 320 tiny): assert
  - `scrollWidth <= clientWidth + 2` (no horizontal overflow)
  - hero CTA `getBoundingClientRect().bottom < innerHeight` (visible w/o scroll)
  - nav height <= 80px; mobile shows hamburger only
  - `page.on('pageerror')` = 0 and `console` error = 0
  - theme toggle actually changes a computed color
- Screenshots at 3 sizes confirm no clipping. Clean up `node_modules` + probe.
- Report real numbers: "4 pages x 2 themes x 3 viewports = 24 passes, 0 JS errors, 0 overflow."

## Phase 6 — Pre-Flight (taste §14 full matrix)
Walk every box: em-dash=0, theme lock, color lock, shape lock, button contrast (WCAG AA), CTA no-wrap,
form contrast, hero fits viewport, eyebrow count <= ceil(sections/3), zigzag cap, no duplicate CTA intent,
real images (no fake rectangles), no AI tells, motion motivated + reduced-motion, dark mode both, mobile
collapse explicit, `min-h-[100dvh]` not `h-screen`, Observer cleanup, empty/loading/error states, icons from
lib not hand-rolled (or brand mark only), no `window.scroll` listener, Core Web Vitals plausible. Fix any fail.

## Phase 7 — Deploy + Analytics + Handoff
- **Deploy:** Netlify Drop (drag `tea-ta-kopi/` folder, free `*.netlify.app`, zero config). Alt: GitHub Pages /
  Vercel. Custom domain `teatakopi.com` = paid/optional, documented.
- **Analytics:** add privacy-friendly (Plausible/Umami or Netlify Analytics) after launch.
- **Handoff (`README.md`):** plain Taglish/English — change hours (one line in contact.html), add a menu item
  (copy a card block), swap a photo (replace file in assets/, keep name), change order link (one href),
  redeploy (re-drop folder).

---

## Roadmap at a glance
| Phase | Skill(s) driving it | Output |
|---|---|---|
| 0 | imagegen-frontend-web | Section/art-direction map (owner approves) |
| 1 | design-taste + high-end-visual | tokens.css, style.css (system locked) |
| 2 | claude-design + gpt-taste + high-end | 4 pages built with agency craft |
| 3 | frontend-* (JS) | theme toggle, nav, reveals, reduced-motion |
| 4 | frontend-anti-slop-polish | impeccable before/after, em-dash sweep |
| 5 | frontend-layout-qa + frontend-verification | headless measure: 0 errors, 0 overflow |
| 6 | design-taste pre-flight | full matrix green |
| 7 | plan/deploy | live URL + README handoff |

## Risks / open inputs from owner
- **FB / IG / Messenger links** (placeholders `m.me/teatakopi`, `@teatakopi` until real).
- **Map pin** exact location for the embed.
- **Extra drink photos** (phone shots) to fill hero/menu slots beyond the 2 shared images; slots labeled if missing.
- **Custom domain** is optional/paid; launch on free subdomain first.
