/* Menu catalog: filtering, search, quick add, and product customizer entry points. */
(function () {
  "use strict";

  var source = window.TTKMenu;
  var catalog = document.getElementById("menu-catalog");
  var filters = document.getElementById("menu-filters");
  var search = document.getElementById("menu-search");
  var status = document.getElementById("menu-status");
  if (!source || !catalog || !filters) return;

  var activeCategory = "all";
  var query = "";

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function money(amount) { return "P " + amount; }
  function lowestPrice(item) {
    return item.sizes.reduce(function (lowest, size) { return Math.min(lowest, size.price); }, Infinity);
  }
  function categoryProducts(categoryName) {
    return source.items.filter(function (item) {
      if (item.category !== categoryName) return false;
      if (!query) return true;
      var text = [item.name, item.category, item.description].join(" ").toLowerCase();
      return text.indexOf(query) !== -1;
    });
  }

  function renderFilters() {
    var html = '<button class="filter-pill is-active" type="button" data-filter="all" aria-pressed="true">All menu</button>';
    source.categories.forEach(function (category) {
      html += '<button class="filter-pill" type="button" data-filter="' + escapeHtml(category.name) + '" aria-pressed="false">' + escapeHtml(category.name) + '</button>';
    });
    filters.innerHTML = html;
    filters.querySelectorAll(".filter-pill").forEach(function (button) {
      var on = (button.getAttribute("data-filter") || "all") === activeCategory;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function renderProduct(item) {
    var unavailable = item.available === false;
    var from = lowestPrice(item);
    var priceLabel = item.sizes.length > 1 ? "from " + money(from) : money(from);
    var badge = item.bestSeller ? '<span class="best-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.2 6.6H21l-5.3 4 2 6.4-6-4.4-6 4.4z"/></svg> Favorite</span>' : "";
    var sizes = "";
    item.sizes.forEach(function (size) {
      var quickClass = item.category === "Food" || item.category === "Add Ons" ? "add-btn" : "size-btn";
      var label = item.sizes.length === 1 && size.label === "Single" ? "+ Add" : size.label + " · " + money(size.price);
      sizes += '<button class="quick-size ' + quickClass + '" type="button" data-product-id="' + escapeHtml(item.id) + '" data-name="' + escapeHtml(item.name) + '" data-size="' + escapeHtml(size.label === "Single" ? "" : size.label) + '" data-price="' + size.price + '" data-cat="' + escapeHtml(item.category) + '"' + (unavailable ? " disabled" : "") + '>' + escapeHtml(label) + '</button>';
    });
    var customize = item.customizable && !unavailable ? '<button class="btn btn--ghost btn--small btn--customize" type="button" data-customize-id="' + escapeHtml(item.id) + '">Customize</button>' : "";
    var unavailableText = unavailable ? '<span class="product-card__availability">Currently unavailable</span>' : "";
    return '<article class="product-card' + (unavailable ? ' is-unavailable' : '') + '" data-product-id="' + escapeHtml(item.id) + '" data-product-category="' + escapeHtml(item.category) + '">' +
      '<div class="product-card__top"><h3 class="product-card__name">' + escapeHtml(item.name) + '</h3>' + badge + '</div>' +
      '<p class="product-card__description">' + escapeHtml(item.description) + '</p>' +
      '<div class="product-card__meta"><span>' + escapeHtml(item.category) + '</span><span class="price">' + escapeHtml(priceLabel) + '</span></div>' +
      (unavailableText || ('<div class="product-card__actions">' + sizes + customize + '</div>')) +
      '</article>';
  }

  function renderCatalog() {
    var html = "";
    var totalMatches = 0;
    source.categories.forEach(function (category) {
      if (activeCategory !== "all" && activeCategory !== category.name) return;
      var items = categoryProducts(category.name);
      if (!items.length) return;
      totalMatches += items.length;
      html += '<section class="category" id="category-' + escapeHtml(category.id) + '" data-category="' + escapeHtml(category.name) + '" aria-labelledby="heading-' + escapeHtml(category.id) + '">' +
        '<div class="category__header"><div><p class="eyebrow">' + (items.length === 1 ? "1 item" : items.length + " items") + '</p><h2 id="heading-' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + '</h2></div><p>' + escapeHtml(category.note) + '</p></div>' +
        '<div class="product-grid">' + items.map(renderProduct).join("") + '</div></section>';
    });
    if (!totalMatches) {
      html = '<div class="catalog-empty"><strong>No menu items found</strong><p>Try another search or browse all categories.</p><button class="btn btn--quiet btn--small" type="button" data-clear-search>Show the full menu</button></div>';
    }
    catalog.innerHTML = html;
    if (status) status.textContent = totalMatches ? totalMatches + (totalMatches === 1 ? " menu item" : " menu items") + " shown" : "No menu items found";
  }

  function setupRepeatOrder() {
    var box = document.getElementById("repeat-order");
    var button = document.getElementById("repeat-order-button");
    if (!box || !button || !window.TTKCart) return;
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(window.TTKCart.lastOrderKey) || "null"); } catch (error) {}
    var previousItems = saved && Array.isArray(saved.items) ? saved.items : [];
    function sync() {
      box.hidden = !previousItems.length || window.TTKCart.getCount() > 0;
    }
    button.addEventListener("click", function () {
      previousItems.forEach(function (item) { window.TTKCart.addItem(item); });
      sync();
    });
    window.TTKCart.subscribe(sync);
    sync();
  }

  function render() {
    renderFilters();
    renderCatalog();
  }

  filters.addEventListener("click", function (event) {
    var button = event.target.closest(".filter-pill");
    if (!button) return;
    activeCategory = button.getAttribute("data-filter") || "all";
    render();
    var first = catalog.querySelector(".category");
    if (first && activeCategory !== "all" && first.scrollIntoView) first.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  if (search) {
    search.addEventListener("input", function () {
      query = search.value.trim().toLowerCase();
      renderCatalog();
    });
  }

  catalog.addEventListener("click", function (event) {
    var customize = event.target.closest("[data-customize-id]");
    if (customize && window.TTKCart) {
      var product = source.items.find(function (item) { return item.id === customize.getAttribute("data-customize-id"); });
      if (product) window.TTKCart.openCustomizer(product);
      return;
    }
    var clear = event.target.closest("[data-clear-search]");
    if (clear) {
      activeCategory = "all";
      query = "";
      if (search) search.value = "";
      render();
    }
  });

  function openFromUrl() {
    var id = new URLSearchParams(window.location.search).get("item");
    if (!id) return;
    var product = source.items.find(function (item) { return item.id === id; });
    if (!product) return;
    var card = null;
    catalog.querySelectorAll(".product-card").forEach(function (candidate) {
      if (candidate.getAttribute("data-product-id") === product.id) card = candidate;
    });
    if (card) {
      if (card.scrollIntoView) card.scrollIntoView({ block: "center", behavior: "smooth" });
      card.classList.add("is-highlighted");
      setTimeout(function () { card.classList.remove("is-highlighted"); }, 1800);
      if (window.TTKCart) setTimeout(function () { window.TTKCart.openCustomizer(product); }, 260);
    }
  }

  render();
  setupRepeatOrder();
  setTimeout(openFromUrl, 80);
})();
