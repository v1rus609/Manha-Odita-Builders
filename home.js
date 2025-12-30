// home.js
(() => {
  let loaderFinished = false;
  let pageLoaded = false;
  let revealed = false;

  const reveal = () => {
    if (revealed) return;
    if (!loaderFinished || !pageLoaded) return;

    revealed = true;

    const loader = document.getElementById("loader");
    const navbar = document.getElementById("navbar");
    const page = document.getElementById("page");

    if (loader) loader.style.display = "none";
    if (page) page.style.display = "block";
    if (navbar) navbar.classList.add("show");

    // Tell section scripts (hero.js etc.) that the site is ready
    window.dispatchEvent(new Event("site:ready"));
  };

  // Setup menu + active link as soon as DOM exists
  document.addEventListener("DOMContentLoaded", () => {
    const menuIcon = document.getElementById("menu-icon");
    const sideMenu = document.getElementById("side-menu");
    const overlay = document.getElementById("menu-overlay");
    const navLinks = Array.from(sideMenu.querySelectorAll("a"));

    // Active link (multi-page)
    const normalize = (path) => {
      if (!path) return "";
      return path.split("/").pop().split("?")[0].split("#")[0].toLowerCase();
    };

    const getCurrentFile = () => {
      const file = normalize(window.location.pathname);
      return file === "" ? "index.html" : file;
    };

    const setActiveByCurrentPage = () => {
      const current = getCurrentFile();

      navLinks.forEach((a) => {
        const hrefFile = normalize(a.getAttribute("href"));
        const isHomeAlias =
          (current === "index.html" && (hrefFile === "index.html" || hrefFile === "home.html")) ||
          (current === "home.html" && (hrefFile === "index.html" || hrefFile === "home.html"));

        a.classList.toggle("active", hrefFile === current || isHomeAlias);
      });
    };

    setActiveByCurrentPage();

    // Menu open/close
    const STAGGER_START = 0.35; // tweak this
    const STAGGER_STEP  = 0.12; // tweak this

    const openMenu = () => {
      sideMenu.classList.add("open");
      overlay.classList.add("show");
      menuIcon.classList.add("active");
      menuIcon.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";

      sideMenu.querySelectorAll("li").forEach((li, i) => {
        li.style.transitionDelay = `${STAGGER_START + STAGGER_STEP * i}s`;
      });
    };

    const closeMenu = () => {
      sideMenu.classList.remove("open");
      overlay.classList.remove("show");
      menuIcon.classList.remove("active");
      menuIcon.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";

      sideMenu.querySelectorAll("li").forEach((li) => {
        li.style.transitionDelay = "0s";
      });
    };

    menuIcon.addEventListener("click", () => {
      sideMenu.classList.contains("open") ? closeMenu() : openMenu();
    });

    overlay.addEventListener("click", closeMenu);
    navLinks.forEach((a) => a.addEventListener("click", closeMenu));

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Loader animation watcher (attach early)
    const loader = document.getElementById("loader");
    if (loader) {
      loader.addEventListener("animationend", () => {
        loaderFinished = true;
        reveal();
      }, { once: true });

      // fallback if animationend is missed
      setTimeout(() => {
        loaderFinished = true;
        reveal();
      }, 5200);
    } else {
      loaderFinished = true;
      reveal();
    }
  });

  // Window fully loaded
  window.addEventListener("load", () => {
    pageLoaded = true;
    reveal();
  }, { once: true });

  // Hard fallback (never get stuck)
  setTimeout(() => {
    loaderFinished = true;
    pageLoaded = true;
    reveal();
  }, 9000);
})();
