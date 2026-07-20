document.addEventListener("DOMContentLoaded", () => {
  const aboutSection = document.getElementById("about");

  if (!aboutSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          // Unobserve after triggering if you want the animation to run only once
          // observer.unobserve(entry.target); 
        }
      });
    },
    {
      threshold: 0.15, // Triggers when 15% of the section is visible
    }
  );

  observer.observe(aboutSection);
});