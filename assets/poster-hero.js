// poster-hero.js
(() => {
  const section = document.getElementById("posterHero");
  if (!section) return;

  const title = section.querySelector(".poster-hero__title");
  const media = section.querySelector(".poster-hero__media");

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) {
    if (title) {
      title.style.opacity = 1;
      title.style.transform = "translateY(0)";
      title.style.filter = "blur(0)";
    }
    if (media) {
      media.style.opacity = 1;
      media.style.filter = "blur(0)";
    }
    return;
  }

  section.classList.add("is-scroll");

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  const smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  let ticking = false;
  let active = false;

  // Only animate when near view (performance)
  const io = new IntersectionObserver(
    (entries) => {
      active = !!entries[0]?.isIntersecting;
      if (active) update();
    },
    { rootMargin: "200px 0px", threshold: 0.01 }
  );
  io.observe(section);

  function update() {
    if (!active) {
      ticking = false;
      return;
    }

    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // progress 0..1 while passing through view
    const p = clamp01((vh - r.top) / (vh + r.height));

/* ------------------------
   IMAGE: moves up to its original spot (no blur/opacity)
   ------------------------ */

// start moving early, finish smoothly
const imgMove = smoothstep(0.10, 0.45, p);

// start lower -> end at 0 (original spot)
const imgStartY = 600;  // increase if you want it to come from further down
const imgY = lerp(imgStartY, 0, imgMove);

// optional: keep a tiny 3D settling effect (remove if you want only up/down)
const rx = lerp(10, 0, imgMove);
const ry = lerp(-8, 0, imgMove);
const s  = lerp(0.985, 1.0, imgMove);

if (media) {
  media.style.transform =
    `translateY(${imgY.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(3)})`;

  // make sure there is NO blur/opacity on image
  media.style.opacity = "1";
  media.style.filter = "none";
}

    /* ------------------------
       2) TITLE appears later,
          then rises UP as you scroll
       ------------------------ */

    // Title starts after image is already mostly visible
    const titleIn = smoothstep(0.10, 0.40, p); // this controls the "rising"
    const titleHold = smoothstep(0.55, 0.70, p); // optional hold window

    // Fade out near the bottom (when next section is coming)
    const titleOut = 1 - smoothstep(0.78, 0.98, p);

    // combined opacity: fade in -> hold -> fade out
    const titleOpacity = Math.min(1, titleIn + titleHold * 0.25) * titleOut;

    // Rise up from behind: start lower, end at 0
    const startY = 350;      // how much it's "behind" at start
    const endY = 0;         // final position (your current position)
    const y = lerp(startY, endY, titleIn);

    if (title) {
      title.style.opacity = titleOpacity.toFixed(3);
      title.style.transform = `translateY(${y.toFixed(2)}px)`;

      // Blur when barely visible = premium
      const blur = lerp(10, 0, titleOpacity);
      title.style.filter = `blur(${blur.toFixed(2)}px)`;

      title.style.visibility = titleOpacity < 0.02 ? "hidden" : "visible";
    }

    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function init() {
    active = true;
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  window.addEventListener("site:ready", init, { once: true });
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();



// --- Hero stats count up ---
(() => {
  const container = document.getElementById("heroStats");
  if (!container) return;

  const nums = Array.from(container.querySelectorAll(".stat__num"));

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const formatNumber = (value, decimals = 0) => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const animate = (el) => {
    if (el.dataset.counted === "true") return;
    el.dataset.counted = "true";

    const target = parseFloat(el.dataset.target || "0");
    const suffix = el.dataset.suffix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);

    if (prefersReduced) {
      el.textContent = `${formatNumber(target, decimals)}${suffix}`;
      return;
    }

    const duration = 3000; // ms
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (target - from) * eased;

      el.textContent = `${formatNumber(current, decimals)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const startAll = () => nums.forEach(animate);

  // start once visible
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) startAll();
    },
    { threshold: 0.35 }
  );

  io.observe(container);
})();
