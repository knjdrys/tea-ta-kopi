/* Tea-Ta Kopi shared behavior: theme, navigation, reveal, and connectivity notice. */
(function () {
  "use strict";

  var root = document.documentElement;
  var storageKey = "ttk-theme";
  var saved = null;
  try { saved = localStorage.getItem(storageKey); } catch (error) {}
  var preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(saved === "dark" || saved === "light" ? saved : preferred);

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    var toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    var dark = theme === "dark";
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    toggle.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
    var icon = toggle.querySelector(".theme-icon");
    if (icon) {
      icon.innerHTML = dark
        ? '<path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z"/>'
        : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>';
    }
  }

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
      try { localStorage.setItem(storageKey, next); } catch (error) {}
    });
  }

  /* Mobile navigation uses real aria state and restores focus on close. */
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  var lastNavFocus = null;
  function closeNav() {
    if (!mobileNav || !navToggle) return;
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    document.body.style.overflow = "";
    if (lastNavFocus && typeof lastNavFocus.focus === "function") lastNavFocus.focus();
  }
  function openNav() {
    if (!mobileNav || !navToggle) return;
    lastNavFocus = document.activeElement;
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation");
    document.body.style.overflow = "hidden";
    var first = mobileNav.querySelector("a");
    if (first) first.focus();
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      if (mobileNav.classList.contains("is-open")) closeNav(); else openNav();
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeNav(); });
    });
    document.addEventListener("keydown", function (event) {
      if (!mobileNav.classList.contains("is-open")) return;
      if (event.key === "Escape") { closeNav(); return; }
      if (event.key === "Tab") {
        var focusable = mobileNav.querySelectorAll('a[href], button:not([disabled])');
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  /* Content is visible even when an observer is unavailable or slow. */
  var reveals = document.querySelectorAll("[data-reveal]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (element) { element.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    reveals.forEach(function (element) { observer.observe(element); });
    window.setTimeout(function () { reveals.forEach(function (element) { element.classList.add("is-visible"); }); }, 1400);
  }

  /* An honest offline cue is more useful than letting a customer wonder if an order sent. */
  function syncOnlineState() {
    var existing = document.getElementById("network-notice");
    if (!navigator.onLine) {
      if (!existing) {
        existing = document.createElement("div");
        existing.id = "network-notice";
        existing.className = "network-notice";
        existing.setAttribute("role", "status");
        existing.textContent = "You are offline. Your cart is saved, but Messenger needs a connection to send the order.";
        document.body.insertBefore(existing, document.body.firstChild);
      }
    } else if (existing) {
      existing.remove();
    }
  }
  window.addEventListener("online", syncOnlineState);
  window.addEventListener("offline", syncOnlineState);
  syncOnlineState();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function () {
        /* The app remains usable online if a browser blocks service workers. */
      });
    });
  }

  window.__ttkLockScroll = function (locked) {
    document.body.style.overflow = locked ? "hidden" : "";
  };
})();
