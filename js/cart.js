/* Tea-Ta Kopi ordering layer.
   The cart is deliberately client-side: the café confirms the final order in
   Messenger, so this UI never pretends that payment or acceptance happened. */
(function () {
  "use strict";

  var MESSENGER_ID = "61563817495458";
  var STORE_KEY = "ttk-cart";
  var LAST_ORDER_KEY = "ttk-last-order";
  var cart = loadCart();
  var subscribers = [];
  var modalState = null;
  var modalPreviousFocus = null;
  var drawerPreviousFocus = null;
  var modalCounter = 0;

  injectSharedUI();

  var fab = document.getElementById("cart-fab");
  var badge = document.getElementById("cart-fab-badge");
  var fabLabel = document.getElementById("cart-fab-label");
  var drawer = document.getElementById("cart-drawer");
  var drawerPanel = drawer && drawer.querySelector(".cart-drawer__panel");
  var backdrop = document.getElementById("cart-backdrop");
  var body = document.getElementById("cart-body");
  var foot = document.getElementById("cart-foot");
  var closeButton = document.getElementById("cart-close");
  var clearButton = document.getElementById("cart-clear");
  var modal = document.getElementById("product-modal");
  var modalPanel = modal && modal.querySelector(".product-modal");

  function injectSharedUI() {
    if (!document.getElementById("cart-fab")) {
      var fabEl = document.createElement("button");
      fabEl.id = "cart-fab";
      fabEl.className = "cart-fab";
      fabEl.type = "button";
      fabEl.hidden = true;
      fabEl.setAttribute("aria-label", "Open your order");
      fabEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><span class="cart-fab__label" id="cart-fab-label">Your order</span><span class="cart-fab__badge" id="cart-fab-badge">0</span>';
      document.body.appendChild(fabEl);
    }
    if (!document.getElementById("cart-drawer")) {
      var drawerEl = document.createElement("div");
      drawerEl.id = "cart-drawer";
      drawerEl.className = "cart-drawer";
      drawerEl.setAttribute("aria-hidden", "true");
      drawerEl.innerHTML = '<section class="cart-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title"><header class="cart-drawer__header"><div><p class="cart-drawer__kicker">Pickup order</p><h2 class="cart-drawer__title" id="cart-title">Your order</h2></div><button class="cart-close" id="cart-close" type="button" aria-label="Close your order">&times;</button></header><div class="cart-drawer__body" id="cart-body"></div><footer class="cart-drawer__foot" id="cart-foot"></footer></section>';
      document.body.appendChild(drawerEl);
    }
    if (!document.getElementById("cart-backdrop")) {
      var backdropEl = document.createElement("div");
      backdropEl.id = "cart-backdrop";
      backdropEl.className = "cart-backdrop";
      backdropEl.hidden = true;
      document.body.appendChild(backdropEl);
    }
    if (!document.getElementById("product-modal")) {
      var modalEl = document.createElement("div");
      modalEl.id = "product-modal";
      modalEl.className = "modal-shell";
      modalEl.setAttribute("aria-hidden", "true");
      modalEl.innerHTML = '<div class="modal-backdrop" data-modal-close></div><section class="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"></section>';
      document.body.appendChild(modalEl);
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function money(value) { return "P " + Number(value || 0); }
  function cloneItems(items) { return JSON.parse(JSON.stringify(items || cart)); }
  function itemId(item) { return [item.name, item.size || "", item.price, JSON.stringify(item.options || {}), item.note || ""].join("|"); }
  function normalizeOptions(options) {
    options = options || {};
    return {
      sweetness: options.sweetness || "",
      ice: options.ice || "",
      extras: Array.isArray(options.extras) ? options.extras.map(function (extra) { return { name: String(extra.name), price: Number(extra.price) || 0 }; }) : []
    };
  }
  function normalizeItem(item) {
    if (!item || !item.name) return null;
    var price = Number(item.price);
    if (!isFinite(price) || price < 0) return null;
    var normalized = {
      name: String(item.name),
      size: item.size ? String(item.size) : "",
      price: price,
      basePrice: Number(item.basePrice) >= 0 ? Number(item.basePrice) : price,
      cat: item.cat ? String(item.cat) : "",
      qty: Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1)),
      options: normalizeOptions(item.options),
      note: item.note ? String(item.note).slice(0, 180) : ""
    };
    normalized.id = item.id || itemId(normalized);
    return normalized;
  }
  function loadCart() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeItem).filter(Boolean);
    } catch (error) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (error) {}
  }
  function getCount(items) { return (items || cart).reduce(function (sum, item) { return sum + (item.qty || 1); }, 0); }
  function getSubtotal(items) { return (items || cart).reduce(function (sum, item) { return sum + Number(item.price || 0) * (item.qty || 1); }, 0); }
  function getItems() { return cloneItems(cart); }

  function notify() {
    renderCart();
    subscribers.slice().forEach(function (callback) { try { callback(getItems()); } catch (error) {} });
  }

  function findMatching(item) {
    var signature = itemId(item);
    for (var index = 0; index < cart.length; index += 1) {
      if (itemId(cart[index]) === signature) return cart[index];
    }
    return null;
  }
  function addItem(item) {
    var normalized = normalizeItem(item);
    if (!normalized) return;
    var existing = findMatching(normalized);
    if (existing) {
      existing.qty = Math.min(99, existing.qty + normalized.qty);
    } else {
      cart.push(normalized);
    }
    saveCart();
    notify();
    pulseFab();
    showToast(existing ? normalized.name + " updated" : normalized.name + " added", existing ? "Quantity " + (existing ? existing.qty : normalized.qty) : money(normalized.price));
  }

  function quickAdd(button) {
    var price = parseInt(button.getAttribute("data-price"), 10);
    if (!button.getAttribute("data-name") || !isFinite(price)) return;
    addItem({
      name: button.getAttribute("data-name"),
      size: button.getAttribute("data-size") || "",
      price: price,
      basePrice: price,
      cat: button.getAttribute("data-cat") || "",
      qty: 1
    });
  }

  function customSummary(item) {
    var options = normalizeOptions(item.options);
    var details = [];
    if (item.size) details.push(item.size);
    if (options.sweetness) details.push(options.sweetness + " sweetness");
    if (options.ice) details.push(options.ice + " ice");
    if (options.extras.length) details.push(options.extras.map(function (extra) { return extra.name; }).join(", "));
    if (item.note) details.push("Note: " + item.note);
    return details.join(" · ");
  }

  function renderCart() {
    var count = getCount();
    if (fab) {
      fab.hidden = count === 0;
      fab.setAttribute("aria-label", count ? "Open your order, " + count + (count === 1 ? " item" : " items") : "Your order is empty");
    }
    if (badge) badge.textContent = count;
    if (fabLabel) fabLabel.textContent = count ? "Your order" : "Your order";
    if (!body || !foot) return;

    if (!count) {
      body.innerHTML = '<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><strong>Your order is empty</strong><span>Choose a drink or snack and it will appear here.</span><a href="menu.html">Browse the menu</a></div>';
      foot.innerHTML = "";
      return;
    }

    body.innerHTML = cart.map(function (item, index) {
      var detail = customSummary(item);
      var edit = item.options && (item.options.sweetness || item.options.ice || item.options.extras.length || item.note) ? '<button class="cart-row__edit" type="button" data-edit-index="' + index + '">Edit</button>' : "";
      return '<div class="cart-row"><div class="cart-row__info"><div class="cart-row__name">' + escapeHtml(item.name) + '</div>' + (detail ? '<div class="cart-row__details">' + escapeHtml(detail) + '</div>' : '') + '<div class="cart-row__actions"><div class="qty-control" aria-label="Quantity for ' + escapeHtml(item.name) + '"><button type="button" data-cart-action="decrease" data-index="' + index + '" aria-label="Decrease quantity">&minus;</button><span>' + item.qty + '</span><button type="button" data-cart-action="increase" data-index="' + index + '" aria-label="Increase quantity">+</button></div>' + edit + '<button class="cart-row__remove" type="button" data-cart-action="remove" data-index="' + index + '">Remove</button></div></div><span class="cart-row__total">' + money(item.price * item.qty) + '</span></div>';
    }).join("");

    var subtotal = getSubtotal();
    foot.innerHTML = '<div class="cart-summary"><div class="summary-line"><span>Items</span><span>' + count + '</span></div><div class="summary-line"><span>Pickup</span><span>No extra fee</span></div><div class="summary-line summary-line--total"><span>Total</span><strong>' + money(subtotal) + '</strong></div></div><a class="btn btn--accent btn--block" id="cart-review" href="order.html">Review order <span class="btn__icon" aria-hidden="true">&#8594;</span></a><p class="cart-foot-note">Your order is confirmed by the café in Messenger.</p><button class="cart-clear" id="cart-clear" type="button">Clear order</button>';
    clearButton = document.getElementById("cart-clear");
    if (clearButton) clearButton.addEventListener("click", function () {
      if (window.confirm("Clear everything from your order?")) clearCart();
    });
  }

  function updateQuantity(index, delta) {
    if (!cart[index]) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    cart[index] && (cart[index].qty = Math.min(99, cart[index].qty));
    saveCart();
    notify();
  }
  function removeItem(index) {
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart();
    notify();
  }
  function clearCart() {
    cart = [];
    saveCart();
    notify();
  }

  function openDrawer() {
    if (!drawer || !getCount()) return;
    closeCustomizer();
    drawerPreviousFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.hidden = false;
    if (window.__ttkLockScroll) window.__ttkLockScroll(true);
    if (closeButton) closeButton.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (backdrop) backdrop.hidden = true;
    if (window.__ttkLockScroll) window.__ttkLockScroll(false);
    if (drawerPreviousFocus && typeof drawerPreviousFocus.focus === "function") drawerPreviousFocus.focus();
  }

  function extrasHtml(selected) {
    var picked = (selected || []).map(function (extra) { return extra.name; });
    var extras = [{ name: "Extra Pearl", price: 10 }, { name: "Nata de Coco", price: 10 }, { name: "Strawberry Puree", price: 15 }];
    return extras.map(function (extra, index) {
      var id = "extra-" + modalCounter + "-" + index;
      var checked = picked.indexOf(extra.name) !== -1 ? " checked" : "";
      return '<label class="check-row" for="' + id + '"><span class="check-row__copy"><input id="' + id + '" type="checkbox" name="extra" value="' + escapeHtml(extra.name) + '" data-price="' + extra.price + '"' + checked + '><span>' + escapeHtml(extra.name) + '</span></span><span class="check-row__price">+' + money(extra.price) + '</span></label>';
    }).join("");
  }
  function radioChoices(name, values, selected, prefix, showPrices) {
    return values.map(function (value, index) {
      var id = prefix + "-" + index;
      var selectedValue = typeof selected === "object" ? selected.value : selected;
      var checked = (selectedValue || values[0].value) === value.value ? " checked" : "";
      var price = showPrices && value.price ? '<span class="choice__meta">' + money(value.price) + '</span>' : "";
      return '<label class="choice" for="' + id + '"><span class="choice__name">' + escapeHtml(value.label) + '</span>' + price + '<input id="' + id + '" type="radio" name="' + name + '" value="' + escapeHtml(value.value) + '" data-price="' + (value.price || 0) + '"' + checked + '></label>';
    }).join("");
  }
  function openCustomizer(product, editIndex) {
    if (!modal || !modalPanel || !product) return;
    closeDrawer();
    modalCounter += 1;
    var editing = typeof editIndex === "number" && cart[editIndex];
    var current = editing ? cart[editIndex] : null;
    modalState = { product: product, editIndex: editing ? editIndex : null, quantity: current ? current.qty : 1 };
    modalPreviousFocus = document.activeElement;
    var selectedSize = current && current.size ? current.size : product.sizes[0].label;
    var selectedOptions = normalizeOptions(current && current.options);
    var sizeValues = product.sizes.map(function (size) { return { label: size.label === "Single" ? "Standard" : size.label, value: size.label, price: size.price }; });
    var sizeMarkup = product.sizes.length > 1 ? '<div class="choice-group"><span class="choice-group__label">Size <span class="field-help">required</span></span><div class="choice-grid">' + radioChoices("size", sizeValues, selectedSize, "size-" + modalCounter, true) + '</div></div>' : '<div class="choice-group"><span class="choice-group__label">Size</span><p class="order-note">Standard serving</p><input type="hidden" name="size" value="' + escapeHtml(product.sizes[0].label) + '"></div>';
    var drinkOptions = product.customizable ? '<div class="choice-group"><span class="choice-group__label">Sweetness</span><div class="choice-grid">' + radioChoices("sweetness", [{ label: "Regular", value: "Regular" }, { label: "Less", value: "Less" }, { label: "Extra", value: "Extra" }], selectedOptions.sweetness || "Regular", "sweetness-" + modalCounter, false) + '</div></div><div class="choice-group"><span class="choice-group__label">Ice level</span><div class="choice-grid">' + radioChoices("ice", [{ label: "Regular", value: "Regular" }, { label: "Less", value: "Less" }, { label: "No ice", value: "No" }], selectedOptions.ice || "Regular", "ice-" + modalCounter, false) + '</div></div><div class="choice-group"><span class="choice-group__label">Optional extras</span><div class="addon-options">' + extrasHtml(selectedOptions.extras) + '</div></div>' : "";
    modalPanel.innerHTML = '<header class="product-modal__header"><div><p class="product-modal__category">' + escapeHtml(product.category) + '</p><h2 id="product-modal-title">' + escapeHtml(product.name) + '</h2><p class="product-modal__description">' + escapeHtml(product.description || "Made fresh to order.") + '</p></div><button class="product-modal__close" type="button" data-modal-close aria-label="Close customizer">&times;</button></header><form class="product-modal__form" id="customizer-form">' + sizeMarkup + drinkOptions + '<div class="choice-group"><label class="choice-group__label" for="custom-note">Special instructions <span class="field-help">optional</span></label><textarea id="custom-note" name="note" maxlength="180" placeholder="Anything the café should know?">' + escapeHtml(current && current.note || "") + '</textarea></div><div class="modal-quantity"><span class="choice-group__label">Quantity</span><div class="qty-control"><button type="button" data-modal-quantity="decrease" aria-label="Decrease quantity">&minus;</button><span id="modal-quantity-value">' + modalState.quantity + '</span><button type="button" data-modal-quantity="increase" aria-label="Increase quantity">+</button></div></div><div class="product-modal__footer"><span class="modal-price" id="modal-price" aria-live="polite">' + money(product.sizes[0].price) + '</span><button class="btn btn--accent" type="submit">' + (editing ? "Save changes" : "Add to order") + ' <span class="btn__icon" aria-hidden="true">&#8594;</span></button></div></form>';
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (window.__ttkLockScroll) window.__ttkLockScroll(true);
    updateModalPrice();
    var close = modalPanel.querySelector("[data-modal-close]");
    if (close) close.focus();
  }

  function readRadio(form, name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : "";
  }
  function updateModalPrice() {
    if (!modalState || !modalPanel) return;
    var form = modalPanel.querySelector("form");
    if (!form) return;
    form.querySelectorAll(".choice").forEach(function (choice) {
      var input = choice.querySelector("input");
      choice.classList.toggle("is-selected", Boolean(input && input.checked));
    });
    var size = readRadio(form, "size") || (form.querySelector('input[name="size"]') || {}).value || modalState.product.sizes[0].label;
    var sizeData = modalState.product.sizes.find(function (option) { return option.label === size; }) || modalState.product.sizes[0];
    var extrasTotal = Array.prototype.slice.call(form.querySelectorAll('input[name="extra"]:checked')).reduce(function (sum, input) { return sum + Number(input.getAttribute("data-price") || 0); }, 0);
    var total = (sizeData.price + extrasTotal) * modalState.quantity;
    var price = document.getElementById("modal-price");
    if (price) price.textContent = money(total);
  }
  function closeCustomizer() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modalState = null;
    if (window.__ttkLockScroll) window.__ttkLockScroll(false);
    if (modalPreviousFocus && typeof modalPreviousFocus.focus === "function") modalPreviousFocus.focus();
  }
  function submitCustomizer(form) {
    if (!modalState) return;
    var product = modalState.product;
    var size = readRadio(form, "size") || (form.querySelector('input[name="size"]') || {}).value || product.sizes[0].label;
    var sizeData = product.sizes.find(function (option) { return option.label === size; }) || product.sizes[0];
    var extras = Array.prototype.slice.call(form.querySelectorAll('input[name="extra"]:checked')).map(function (input) { return { name: input.value, price: Number(input.getAttribute("data-price") || 0) }; });
    var extrasTotal = extras.reduce(function (sum, extra) { return sum + extra.price; }, 0);
    var wasEditing = modalState.editIndex !== null && cart[modalState.editIndex];
    var item = { name: product.name, size: size === "Single" ? "" : size, price: sizeData.price + extrasTotal, basePrice: sizeData.price, cat: product.category, qty: modalState.quantity, options: { sweetness: readRadio(form, "sweetness"), ice: readRadio(form, "ice"), extras: extras }, note: (form.querySelector('[name="note"]') || {}).value || "" };
    if (wasEditing) cart[modalState.editIndex] = normalizeItem(item);
    else cart.push(normalizeItem(item));
    saveCart();
    closeCustomizer();
    notify();
    showToast(wasEditing ? "Order updated" : product.name + " added", money(item.price * item.qty));
  }

  function buildMessengerLink(details, items) {
    var selected = items || cart;
    var info = details || {};
    var lines = ["Hi Tea-Ta Kopi! I'd like to order for pickup:"];
    if (info.name) lines.push("Name: " + info.name);
    if (info.phone) lines.push("Mobile: " + info.phone);
    if (info.pickup) lines.push("Pickup: " + info.pickup);
    if (info.payment) lines.push("Payment: " + info.payment);
    lines.push("");
    selected.forEach(function (item) {
      var label = item.name + (item.size ? " (" + item.size + ")" : "");
      var detailsText = customSummary(item);
      if (detailsText) label += " [" + detailsText + "]";
      lines.push("- " + item.qty + "x " + label + " - " + money(item.price * item.qty));
    });
    lines.push("Total: " + money(getSubtotal(selected)));
    if (info.note) lines.push("Note: " + info.note);
    lines.push("");
    lines.push("Please confirm availability and pickup timing. Thank you!");
    return "https://m.me/" + MESSENGER_ID + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  function showToast(title, subtitle) {
    var toast = document.getElementById("ttk-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "ttk-toast";
      toast.className = "ttk-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<span class="ttk-toast__title">' + escapeHtml(title) + '</span>' + (subtitle ? '<span class="ttk-toast__sub">' + escapeHtml(subtitle) + '</span>' : "");
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }
  function pulseFab() {
    if (!fab) return;
    fab.classList.remove("is-bumped");
    void fab.offsetWidth;
    fab.classList.add("is-bumped");
  }

  document.addEventListener("click", function (event) {
    var quick = event.target.closest(".quick-size, .add-btn, .size-btn");
    if (quick && !quick.disabled) { quickAdd(quick); return; }
    var action = event.target.closest("[data-cart-action]");
    if (action) {
      var index = parseInt(action.getAttribute("data-index"), 10);
      var type = action.getAttribute("data-cart-action");
      if (type === "increase") updateQuantity(index, 1);
      if (type === "decrease") updateQuantity(index, -1);
      if (type === "remove") removeItem(index);
      return;
    }
    var edit = event.target.closest("[data-edit-index]");
    if (edit) {
      var editIndex = parseInt(edit.getAttribute("data-edit-index"), 10);
      var product = window.TTKMenu && window.TTKMenu.items ? window.TTKMenu.items.find(function (item) { return item.name === cart[editIndex].name && item.category === cart[editIndex].cat; }) : null;
      if (product) openCustomizer(product, editIndex);
      return;
    }
    if (event.target.closest("[data-modal-close]")) { closeCustomizer(); return; }
    var quantity = event.target.closest("[data-modal-quantity]");
    if (quantity && modalState) {
      var delta = quantity.getAttribute("data-modal-quantity") === "increase" ? 1 : -1;
      modalState.quantity = Math.max(1, Math.min(99, modalState.quantity + delta));
      var display = document.getElementById("modal-quantity-value");
      if (display) display.textContent = modalState.quantity;
      updateModalPrice();
      return;
    }
    var orderButton = event.target.closest(".js-order");
    if (orderButton) {
      var href = orderButton.getAttribute("href") || "menu.html";
      if (getCount()) {
        event.preventDefault();
        openDrawer();
      } else if (href.indexOf("menu.html") !== -1) {
        /* Let the link go to the menu when there is no order to review. */
      }
    }
  });

  if (fab) fab.addEventListener("click", openDrawer);
  if (closeButton) closeButton.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  if (modal) {
    modal.addEventListener("submit", function (event) {
      if (event.target && event.target.id === "customizer-form") { event.preventDefault(); submitCustomizer(event.target); }
    });
    modal.addEventListener("change", updateModalPrice);
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (modal && modal.classList.contains("is-open")) closeCustomizer();
      else if (drawer && drawer.classList.contains("is-open")) closeDrawer();
    }
    var activePanel = modal && modal.classList.contains("is-open") ? modalPanel : (drawer && drawer.classList.contains("is-open") ? drawerPanel : null);
    if (event.key === "Tab" && activePanel) {
      var focusable = activePanel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener("storage", function (event) {
    if (event.key === STORE_KEY) { cart = loadCart(); notify(); }
  });

  window.TTKCart = {
    getItems: getItems,
    getCount: getCount,
    getSubtotal: getSubtotal,
    subscribe: function (callback) { if (typeof callback === "function") subscribers.push(callback); return function () { subscribers = subscribers.filter(function (item) { return item !== callback; }); }; },
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    openCustomizer: openCustomizer,
    addItem: addItem,
    clear: clearCart,
    buildMessengerLink: buildMessengerLink,
    money: money,
    showToast: showToast,
    storeKey: STORE_KEY,
    lastOrderKey: LAST_ORDER_KEY
  };

  renderCart();
})();
