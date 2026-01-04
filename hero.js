// hero.js
(() => {
  const hero = document.querySelector(".hero");
  const video = document.getElementById("heroVideo");
  if (!hero) return;

  const makeReady = () => {
    if (!hero.classList.contains("is-ready")) hero.classList.add("is-ready");
  };

  const shouldSkipVideo = () => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const saveData = navigator.connection?.saveData === true;
    const slowNet = ["slow-2g", "2g"].includes(navigator.connection?.effectiveType);
    return !!(reduceMotion || saveData || slowNet);
  };

  const loadAndPlayVideo = () => {
    if (!video || shouldSkipVideo()) {
      makeReady();
      return;
    }

    const source = video.querySelector("source[data-src]");
    if (source && !source.src) {
      source.src = source.dataset.src;
      video.load();
    }

    const onReady = () => makeReady();

    video.addEventListener("loadeddata", onReady, { once: true });
    video.addEventListener("canplay", onReady, { once: true });
    video.addEventListener("error", makeReady, { once: true });

    setTimeout(makeReady, 2000);

    const playPromise = video.play();
    if (playPromise?.catch) playPromise.catch(() => makeReady());

    // Pause/resume when offscreen (performance polish)
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries[0]?.isIntersecting;
          if (!visible) {
            video.pause();
          } else {
            const p = video.play();
            if (p?.catch) p.catch(() => {});
          }
        },
        { threshold: 0.25 }
      );
      io.observe(hero);
    }
  };

  window.addEventListener("site:ready", loadAndPlayVideo, { once: true });
})();
