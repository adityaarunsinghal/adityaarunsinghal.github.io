import { type SessionRecording } from "./pages";

export function formatRecordingTime(seconds: number) {
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = String(total % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}`
    : `${String(minutes).padStart(2, "0")}:${remainder}`;
}

export function recordingWatchUrl(youtubeId: string, seconds = 0) {
  const url = new URL("https://www.youtube.com/watch");
  url.searchParams.set("v", youtubeId);
  if (seconds > 0) url.searchParams.set("t", `${Math.floor(seconds)}s`);
  return url.href;
}

export function recordingEmbedUrl(youtubeId: string) {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${youtubeId}`);
  url.searchParams.set("enablejsapi", "1");
  url.searchParams.set("origin", "https://adityasinghal.com");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("rel", "0");
  return url.href;
}

export function validateRecordings(recordings: SessionRecording[]) {
  const ids = new Set<string>();
  for (const recording of recordings) {
    if (!/^[a-z][a-z0-9-]*$/.test(recording.id) || ids.has(recording.id))
      throw new Error(`Invalid or duplicate recording ID: ${recording.id}`);
    ids.add(recording.id);
    if (
      !Number.isInteger(recording.session) ||
      recording.session < 1
    )
      throw new Error(`Unknown session for ${recording.id}`);
    const date = new Date(`${recording.date}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(recording.date) ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== recording.date
    )
      throw new Error(`Invalid recording date for ${recording.id}`);
    if (
      recording.youtubeId !== null &&
      !/^[A-Za-z0-9_-]{11}$/.test(recording.youtubeId)
    )
      throw new Error(`Use the 11-character YouTube video ID for ${recording.id}`);
    if (
      !Number.isFinite(recording.durationSeconds) ||
      recording.durationSeconds <= 0
    )
      throw new Error(`Invalid duration for ${recording.id}`);
    if (!recording.searchPlaceholder.trim())
      throw new Error(`Missing search examples for ${recording.id}`);
    let previous = -1;
    for (const chapter of recording.chapters) {
      if (
        !Number.isInteger(chapter.startSeconds) ||
        chapter.startSeconds <= previous ||
        chapter.startSeconds >= recording.durationSeconds ||
        !chapter.title.trim()
      )
        throw new Error(`Invalid chapter in ${recording.id}: ${chapter.title}`);
      previous = chapter.startSeconds;
    }
  }
}
