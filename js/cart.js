/* Tea-Ta Kopi - Order cart (vanilla, no deps)
   - add items by tapping menu buttons (data-name/size/price/cat)
   - live total, persists across pages via localStorage
   - "Send order" opens Messenger with the order pre-typed
   - works on phone: floating FAB + slide-up drawer, focus-trapped-ish
*/
(function () {
  "use strict";

  var MESSENGER_ID = "61563817495458";
  var STORE_KEY = "ttk-cart";

  var cart = load();

  /* ---- Inject shared cart UI into every page (so it works site-wide) ---- */
  injectCartUI();

  /* ---- DOM (created above if absent) ---- */
  var fab = document.getElementById("cart-fab");
  var badge = document.getElementById("cart-fab-badge");
  var drawer = document.getElementById("cart-drawer");
  var backdrop = document.getElementById("cart-backdrop");
  var body = document.getElementById("cart-body");
  var totalEl = document.getElementById("cart-total");
  var sendBtn = document.getElementById("cart-send");
  var clearBtn = document.getElementById("cart-clear");
  var closeBtn = document.getElementById("cart-close");

  /* ---- Inject the cart FAB + drawer into any page that lacks them ---- */
  function injectCartUI() {
    if (document.getElementById("cart-fab")) return; // menu.html already has it
    var fabEl = document.createElement("button");
    fabEl.className = "cart-fab";
    fabEl.id = "cart-fab";
    fabEl.type = "button";
    fabEl.setAttribute("aria-label", "Open order cart");
    fabEl.hidden = true;
    fabEl.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>' +
      '<span class="cart-fab__badge" id="cart-fab-badge">0</span>';

    var drawerEl = document.createElement("div");
    drawerEl.className = "cart-drawer";
    drawerEl.id = "cart-drawer";
    drawerEl.setAttribute("aria-hidden", "true");
    drawerEl.innerHTML =
      '<div class="cart-drawer__panel" role="dialog" aria-modal="true" aria-label="Your order">' +
        '<div class="cart-drawer__head"><h2 class="cart-drawer__title">Your order</h2><button class="cart-drawer__close" id="cart-close" type="button" aria-label="Close cart">&times;</button></div>' +
        '<div class="cart-drawer__body" id="cart-body"></div>' +
        '<div class="cart-drawer__foot">' +
          '<div class="cart-total"><span>Total</span><span class="cart-total__amt" id="cart-total">P 0</span></div>' +
          '<a class="btn btn--accent btn--block" id="cart-send" href="#" target="_blank" rel="noopener">Send order to Messenger<span class="btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>' +
          '<button class="cart-clear" id="cart-clear" type="button">Clear order</button>' +
        '</div>' +
      '</div>';

    var backdropEl = document.createElement("div");
    backdropEl.className = "cart-backdrop";
    backdropEl.id = "cart-backdrop";
    backdropEl.hidden = true;

    document.body.appendChild(fabEl);
    document.body.appendChild(drawerEl);
    document.body.appendChild(backdropEl);
  }

  /* ---- Add to cart from any data-* button ---- */
  function addItem(btn) {
    var name = btn.getAttribute("data-name");
    var size = btn.getAttribute("data-size") || "";
    var price = parseInt(btn.getAttribute("data-price"), 10);
    var cat = btn.getAttribute("data-cat") || "";
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].name === name && cart[i].size === size) { existing = cart[i]; break; }
    }
    if (existing) { existing.qty = (existing.qty || 1) + 1; }   // same item -> bump quantity, not a new row
    else { cart.push({ name: name, size: size, price: price, cat: cat, qty: 1 }); }
    save();
    ensureFab();      // reveal cart first so we can measure its position
    render(true);
    pulse(btn);
    flyToCart(btn);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".add-btn, .size-btn");
    if (btn) { addItem(btn); return; }
  });

  /* ---- Render ---- */
  function render(animate) {
    var count = cart.reduce(function (s, it) { return s + (it.qty || 1); }, 0);  // total pieces (for badge)
    if (badge) badge.textContent = count;
    if (fab) fab.hidden = count === 0;

    if (!body) return;
    if (count === 0) {
      body.innerHTML = '<p class="cart-empty">Your order is empty. Tap any drink on the menu to add it.</p>';
    } else {
      var rows = "";
      cart.forEach(function (it, i) {
        var label = it.name + (it.size ? " (" + it.size + ")" : "");
        var qty = it.qty || 1;
        rows +=
          '<div class="cart-row">' +
            '<button class="cart-row__step" type="button" data-act="dec" data-i="' + i + '" aria-label="Decrease ' + escapeHtml(label) + '">&minus;</button>' +
            '<span class="cart-row__name">' + escapeHtml(label) + "</span>" +
            '<span class="cart-row__qty">x' + qty + "</span>" +
            '<span class="cart-row__price">P ' + (it.price * qty) + "</span>" +
            '<button class="cart-row__step" type="button" data-act="inc" data-i="' + i + '" aria-label="Increase ' + escapeHtml(label) + '">+</button>' +
            '<button class="cart-row__del" type="button" data-i="' + i + '" aria-label="Remove ' + escapeHtml(label) + '">&times;</button>' +
          "</div>";
      });
      body.innerHTML = rows;
    }

    var total = cart.reduce(function (s, it) { return s + it.price * (it.qty || 1); }, 0);
    if (totalEl) totalEl.textContent = "P " + total;
    if (sendBtn) sendBtn.href = buildMessengerLink(total);
  }

  /* ---- Qty stepper in the drawer ---- */
  if (body) {
    body.addEventListener("click", function (e) {
      var step = e.target.closest(".cart-row__step");
      if (step) {
        var i = parseInt(step.getAttribute("data-i"), 10);
        var act = step.getAttribute("data-act");
        if (act === "inc") { cart[i].qty = (cart[i].qty || 1) + 1; }
        else { cart[i].qty = (cart[i].qty || 1) - 1; if (cart[i].qty <= 0) cart.splice(i, 1); }
        save(); render(); return;
      }
      var del = e.target.closest(".cart-row__del");
      if (del) {
        var j = parseInt(del.getAttribute("data-i"), 10);
        cart.splice(j, 1);
        save(); render(); return;
      }
    });
  }

  /* ---- Drawer open/close ---- */
  function openDrawer() { if (!drawer) return; drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); if (backdrop) backdrop.hidden = false; if (window.__ttkLockScroll) window.__ttkLockScroll(true); if (closeBtn) closeBtn.focus(); }
  function closeDrawer() { if (!drawer) return; drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); if (backdrop) backdrop.hidden = true; if (window.__ttkLockScroll) window.__ttkLockScroll(false); }
  if (fab) fab.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  /* ---- "Message us to order" buttons anywhere ---- */
  function wireOrderButtons() {
    document.querySelectorAll(".js-order").forEach(function (b) {
      if (b.dataset.wired) return;
      b.dataset.wired = "1";
      b.addEventListener("click", function (e) {
        e.preventDefault();
        // If there are items, open the cart; else go to the menu to start one.
        if (cart.length > 0 && drawer) { openDrawer(); }
        else if (drawer) { openDrawer(); }
        else { window.location.href = "menu.html"; }
      });
    });
  }

  if (clearBtn) clearBtn.addEventListener("click", function () {
    cart = []; save(); render();
  });

  /* ---- Build Messenger prefill link ---- */
  function buildMessengerLink(total) {
    var lines = ["Hi Tea-Ta Kopi! I'd like to order:"];
    var grouped = {};
    cart.forEach(function (it) {
      var k = it.name + (it.size ? " (" + it.size + ")" : "");
      grouped[k] = (grouped[k] || 0) + 1;
    });
    Object.keys(grouped).forEach(function (k) {
      lines.push("- " + k + (grouped[k] > 1 ? " x" + grouped[k] : ""));
    });
    lines.push("Total: P " + total);
    lines.push("Pickup time: ");
    var text = encodeURIComponent(lines.join("\n"));
    return "https://m.me/" + MESSENGER_ID + "?text=" + text;
  }

  /* ---- Fly-to-cart animation (the satisfying part) ---- */
  var SUPPORTS_OFFSET = (function () {
    try { return window.CSS && CSS.supports && CSS.supports("offset-path", 'path("M0 0 L1 1")'); }
    catch (e) { return false; }
  })();

  function flyToCart(btn) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fab || fab.hidden || !SUPPORTS_OFFSET || reduce) { bumpCart(); return; }

    var start = btn.getBoundingClientRect();
    var end = fab.getBoundingClientRect();
    var sx = start.left + start.width / 2;
    var sy = start.top + start.height / 2;
    var ex = end.left + end.width / 2;
    var ey = end.top + end.height / 2;
    // control point: above the midpoint so the path arcs up and over
    var cx = (sx + ex) / 2;
    var cy = Math.min(sy, ey) - Math.max(90, Math.abs(ex - sx) * 0.25);

    var fly = document.createElement("span");
    fly.className = "cart-fly";
    fly.textContent = btn.getAttribute("data-size") ? btn.getAttribute("data-size") : "+";
    fly.style.offsetPath = 'path("M ' + sx + " " + sy + " Q " + cx + " " + cy + " " + ex + " " + ey + '")';
    document.body.appendChild(fly);

    requestAnimationFrame(function () { fly.classList.add("cart-fly--go"); });

    var done = false;
    function finish() {
      if (done) return; done = true;
      if (fly.parentNode) fly.remove();
      bumpCart();
    }
    fly.addEventListener("animationend", finish);
    setTimeout(finish, 900); // safety net
  }

  function bumpCart() {
    if (!fab) return;
    fab.classList.remove("cart-fab--bump");
    void fab.offsetWidth;
    fab.classList.add("cart-fab--bump");
  }

  /* ---- Helpers ---- */
  function load() { try { var c = JSON.parse(localStorage.getItem(STORE_KEY)) || []; c.forEach(function (it) { if (!it.qty) it.qty = 1; }); return c; } catch (e) { return []; } }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) {} }
  function ensureFab() { if (fab && cart.length) fab.hidden = false; }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pulse(btn) {
    btn.classList.remove("pulse"); void btn.offsetWidth; btn.classList.add("pulse");
  }

  /* ---- Init ---- */
  wireOrderButtons();
  render();
  ensureFab();
})();
