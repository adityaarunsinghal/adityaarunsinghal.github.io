// The initial HTML uses still portraits, so it also works without JavaScript.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

for (const portrait of document.querySelectorAll("[data-instructor-wave]")) {
  const image = portrait.querySelector("img");
  const button = portrait.querySelector("[data-wave-toggle]");
  let manualPlaying = null;

  function update() {
    const playing = manualPlaying ?? !motionPreference.matches;
    image.src = playing ? image.dataset.waveSrc : image.dataset.stillSrc;
    button.textContent = playing ? "Pause wave" : "Play wave";
    button.setAttribute(
      "aria-label",
      `${playing ? "Pause" : "Play"} ${portrait.dataset.instructorName}'s wave`,
    );
  }

  button.addEventListener("click", () => {
    manualPlaying = !(manualPlaying ?? !motionPreference.matches);
    update();
  });
  motionPreference.addEventListener("change", () => {
    manualPlaying = null;
    update();
  });
  button.hidden = false;
  update();
}
