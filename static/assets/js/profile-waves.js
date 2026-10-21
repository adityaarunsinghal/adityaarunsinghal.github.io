// A shared animation preserves the supplied portraits' synchronized timing.
// Still portraits are the baseline for disabled JavaScript or reduced motion.
(() => {
  const pair = document.querySelector("[data-wave-pair]");
  if (!pair) return;

  const image = pair.querySelector("img");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animationFailed = false;

  function update() {
    image.src = motion.matches || animationFailed
      ? image.dataset.stillSrc
      : image.dataset.waveSrc;
  }

  motion.addEventListener("change", update);
  image.addEventListener("error", () => {
    if (animationFailed) return;
    animationFailed = true;
    update();
  });
  update();
})();
