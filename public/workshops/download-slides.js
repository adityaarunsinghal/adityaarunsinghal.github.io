{
  const activeDownloads = new WeakSet();

  document.addEventListener("click", async (event) => {
    const link =
      event.target instanceof Element
        ? event.target.closest("a[data-slide-download]")
        : null;
    if (
      !link ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;

    event.preventDefault();
    if (activeDownloads.has(link)) return;
    activeDownloads.add(link);

    const status = link.parentElement.querySelector(
      "[data-slide-download-status]",
    );
    const previousDisabled = link.getAttribute("aria-disabled");
    const previousBusy = link.getAttribute("aria-busy");
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("aria-busy", "true");
    status.hidden = false;
    status.setAttribute("role", "status");
    status.textContent = "Downloading slides…";

    try {
      // Resolve the main-branch path on each click, bypassing cached responses.
      // GitHub's cross-origin HTML link needs a local Blob to trigger a save.
      const sourceUrl = new URL(link.href);
      sourceUrl.searchParams.set("download", String(Date.now()));
      const response = await fetch(sourceUrl, {
        cache: "no-store",
        credentials: "omit",
      });
      if (!response.ok) throw new Error("Slide download failed.");
      const slides = await response.blob();
      if (!slides.size) throw new Error("The slide file was empty.");

      const objectUrl = URL.createObjectURL(slides);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = link.dataset.slideDownload;
      document.body.append(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      // Allow the browser to begin reading the complete file before releasing it.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      status.textContent = "Download started.";
    } catch {
      status.setAttribute("role", "alert");
      status.textContent =
        "Could not download the slides. Try again or open the repository.";
    } finally {
      activeDownloads.delete(link);
      for (const [attribute, previous] of [
        ["aria-disabled", previousDisabled],
        ["aria-busy", previousBusy],
      ]) {
        if (previous === null) link.removeAttribute(attribute);
        else link.setAttribute(attribute, previous);
      }
    }
  });
}
