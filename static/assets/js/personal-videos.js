// Load YouTube's current player only after a viewer chooses to watch.
// https://developers.google.com/youtube/player_parameters
// Ordinary links remain usable with JavaScript disabled or a modified click.
for (const link of document.querySelectorAll("[data-youtube-id]")) {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey) return;

    const videoId = link.dataset.youtubeId;
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;
    event.preventDefault();

    const url = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("rel", "0");
    url.searchParams.set("origin", window.location.origin);
    if (link.dataset.playlist) {
      url.searchParams.set("listType", "playlist");
      url.searchParams.set("list", link.dataset.playlist);
    }

    const player = document.createElement("iframe");
    player.title = link.dataset.playerTitle;
    player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    player.allowFullscreen = true;
    player.referrerPolicy = "strict-origin-when-cross-origin";
    player.src = url.href;

    const container = link.closest(".video-container");
    container.classList.add("is-playing");
    container.replaceChildren(player);
    player.focus();
    document.dispatchEvent(new CustomEvent("site:video-open", { detail: { videoId } }));
  });
}
