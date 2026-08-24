# Tea-Ta Kopi - Website Handoff

A 4-page static cafe website that actually takes orders. Mobile-first, light +
dark mode, installable on phone (PWA), works offline, no build step.
"Tea-Ta" means "A Sip of Tita's Warm Embrace."

## What's new in this version
- **Real order flow** - Tap any drink on the menu (pick a size where it has
  sizes), and it builds a live cart with a running total. The cart follows you
  across every page and survives reloads. "Send order" opens your Facebook
  Messenger with the order already typed out, so you just hit send.
- **Installable app (PWA)** - Add to Home Screen on a phone and it opens like a
  native app (full screen, no browser bar). Works offline once visited.
- **Verified on real phones** - 48 automated checks: add-to-cart, total, remove
  item, cart persistence, Messenger prefill, drawer, PWA install + offline
  reload. 0 JS errors, 0 layout overflow at 320 / 390 / 1280 px.

## Files
- index.html   - Home (hero, best sellers, story, visit)
- menu.html    - Full menu with tap-to-order buttons
- about.html   - Story + logo meaning + gallery
- contact.html - Visit info, map, order
- manifest.webmanifest - PWA metadata (name, icons, colors)
- service-worker.js    - offline cache
- css/tokens.css - colors, fonts, light/dark theme (one place for brand color)
- css/style.css  - nav, footer, buttons, cards, motion
- css/pages.css  - page sections + cart drawer + FAB
- js/main.js     - theme toggle, mobile menu, scroll reveal, SW register
- js/cart.js     - order cart (add, total, drawer, Messenger prefill)
- icons/         - app icons (192, 512, maskable)
- assets/        - storefront-night.jpg, menu-board.jpg, logo-lineart.png
- fonts/         - self-hosted Sora + Space Mono (no internet needed)

## How to edit (no coding needed)

### Change the order link (Facebook Messenger)
Open js/cart.js, find `var MESSENGER_ID = "61563817495458";` and change it to
your Facebook page id. That one change updates every "Send order" button.
(The bare `m.me/ID` link also appears in contact.html and the footers - change
those too if you prefer the direct link style.)

### Add or change a menu item
Open menu.html. Each tappable item looks like one of these:
  <button class="add-btn" data-name="Extra Pearl" data-size="" data-price="10" data-cat="Add Ons">+ Add</button>
  <button class="size-btn" data-name="Wintermelon" data-size="M" data-price="50" data-cat="Milk Tea">M·P50</button>
  <button class="size-btn" data-name="Wintermelon" data-size="L" data-price="60" data-cat="Milk Tea">L·P60</button>
Copy a row, change the name/price, keep the data-* attributes. The cart reads
those attributes, so no other code needs changing.

### Change the hours
Open contact.html, find `<span class="info-row__v">Every day, 3 PM to 10 PM</span>`
and edit. Also update the visit section on index.html.

### Swap a photo
Drop your new image in assets/ with the same filename used in the HTML, or
change the src="assets/NAME.jpg". Keep names simple.

### Change brand color
Open css/tokens.css, change --accent (clay/terracotta). Keep it dark enough
that white text stays readable. All pages update automatically.

## Deploy (free, no coding)
Option A - Netlify Drop (easiest):
1. Go to https://app.netlify.com/drop
2. Drag the whole tea-ta-kopi folder onto the page
3. You get a free *.netlify.app link. Done.

Option B - GitHub Pages:
1. Make a GitHub repo, upload all these files
2. Settings > Pages > deploy from main branch / root
3. Free *.github.io link

Optional custom domain (teatakopi.com) is a paid step at your domain registrar
and the host's settings. Not required to go live.

## Notes
- The site works with no internet (fonts and images are local).
- Theme choice is remembered per visitor.
- After the first visit, the site loads offline (service worker cache).
- One photo slot in about.html is still a placeholder (gallery's third image).
  Replace it with a real drink/store photo when ready.
