// meeting.js
(() => {
  const section = document.getElementById("meeting");
  const form = document.getElementById("meetingForm");
  const btn = document.getElementById("meetingBtn");
  const status = document.getElementById("meetingStatus");
  if (!section || !form) return;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // Reversible reveal
  const io = new IntersectionObserver(
    (entries) => {
      section.classList.toggle("is-inview", entries[0]?.isIntersecting);
    },
    { threshold: 0.22, rootMargin: "0px 0px -10% 0px" }
  );
  io.observe(section);

  // -------- EmailJS setup --------
  // Replace these 3 values from your EmailJS dashboard
  const EMAILJS_PUBLIC_KEY = "mzWKWI7R4LvLJF_9g";
  const EMAILJS_SERVICE_ID = "service_663np98";
  const EMAILJS_TEMPLATE_ID = "template_vszddpe";

  // Init once (recommended)
  // You can also enable anti-abuse options here
  if (window.emailjs) {
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY,
      blockHeadless: true,
      limitRate: { id: "meeting", throttle: 10000 }, // 1 request per 10s
    });
  }

  const setStatus = (msg, ok = true) => {
    if (!status) return;
    status.textContent = msg;
    status.style.color = ok ? "rgba(0,0,0,0.72)" : "#b42318";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot check
    const hp = form.querySelector('input[name="website"]');
    if (hp && hp.value.trim() !== "") return;

    if (!window.emailjs) {
      setStatus("Email service not loaded. Please try again.", false);
      return;
    }

    btn.disabled = true;
    const old = btn.textContent;
    btn.textContent = "Sending...";

    try {
      // sendForm auto-collects fields by their "name" attributes
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
      setStatus("Thanks! We’ll contact you shortly.");
      form.reset();
    } catch (err) {
      setStatus("Something went wrong. Please try again.", false);
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  });
})();


// --- Sun rise on scroll (reversible) ---
(() => {
  const section = document.getElementById("meeting");
  if (!section) return;

  const sun = section.querySelector(".meeting__sun");
  if (!sun) return;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced) {
    sun.style.transform = "translateX(-50%) translateY(-10px)";
    return;
  }

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  let raf = 0;
  let active = false;

  const updateSun = () => {
    raf = 0;
    if (!active) return;

    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // progress 0..1 as you scroll DOWN through the section
    const p = clamp01((vh - r.top) / (vh + r.height));

    // We want: scroll UP => sun rises.
    // Since scrolling up decreases p, we use (1 - p).
    const t = smoothstep(0.15, 0.75, 1 - p);

    const hiddenY = -350; // starts behind (lower)
    const shownY  = 75; // final "visible" position
    const y = lerp(hiddenY, shownY, t);

    // Optional tiny scale for life (remove if you want pure Y move)
    const s = lerp(0.96, 1.02, t);

    sun.style.transform = `translateX(-50%) translateY(${y.toFixed(2)}px) scale(${s.toFixed(3)})`;
  };

  const requestTick = () => {
    if (raf) return;
    raf = requestAnimationFrame(updateSun);
  };

  // Activate only when near view (performance)
  const io = new IntersectionObserver(
    (entries) => {
      active = !!entries[0]?.isIntersecting;
      if (active) requestTick();
    },
    { rootMargin: "200px 0px", threshold: 0.01 }
  );
  io.observe(section);

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);

  // initial
  requestTick();
})();
