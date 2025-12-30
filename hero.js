// hero.js
(() => {
  const hero = document.querySelector(".hero");
  const video = document.getElementById("heroVideo");

  if (!hero) return;

  const makeReady = () => {
    if (hero.classList.contains("is-ready")) return;
    hero.classList.add("is-ready");
  };

  const loadAndPlayVideo = () => {
    if (!video) {
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

    // fallback so text never stays hidden
    setTimeout(makeReady, 2000);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => makeReady());
    }
  };

  // Wait for loader to finish
  window.addEventListener("site:ready", loadAndPlayVideo, { once: true });
})();
