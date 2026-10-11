import { type SessionRecording } from "../../workshop/pages";
import {
  formatRecordingTime,
  recordingEmbedUrl,
  recordingWatchUrl,
  validateRecordings,
} from "../../workshop/recordings";

export default function SessionRecordings({
  recordings,
}: {
  recordings: SessionRecording[];
}) {
  validateRecordings(recordings);
  if (!recordings.length) return null;
  return (
    <section
      className="course-wrap course-section recording-section"
      id="recordings"
      aria-labelledby="recordings-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">RECORDED IN CLASS</p>
          <h2 id="recordings-title">Session recordings</h2>
        </div>
        <p>
          Watch the full session or find a topic in the chapter list.
        </p>
      </div>
      <div className="recording-list">
        {recordings.map((recording) => {
          const youtubeId = recording.youtubeId;
          const date = new Date(`${recording.date}T00:00:00Z`).toLocaleDateString(
            "en-US",
            { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" },
          );
          return (
            <article
              className="session-recording"
              id={recording.id}
              key={recording.id}
              aria-labelledby={`${recording.id}-title`}
              data-session-recording={recording.youtubeId ? "" : undefined}
              data-recording-duration={recording.durationSeconds}
            >
              <header className="recording-heading">
                <p className="session-label">
                  SESSION {recording.session}{" "}
                  <span>
                    <time dateTime={recording.date}>{date}</time>
                  </span>
                </p>
                <h3 id={`${recording.id}-title`}>{recording.title}</h3>
              </header>
              {youtubeId ? (
                <div className="recording-layout">
                  <div className="recording-view">
                    <iframe
                      id={`${recording.id}-player`}
                      className="recording-player"
                      title={`Session ${recording.session}: ${recording.title}, recorded ${date}`}
                      src={recordingEmbedUrl(youtubeId)}
                      width="640"
                      height="360"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                    <div className="recording-actions">
                      <a
                        className="course-button"
                        href={recordingWatchUrl(youtubeId)}
                        target="_blank"
                        rel="noopener"
                        data-recording-youtube=""
                        aria-label={`View Session ${recording.session} on YouTube`}
                      >
                        View on YouTube <span aria-hidden="true">↗</span>
                      </a>
                      <button
                        type="button"
                        className="recording-share"
                        data-recording-share=""
                        hidden
                      >
                        Copy link to this moment
                      </button>
                    </div>
                    <p className="recording-duration">
                      Full session · {formatRecordingTime(recording.durationSeconds)}
                    </p>
                    <p
                      className="recording-status"
                      data-recording-status=""
                      role="status"
                      aria-live="polite"
                    />
                    <input
                      className="recording-share-url"
                      data-recording-share-url=""
                      type="url"
                      aria-label="Link to this moment"
                      readOnly
                      hidden
                    />
                  </div>
                  {recording.chapters.length > 0 && (
                    <aside
                      className="recording-chapters"
                      aria-labelledby={`${recording.id}-chapters-title`}
                    >
                      <h4 id={`${recording.id}-chapters-title`}>Find a moment</h4>
                      <p className="recording-help" data-recording-help="">
                        Chapter links open YouTube at that moment.
                      </p>
                      <div className="recording-search" data-recording-search="" hidden>
                        <label htmlFor={`${recording.id}-search`}>Search chapters</label>
                        <input
                          id={`${recording.id}-search`}
                          type="search"
                          placeholder={recording.searchPlaceholder}
                          aria-controls={`${recording.id}-chapters`}
                          data-recording-query=""
                        />
                      </div>
                      <p
                        className="recording-count"
                        data-recording-count=""
                        role="status"
                      >
                        {recording.chapters.length} chapters
                      </p>
                      <ol className="chapter-list" id={`${recording.id}-chapters`}>
                        {recording.chapters.map((chapter) => (
                          <li key={chapter.startSeconds} data-recording-chapter="">
                            <a
                              href={recordingWatchUrl(
                                youtubeId,
                                chapter.startSeconds,
                              )}
                              target="_blank"
                              rel="noopener"
                              data-recording-seek={chapter.startSeconds}
                            >
                              <span className="chapter-time">
                                {formatRecordingTime(chapter.startSeconds)}
                              </span>
                              <span>{chapter.title}</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                      <p className="recording-empty" data-recording-empty="" hidden>
                        No matching chapters. Try another topic or clear the search.
                      </p>
                    </aside>
                  )}
                </div>
              ) : (
                <div className="recording-pending">
                  <p>
                    The full session is being prepared for YouTube. It will
                    appear here with chapters once available.
                  </p>
                  <span className="coming-soon">Coming Soon</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
