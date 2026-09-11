/* Order review and Messenger handoff. No card details or false payment success are simulated. */
(function () {
  "use strict";
  var cartApi = window.TTKCart;
  var form = document.getElementById("checkout-form");
  var checkoutView = document.getElementById("checkout-view");
  var success = document.getElementById("order-success");
  if (!cartApi || !form || !checkoutView || !success) return;

  var itemsHost = document.getElementById("checkout-items");
  var totalsHost = document.getElementById("checkout-totals");
  var submit = document.getElementById("checkout-submit");
  var note = document.getElementById("order-note");
  var noteCount = document.getElementById("note-count");
  var stockError = document.getElementById("stock-error");
  var lastSnapshot = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function money(value) { return "P " + Number(value || 0); }
  function itemDetails(item) {
    var options = item.options || {};
    var details = [];
    if (item.size) details.push(item.size);
    var values = options.values || {};
    Object.keys(values).forEach(function (key) {
      var choice = values[key];
      var label = typeof choice === "string" ? choice : choice.label;
      details.push(label + (key === "sweetness" ? " sweetness" : key === "ice" ? " ice" : ""));
    });
    var addOns = options.addOns || options.extras || [];
    if (addOns.length) details.push(addOns.map(function (extra) { return extra.name || extra.label; }).join(", "));
    if (item.note) details.push("Note: " + item.note);
    return details.join(" · ");
  }

  function renderSummary(items) {
    if (!items.length) {
      itemsHost.innerHTML = '<p class="checkout-summary__empty">Your order is empty. Add something from the menu first.</p><a class="btn btn--quiet btn--block" href="menu.html">Browse the menu <span class="btn__icon" aria-hidden="true">&#8594;</span></a>';
      totalsHost.innerHTML = "";
      return;
    }
    itemsHost.innerHTML = items.map(function (item) {
      return '<div class="checkout-item"><div><div class="checkout-item__name">' + escapeHtml(item.qty + " x " + item.name) + '</div><div class="checkout-item__details">' + escapeHtml(itemDetails(item) || "Standard preparation") + '</div></div><span class="checkout-item__price">' + money(item.price * item.qty) + '</span></div>';
    }).join("");
    totalsHost.innerHTML = '<div class="cart-summary cart-summary--checkout"><div class="summary-line"><span>Items</span><span>' + cartApi.getCount(items) + '</span></div><div class="summary-line summary-line--total"><span>Total</span><strong>' + money(cartApi.getSubtotal(items)) + '</strong></div></div>';
  }

  function setFieldError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);
    if (field) {
      var wrapper = field.closest(".form-field") || field.closest(".check-row");
      if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }
    if (error) error.textContent = message || "";
  }

  function validate() {
    var valid = true;
    var name = document.getElementById("customer-name");
    var phone = document.getElementById("customer-phone");
    var pickup = document.getElementById("pickup-time");
    var confirm = document.getElementById("confirm-order");
    if (!name.value.trim()) { setFieldError("customer-name", "name-error", "Please add a name for the order."); valid = false; } else setFieldError("customer-name", "name-error", "");
    var digits = phone.value.replace(/[^0-9+]/g, "");
    if (phone.value.trim() && (digits.replace(/\D/g, "").length < 7 || digits.replace(/\D/g, "").length > 15)) { setFieldError("customer-phone", "phone-error", "Enter a valid mobile number or leave it blank."); valid = false; } else setFieldError("customer-phone", "phone-error", "");
    if (!pickup.value) { setFieldError("pickup-time", "pickup-error", "Choose a pickup timing so we know what to confirm."); valid = false; } else setFieldError("pickup-time", "pickup-error", "");
    if (!confirm.checked) { setFieldError("confirm-order", "confirm-error", "Please review the items and confirm before sending."); valid = false; } else setFieldError("confirm-order", "confirm-error", "");
    return valid;
  }

  function focusFirstError() {
    var invalid = form.querySelector('[aria-invalid="true"]');
    if (invalid) invalid.focus();
  }
  function syncAvailability(items) {
    var unavailable = cartApi.getUnavailableItems ? cartApi.getUnavailableItems(items) : [];
    if (!stockError) return unavailable;
    stockError.hidden = !unavailable.length;
    stockError.textContent = unavailable.length ? unavailable.map(function (item) { return item.name; }).join(", ") + (unavailable.length === 1 ? " is" : " are") + " currently unavailable. Remove " + (unavailable.length === 1 ? "it" : "them") + " from your order before sending." : "";
    return unavailable;
  }

  function createReference() {
    var random = Math.floor(Math.random() * 900 + 100);
    var stamp = String(Date.now()).slice(-4);
    return "TT-" + stamp + "-" + random;
  }

  function showSuccess(order, opened) {
    lastSnapshot = order;
    checkoutView.hidden = true;
    success.hidden = false;
    document.getElementById("order-reference").textContent = order.reference;
    document.getElementById("success-messenger").href = order.messengerLink;
    var title = document.getElementById("success-title");
    var copy = document.getElementById("success-copy");
    if (opened) {
      title.textContent = "Your order is ready to send";
      copy.textContent = "Messenger should have opened with the full order draft. Tap Send there, then wait for Tea-Ta Kopi to confirm availability and pickup timing.";
    } else {
      title.textContent = "Your order draft is saved";
      copy.textContent = "This order is waiting for you in Messenger. Send it when you are ready, then wait for Tea-Ta Kopi to confirm.";
    }
    var heading = success.querySelector("h1");
    if (heading) heading.focus();
    if (window.history && window.history.replaceState) window.history.replaceState(null, "", "order.html?status=last#order-status");
    else window.location.hash = "order-status";
  }

  function submitOrder(event) {
    event.preventDefault();
    var items = cartApi.getItems();
    if (!items.length) {
      window.location.href = "menu.html";
      return;
    }
    if (syncAvailability(items).length) return;
    if (!validate()) { focusFirstError(); return; }
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    var details = {
      name: document.getElementById("customer-name").value.trim(),
      phone: document.getElementById("customer-phone").value.trim(),
      pickup: document.getElementById("pickup-time").value,
      payment: document.getElementById("payment-method").value,
      note: document.getElementById("order-note").value.trim()
    };
    var order = {
      reference: createReference(),
      createdAt: new Date().toISOString(),
      status: "awaiting-confirmation",
      details: details,
      items: items,
      total: cartApi.getSubtotal(items),
      messengerLink: cartApi.buildMessengerLink(details, items)
    };
    try { localStorage.setItem(cartApi.lastOrderKey, JSON.stringify(order)); } catch (error) {}

    /* This is a user gesture, so opening now is less likely to be blocked. */
    var opened = false;
    if (navigator.onLine !== false) {
      var popup = window.open(order.messengerLink, "_blank", "noopener");
      opened = Boolean(popup);
    }
    cartApi.clear();
    showSuccess(order, opened);
    submit.disabled = false;
    submit.removeAttribute("aria-busy");
  }

  function restoreSavedOrder() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("status") !== "last") return;
    try {
      var saved = JSON.parse(localStorage.getItem(cartApi.lastOrderKey) || "null");
      if (saved && saved.messengerLink) showSuccess(saved, false);
    } catch (error) {}
  }

  form.addEventListener("submit", submitOrder);
  form.addEventListener("input", function (event) {
    if (event.target === note && noteCount) noteCount.textContent = note.value.length;
    if (event.target.getAttribute("aria-invalid") === "true") validate();
  });
  cartApi.subscribe(function (items) {
    if (!success.hidden) return;
    renderSummary(items);
    syncAvailability(items);
    if (!items.length) {
      checkoutView.innerHTML = '<div class="bezel"><div class="bezel__core catalog-empty"><strong>Your order is empty</strong><p>Add a drink or snack before coming back to review it.</p><a class="btn btn--accent" href="menu.html">Browse the menu <span class="btn__icon" aria-hidden="true">&#8594;</span></a></div></div>';
    }
  });
  var initialItems = cartApi.getItems();
  renderSummary(initialItems);
  syncAvailability(initialItems);
  if (!initialItems.length) {
    checkoutView.innerHTML = '<div class="bezel"><div class="bezel__core catalog-empty"><strong>Your order is empty</strong><p>Add a drink or snack before coming back to review it.</p><a class="btn btn--accent" href="menu.html">Browse the menu <span class="btn__icon" aria-hidden="true">&#8594;</span></a></div></div>';
  }
  restoreSavedOrder();
})();
