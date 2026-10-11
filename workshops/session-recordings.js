{
  let apiPromise;
  const players = new Set();

  function loadPlayerAPI() {
    if (window.YT?.Player) return Promise.resolve();
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      const timeout = setTimeout(() => reject(new Error("Player API unavailable")), 12000);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout);
        try {
          if (typeof previousReady === "function") previousReady();
        } finally {
          resolve();
        }
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error("Player API unavailable"));
      });
      document.head.append(script);
    });
    return apiPromise;
  }

  function formatTime(seconds) {
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainder = String(total % 60).padStart(2, "0");
    return hours
      ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}`
      : `${String(minutes).padStart(2, "0")}:${remainder}`;
  }

  for (const recording of document.querySelectorAll("[data-session-recording]")) {
    const frame = recording.querySelector("iframe");
    const youtube = recording.querySelector("[data-recording-youtube]");
    const share = recording.querySelector("[data-recording-share]");
    const shareUrl = recording.querySelector("[data-recording-share-url]");
    const status = recording.querySelector("[data-recording-status]");
    const help = recording.querySelector("[data-recording-help]");
    const search = recording.querySelector("[data-recording-query]");
    const chapters = [...recording.querySelectorAll("[data-recording-chapter]")];
    const links = chapters.map((chapter) => chapter.querySelector("a"));
    const duration = Number(recording.dataset.recordingDuration);
    const watchUrl = new URL(youtube.href);
    const embedUrl = new URL(frame.src);
    const incoming = new URL(window.location.href);
    let moment = 0;
    let player;
    let ready = false;
    let pendingSeek = false;
    let poller;

    if (incoming.searchParams.get("recording") === recording.id) {
      const supplied = incoming.searchParams.get("t");
      if (supplied !== null && /^\d+$/.test(supplied)) {
        const seconds = Number(supplied);
        if (Number.isSafeInteger(seconds) && seconds < duration) {
          moment = seconds;
          embedUrl.searchParams.set("start", String(seconds));
        }
      }
    }
    if (/^https?:$/.test(window.location.protocol))
      embedUrl.searchParams.set("origin", window.location.origin);
    if (frame.src !== embedUrl.href) frame.src = embedUrl.href;

    function setMoment(seconds) {
      moment = seconds;
      if (seconds > 0) watchUrl.searchParams.set("t", `${seconds}s`);
      else watchUrl.searchParams.delete("t");
      youtube.href = watchUrl.href;
      const active = links.findLast
        ? links.findLast((link) => Number(link.dataset.recordingSeek) <= seconds)
        : [...links].reverse().find((link) => Number(link.dataset.recordingSeek) <= seconds);
      for (const link of links) {
        if (link === active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    }

    function currentMoment() {
      if (ready && !pendingSeek) {
        try {
          const seconds = player.getCurrentTime();
          if (Number.isFinite(seconds) && seconds >= 0 && seconds < duration)
            return Math.floor(seconds);
        } catch {
          // The native links still work if the player stops responding.
        }
      }
      return moment;
    }

    function stopPolling() {
      clearInterval(poller);
      poller = undefined;
    }

    function useNativeLinks() {
      ready = false;
      stopPolling();
      if (help) help.textContent = "Chapter links open YouTube at that moment.";
    }

    setMoment(moment);
    share.hidden = false;
    youtube.addEventListener("click", () => setMoment(currentMoment()));
    share.addEventListener("click", async () => {
      const url = new URL(window.location.pathname, window.location.origin);
      url.searchParams.set("recording", recording.id);
      url.searchParams.set("t", String(currentMoment()));
      url.hash = recording.id;
      shareUrl.value = url.href;
      try {
        await navigator.clipboard.writeText(url.href);
        shareUrl.hidden = true;
        status.textContent = "Link copied.";
      } catch {
        shareUrl.hidden = false;
        shareUrl.focus();
        shareUrl.select();
        status.textContent = "Copy the selected link to share this moment.";
      }
    });

    if (search) {
      recording.querySelector("[data-recording-search]").hidden = false;
      const count = recording.querySelector("[data-recording-count]");
      const empty = recording.querySelector("[data-recording-empty]");
      const chapterText = chapters.map((chapter) => chapter.textContent.toLowerCase());
      search.addEventListener("input", () => {
        const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
        let matches = 0;
        chapters.forEach((chapter, index) => {
          chapter.hidden = !terms.every((term) => chapterText[index].includes(term));
          if (!chapter.hidden) matches++;
        });
        count.textContent = terms.length
          ? `${matches} of ${chapters.length} chapters`
          : `${chapters.length} chapters`;
        empty.hidden = matches > 0;
      });
    }

    recording.addEventListener("click", (event) => {
      const link = event.target instanceof Element
        ? event.target.closest("a[data-recording-seek]")
        : null;
      if (
        !link || !ready || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      )
        return;
      const seconds = Number(link.dataset.recordingSeek);
      pendingSeek = true;
      setMoment(seconds);
      status.textContent = `Selected ${formatTime(seconds)}: ${link.lastElementChild.textContent}.`;
      try {
        player.seekTo(seconds, true);
        player.playVideo();
        event.preventDefault();
        frame.scrollIntoView({ block: "nearest" });
      } catch {
        pendingSeek = false;
        useNativeLinks();
      }
    });

    async function initializePlayer() {
      try {
        await loadPlayerAPI();
        player = new window.YT.Player(frame, {
          events: {
            onReady(event) {
              player = event.target;
              players.add(player);
              ready = true;
              if (help) help.textContent = "Select a chapter to play it here.";
            },
            onStateChange(event) {
              stopPolling();
              if (event.data !== 1) return;
              pendingSeek = false;
              for (const other of players) {
                if (other !== event.target && other.getPlayerState() === 1)
                  other.pauseVideo();
              }
              setMoment(currentMoment());
              poller = setInterval(() => {
                if (!document.hidden) setMoment(currentMoment());
              }, 1000);
            },
            onAutoplayBlocked() {
              status.textContent = `Press Play in the video to watch from ${formatTime(moment)}.`;
            },
            onError() {
              useNativeLinks();
              status.textContent = "Watch on YouTube using the button or a chapter link.";
            },
          },
        });
      } catch {
        useNativeLinks();
      }
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        initializePlayer();
      }, { rootMargin: "250px" });
      observer.observe(frame);
    } else {
      initializePlayer();
    }
  }
}
