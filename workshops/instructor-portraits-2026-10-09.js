// The initial HTML uses still portraits, so it also works without JavaScript.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

for (const portrait of document.querySelectorAll("[data-instructor-wave]")) {
  const image = portrait.querySelector("img");

  function update() {
    image.src = motionPreference.matches
      ? image.dataset.stillSrc
      : image.dataset.waveSrc;
  }

  motionPreference.addEventListener("change", update);
  update();
}
