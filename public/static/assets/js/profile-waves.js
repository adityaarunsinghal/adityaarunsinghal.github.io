// A shared animation preserves the supplied portraits' synchronized timing.
// Still portraits are the baseline for disabled JavaScript or reduced motion.
(() => {
  const pair = document.querySelector("[data-wave-pair]");
  if (!pair) return;

  const image = pair.querySelector("img");
  const toggle = pair.querySelector("button");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let playing = !motion.matches;

  function update() {
    image.src = playing ? image.dataset.waveSrc : image.dataset.stillSrc;
    toggle.textContent = playing ? "Pause waving" : "Play waving";
  }

  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    playing = !playing;
    update();
  });
  motion.addEventListener("change", () => {
    playing = !motion.matches;
    update();
  });
  image.addEventListener("error", () => {
    if (!playing) return;
    playing = false;
    update();
  });
  update();
})();
