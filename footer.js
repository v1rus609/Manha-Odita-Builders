// footer.js
(() => {
  const footer = document.getElementById("siteFooter");
  if (!footer) return;

  // year
  const y = document.getElementById("footerYear");
  if (y) y.textContent = new Date().getFullYear();

  // reversible in-view animation
  const io = new IntersectionObserver(
    (entries) => {
      footer.classList.toggle("is-inview", !!entries[0]?.isIntersecting);
    },
    { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
  );
  io.observe(footer);
})();
