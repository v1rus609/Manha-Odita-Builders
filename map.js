// map.js
(() => {
  const section = document.getElementById("locations");
  const frame = document.getElementById("mapFrame");
  const openBtn = document.getElementById("mapOpen");
  if (!section || !frame || !openBtn) return;

  const items = Array.from(section.querySelectorAll(".mapItem"));
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const setActive = (btn) => {
    items.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });

    const embed = btn.dataset.embed;
    const open = btn.dataset.open;

    if (embed) frame.src = embed;
    openBtn.href = open || "#";
  };

  // Default: first item
  const first = items[0];
  if (first) openBtn.href = first.dataset.open || "#";

  // Click handlers
  items.forEach((btn) => btn.addEventListener("click", () => setActive(btn)));

  // Reveal + lazy-load map when section enters view (reversible reveal)
  const io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const inView = entry.isIntersecting;

      if (!reduce) section.classList.toggle("is-inview", inView);
      else section.classList.add("is-inview");

      // lazy load map only once
      if (inView && !frame.src && first) setActive(first);
    },
    { threshold: 0.20, rootMargin: "0px 0px -10% 0px" }
  );

  io.observe(section);
})();
