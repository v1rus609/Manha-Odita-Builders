// projects.js (vanilla slider controls + dots)
(() => {
  const track = document.getElementById("projectsTrack");
  const dotsWrap = document.getElementById("projectsDots");
  const prev = document.getElementById("projPrev");
  const next = document.getElementById("projNext");
  if (!track || !dotsWrap || !prev || !next) return;

  const cards = Array.from(track.querySelectorAll(".projectCard"));

  // Make dots
  const dots = cards.map((_, i) => {
    const b = document.createElement("button");
    b.className = "dot";
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => scrollToIndex(i));
    dotsWrap.appendChild(b);
    return b;
  });

  const getStep = () => {
    const first = cards[0];
    if (!first) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const scrollToIndex = (i) => {
    const step = getStep();
    track.scrollTo({ left: step * i, behavior: "smooth" });
  };

  prev.addEventListener("click", () => {
    const step = getStep();
    track.scrollBy({ left: -step, behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    const step = getStep();
    track.scrollBy({ left: step, behavior: "smooth" });
  });

  // Active dot on scroll
  let raf = 0;
  const updateActive = () => {
    raf = 0;
    const step = getStep();
    if (!step) return;
    const idx = Math.round(track.scrollLeft / step);
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(updateActive);
  };

  track.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateActive);

  // Init
  updateActive();
})();

// Projects reveal on scroll (REVERSES when scrolling up)
(() => {
  const section = document.getElementById("projects");
  if (!section) return;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const cards = Array.from(section.querySelectorAll(".projectCard"));
  cards.forEach((card, i) => card.style.setProperty("--i", i));

  if (reduce) {
    section.classList.add("is-inview");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      section.classList.toggle("is-inview", entry.isIntersecting);
    },
    {
      threshold: 0.25,
      // helps prevent flicker near edges (tune if needed)
      rootMargin: "0px 0px -10% 0px",
    }
  );

  io.observe(section);
})();
