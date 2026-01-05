// poster-hero.js (smooth + not laggy)
(() => {
  const section = document.getElementById("posterHero");
  if (!section) return;

  const title = section.querySelector(".poster-hero__title");
  const media = section.querySelector(".poster-hero__media");

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) return;

  section.classList.add("is-scroll");

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  let active = false;
  let raf = 0;

  // tiny rounding without toFixed spam
  const r2 = (n) => Math.round(n * 100) / 100;
  const r3 = (n) => Math.round(n * 1000) / 1000;

  const update = () => {
    raf = 0;
    if (!active) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // if it's far away, skip (extra safety)
    if (rect.bottom < -250 || rect.top > vh + 250) return;

    const p = clamp01((vh - rect.top) / (vh + rect.height));

    /* ------------------------
       IMAGE: rise to original spot (no opacity/blur)
       ------------------------ */
    const imgMove = smoothstep(0.10, 0.45, p);

    const imgStartY = 600; // you set this - keep if you like the effect
    const imgY = lerp(imgStartY, 0, imgMove);

    const rx = lerp(10, 0, imgMove);
    const ry = lerp(-8, 0, imgMove);
    const s  = lerp(0.985, 1.0, imgMove);

    if (media) {
      media.style.transform =
        `translate3d(0, ${r2(imgY)}px, 0) rotateX(${r2(rx)}deg) rotateY(${r2(ry)}deg) scale(${r3(s)})`;
      media.style.opacity = "1";
      media.style.filter = "none";
    }

    /* ------------------------
       TITLE: appear later, rise up, fade out later
       ------------------------ */
    const titleIn = smoothstep(0.10, 0.40, p);
    const titleHold = smoothstep(0.55, 0.70, p);
    const titleOut = 1 - smoothstep(0.78, 0.98, p);

    const titleOpacity = Math.min(1, titleIn + titleHold * 0.25) * titleOut;

    const startY = 350;
    const y = lerp(startY, 0, titleIn);

    if (title) {
      title.style.opacity = r3(titleOpacity);
      title.style.transform = `translate3d(0, ${r2(y)}px, 0)`;
      title.style.visibility = titleOpacity < 0.02 ? "hidden" : "visible";

      // ✅ blur OFF (fastest)
      title.style.filter = "none";

      // If you REALLY want a tiny blur only at the start (still ok):
      // const blurT = smoothstep(0.10, 0.18, p);
      // title.style.filter = `blur(${r2(lerp(10, 0, blurT))}px)`;
    }
  };

  const requestUpdate = () => {
    if (!active) return;
    if (raf) return;
    raf = requestAnimationFrame(update);
  };

  // Activate only when near viewport
  const io = new IntersectionObserver(
    (entries) => {
      active = !!entries[0]?.isIntersecting;
      if (active) requestUpdate();
    },
    { rootMargin: "250px 0px", threshold: 0.01 }
  );
  io.observe(section);

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
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
