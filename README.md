# Tea-Ta Kopi

A mobile-first static café ordering site for Tea-Ta Kopi in Dolores, Capas, Tarlac. It is intentionally dependency-free: no build step, no account required, and no payment credentials are collected in the browser.

## Customer flow

1. Browse the menu with search and category filters.
2. Quick-add a standard item, or open **Customize** for size, sweetness, ice, extras, quantity, and a note.
3. Review the saved cart from any page. Cart data survives navigation and reloads in `localStorage`.
4. Add pickup details on `order.html`.
5. Send the prepared order to Tea-Ta Kopi through Messenger. The café confirms availability, final total, payment, and pickup timing there.
6. The confirmation view keeps a local order reference and a clear awaiting-confirmation timeline. It does not claim that a payment or café acceptance happened.

The site supports pickup only because no verified delivery or payment integration is configured in this repository.

## Routes and files

- `index.html` - welcome page, favorites, story teaser, and visit preview
- `menu.html` - searchable, filterable catalog with quick-add and customization
- `order.html` - order review, pickup details, validation, Messenger handoff, and confirmation state
- `about.html` - the Tea-Ta Kopi story, values, and real shop photos
- `contact.html` - hours, location, map, and pickup guidance
- `js/menu-data.js` - single source of truth for menu items, sizes, prices, availability, and descriptions
- `js/menu.js` - catalog rendering, search, filters, and product entry points
- `js/cart.js` - accessible cart drawer, data-driven product customizer, local persistence, quantity controls, and Messenger link generation
- `js/order.js` - checkout validation, local order reference, and confirmation state
- `js/main.js` - theme preference, mobile navigation, reveal motion, and offline notice
- `css/tokens.css` - shared color, type, spacing, radius, shadow, and motion tokens
- `css/style.css` - shared navigation, buttons, forms, footer, and primitives
- `css/pages.css` - page layouts, catalog cards, cart drawer, customizer, and checkout styling
- `service-worker.js` - offline shell and cache versioning

## Updating menu data

Edit `js/menu-data.js`. Each item has a category, one or more sizes, a price, and an `available` flag. Set `available: false` to show a sold-out state without removing the item from the catalog. Keep prices as numbers.

Example:

```js
drink("New drink", "Milk Tea", [
  { label: "Medium", price: 55 },
  { label: "Large", price: 65 }
], { bestSeller: true });
```

If a size, price, or modifier is not offered in-store, do not add it to the data. The café still confirms every order in Messenger.

### Smart modifier model

Each product receives a `customization` object with a service note, size options, and only the relevant modifier groups. Coffee exposes sweetness and ice; milk tea exposes sweetness, ice, and the available pearl or nata toppings; shakes keep their blended recipe and only expose a strawberry finish where it makes sense; fruit drinks expose fruit-compatible toppings; and unrelated products never receive random puree or milk controls. Each paid option carries its own price and `available` flag. The `audit` array on `window.TTKMenu` makes the per-product decision set inspectable for future staff tooling.

To add a modifier later, update a definition in `js/menu-data.js` and attach it to the appropriate product profile. The customizer, price calculation, cart summary, and Messenger text render from that model instead of category-specific conditionals in the UI.

## Updating café details

The address, hours, and Facebook page link appear in the page HTML and metadata. Search for `Dolores, Capas, Tarlac`, `3 PM to 10 PM`, or the Messenger ID `61563817495458` when the business details change.

The map uses a Google Maps embed and may not load offline. The address and hours remain visible without it.

## Local testing

Serve the repository over HTTP so the service worker and Messenger flow behave like deployment:

```bash
python3 -m http.server 8410 --bind 0.0.0.0
```

Then open `http://localhost:8410/`. Test at 320px, 390px, tablet, and desktop widths, in light and dark themes. Clear `ttk-cart` and `ttk-last-order` in browser storage to reset an order session.

## Deployment

This is a static site and can be deployed to Netlify Drop, GitHub Pages, Cloudflare Pages, or any static host. Keep the site served over HTTPS in production so the service worker and external Messenger links work reliably.

Before launch, replace any business details that have changed, confirm the exact map pin, verify the Facebook page link, and test the full handoff on a real phone.
