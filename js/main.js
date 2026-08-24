/* Tea-Ta Kopi - behavior (vanilla, no deps)
   - theme toggle (saved > prefers-color-scheme), persisted
   - mobile nav (hamburger morph handled in CSS via aria-expanded)
   - scroll reveal via IntersectionObserver (NEVER window scroll listener)
   - reduced-motion: reveal instantly
*/
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---- Theme ---- */
  var saved = null;
  try { saved = localStorage.getItem("ttk-theme"); } catch (e) {}
  if (!saved) {
    saved = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  root.setAttribute("data-theme", saved);

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("ttk-theme", next); } catch (e) {}
    });
  }

  /* ---- Mobile nav ---- */
  var navToggle = document.getElementById("nav-toggle");
  var overlay = document.getElementById("nav-overlay");
  if (navToggle && overlay) {
    navToggle.addEventListener("click", function () {
      var open = overlay.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close overlay when a link is tapped
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        overlay.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
    // Tap the dimmed backdrop (the overlay surface itself) to close
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        overlay.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* ---- Scroll reveal (IntersectionObserver) ---- */
  var reveals = document.querySelectorAll("[data-reveal]");
  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Safety net: if JS/observer is slow, never leave content stuck invisible.
  setTimeout(function () {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }, 1200);

  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Body scroll lock (used by cart drawer) ---- */
  window.__ttkLockScroll = function (on) {
    document.body.style.overflow = on ? "hidden" : "";
  };

  /* ---- Menu category filter (menu.html only) ---- */
  var filterBar = document.querySelector(".menu-filters");
  if (filterBar) {
    var pills = filterBar.querySelectorAll(".filter-pill");
    var cats = document.querySelectorAll(".cat[data-category]");
    filterBar.addEventListener("click", function (e) {
      var pill = e.target.closest(".filter-pill");
      if (!pill) return;
      pills.forEach(function (p) {
        var on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var filter = pill.getAttribute("data-filter");
      cats.forEach(function (cat) {
        var match = filter === "all" || cat.getAttribute("data-category") === filter;
        cat.style.display = match ? "" : "none";
        if (match) cat.classList.add("in"); // reveal even if not yet scrolled into view
      });
    });
  }

  /* ---- PWA service worker (offline + installable) ---- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function (e) {
        /* registration failures are non-fatal; site still works online */
      });
    });
  }
})();
