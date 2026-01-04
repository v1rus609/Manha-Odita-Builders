// home.js
(() => {
  let minLoaderDone = false;
  let pageLoaded = false;
  let revealed = false;

  const MIN_LOADER_MS = 850; // short, premium, not annoying

  const reveal = () => {
    if (revealed) return;
    if (!minLoaderDone || !pageLoaded) return;

    revealed = true;

    const loader = document.getElementById("loader");
    const navbar = document.getElementById("navbar");
    const page = document.getElementById("page");

    if (page) page.classList.add("show");
    if (navbar) navbar.classList.add("show");

    if (loader) {
      loader.classList.add("hide");
      loader.addEventListener("transitionend", () => loader.remove(), { once: true });
    }

    window.dispatchEvent(new Event("site:ready"));
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Minimum loader time (so it feels intentional)
    setTimeout(() => {
      minLoaderDone = true;
      reveal();
    }, MIN_LOADER_MS);

    const menuIcon = document.getElementById("menu-icon");
    const sideMenu = document.getElementById("side-menu");
    const overlay = document.getElementById("menu-overlay");
    const navLinks = Array.from(sideMenu.querySelectorAll("a"));

    // Active link (multi-page)
    const normalize = (path) => (path || "").split("/").pop().split("?")[0].split("#")[0].toLowerCase();
    const current = normalize(window.location.pathname) || "index.html";

    navLinks.forEach((a) => {
      const hrefFile = normalize(a.getAttribute("href"));
      const isHomeAlias =
        (current === "index.html" && (hrefFile === "index.html" || hrefFile === "home.html")) ||
        (current === "home.html" && (hrefFile === "index.html" || hrefFile === "home.html"));

      a.classList.toggle("active", hrefFile === current || isHomeAlias);
    });

    // Focus trap (premium accessibility)
    let lastFocus = null;

    const getFocusable = () =>
      Array.from(sideMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'))
        .filter((el) => !el.hasAttribute("disabled"));

    const STAGGER_START = 0.35;
    const STAGGER_STEP = 0.25;

    const openMenu = () => {
      lastFocus = document.activeElement;

      sideMenu.classList.add("open");
      overlay.classList.add("show");
      menuIcon.classList.add("active");
      menuIcon.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";

      sideMenu.querySelectorAll("li").forEach((li, i) => {
        li.style.transitionDelay = `${STAGGER_START + STAGGER_STEP * i}s`;
      });

      const focusables = getFocusable();
      if (focusables[0]) focusables[0].focus();
    };

    const closeMenu = () => {
      sideMenu.classList.remove("open");
      overlay.classList.remove("show");
      menuIcon.classList.remove("active");
      menuIcon.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";

      sideMenu.querySelectorAll("li").forEach((li) => (li.style.transitionDelay = "0s"));

      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    };

    const trapTab = (e) => {
      if (!sideMenu.classList.contains("open")) return;
      if (e.key !== "Tab") return;

      const focusables = getFocusable();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    menuIcon.addEventListener("click", () => {
      sideMenu.classList.contains("open") ? closeMenu() : openMenu();
    });

    overlay.addEventListener("click", closeMenu);
    navLinks.forEach((a) => a.addEventListener("click", closeMenu));

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
      trapTab(e);
    });
  });

  window.addEventListener(
    "load",
    () => {
      pageLoaded = true;
      reveal();
    },
    { once: true }
  );

  // Hard fallback
  setTimeout(() => {
    minLoaderDone = true;
    pageLoaded = true;
    reveal();
  }, 9000);
})();
