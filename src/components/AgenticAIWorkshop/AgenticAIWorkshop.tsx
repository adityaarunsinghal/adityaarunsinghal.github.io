import {
  course,
  courseAction,
  historical,
  resources,
  sessionRecordings,
  sessions,
  type CourseState,
  type SessionRecording,
} from "../../workshop/pages";
import StudentCrowd from "./StudentCrowd";
import Instructors from "./Instructors";
import SessionRecordings from "./SessionRecordings";

const Arrow = () => <span aria-hidden="true">↗</span>;

function BriefingExample() {
  return (
    <aside
      className="briefing-example"
      aria-label="Illustrative morning briefing project"
    >
      <div className="example-caption">
        <span>A project you could build</span>
        <span>Illustrative</span>
      </div>
      <div className="briefing-sheet">
        <div className="edition-label">
          THE MORNING EDITION <span>YOUR TOPICS. YOUR PACE.</span>
        </div>
        <h2>
          A briefing for
          <br />
          your commute.
        </h2>
        <p className="briefing-intro">
          You choose the interests.
          <br />
          Your agent brings back the reading.
        </p>
        <div className="briefing-preference">
          <span>READING PREFERENCE</span>
          <strong>Practical agent engineering</strong>
        </div>
        <div className="briefing-story">
          <span className="story-index">01</span>
          <div>
            <h3>A tool worth understanding</h3>
            <p>
              A short explanation, why it fits your interests, and the original
              source.
            </p>
          </div>
        </div>
        <div className="briefing-story">
          <span className="story-index">02</span>
          <div>
            <h3>A claim worth checking</h3>
            <p>The evidence behind it, with uncertainty kept visible.</p>
          </div>
        </div>
      </div>
      <details className="example-mechanism">
        <summary>
          What would the agent do? <span aria-hidden="true">+</span>
        </summary>
        <ol>
          <li>Read your saved preferences.</li>
          <li>Find sources and select useful material.</li>
          <li>Prepare a briefing you can inspect.</li>
          <li>Check its claims against the evidence.</li>
        </ol>
        <p>
          This is an example of a possible project. You will choose your own.
        </p>
      </details>
    </aside>
  );
}

export default function AgenticAIWorkshop({
  state = course.state,
  recordings = sessionRecordings,
}: {
  state?: CourseState;
  recordings?: SessionRecording[];
}) {
  const action = courseAction(state);
  const availableRecordings = recordings.filter((recording) => recording.youtubeId);
  return (
    <div className="workshop-2026">
      <header className="course-header">
        <div className="course-wrap header-inner">
          <a href="/" className="site-signature">
            Adi Singhal <span>/ NYU CDS</span>
          </a>
          <nav aria-label="Workshop navigation">
            <a href="#schedule">Schedule</a>
            <a href="#format">Format</a>
            <a href="#materials">Materials</a>
            {recordings.length > 0 && <a href="#recordings">Recordings</a>}
            <a href={course.appStoreUrl}>App store <Arrow /></a>
            <a href={course.archivePath}>
              2025 archive <Arrow />
            </a>
          </nav>
        </div>
      </header>
      <main id="main-content">
        <section
          className="course-wrap course-hero"
          id="overview"
          aria-labelledby="course-title"
        >
          <div className="hero-copy">
            <p className="eyebrow">NYU CDS · FALL 2026</p>
            <p className="course-name">Agentic AI Workshop</p>
            <h1 id="course-title">
              Build an agent you can explain.
            </h1>
            <p className="hero-description">
              Watch an agent choose a tool and see what runs it. Then build one
              around a problem you care about!
            </p>
            <div className="hero-logistics">
              <strong>{course.dates}</strong>
              <span>{course.time}</span>
              <span>{course.venue}</span>
            </div>
            <a className="course-button" href={action.href}>
              {action.label} <Arrow />
            </a>
            <p className="registration-note">{action.note}</p>
            <p className="hero-materials-link">
              <a href={course.publicRepositoryUrl}>
                Get Session 1 slides and starter code <Arrow />
              </a>
            </p>
            {availableRecordings.length > 0 && (
              <p className="hero-materials-link">
                <a href={`#${availableRecordings[0].id}`}>
                  Watch Session {availableRecordings[0].session} <Arrow />
                </a>
              </p>
            )}
            <a className="subtle-link" href={course.archivePath}>
              Looking for last year’s workshop?{" "}
              <span>
                Explore 2025 <Arrow />
              </span>
            </a>
          </div>
          <BriefingExample />
        </section>
        <div className="course-facts">
          <div className="course-wrap facts-inner">
            <span>In person at NYU CDS</span>
            <span>Slides, live demos & discussion</span>
            <span>OpenRouter inference provided</span>
          </div>
        </div>
        <section
          className="course-wrap course-section"
          id="schedule"
          aria-labelledby="schedule-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE COURSE</p>
              <h2 id="schedule-title">
                Build your own agent over four Thursdays.
              </h2>
            </div>
            <p>
              From the first tool call to a project you can share. Sessions 1–3
              are required. Demo Day is highly encouraged, even if you don’t
              present.
            </p>
          </div>
          <ol className="session-list">
            {sessions.map((session, index) => (
              <li className="session-row" key={session.date}>
                <time dateTime={session.date} className="session-calendar">
                  <span>OCT</span>
                  <strong>{session.day}</strong>
                </time>
                <div className="session-body">
                  <p className="session-label">
                    SESSION {index + 1} <span>{session.attendance}</span>
                  </p>
                  <h3>{session.title}</h3>
                  <p>{session.description}</p>
                  <ul className="session-tags" aria-label="Topics">
                    {session.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                  {availableRecordings
                    .filter((recording) => recording.session === index + 1)
                    .map((recording) => (
                      <p className="session-recording-link" key={recording.id}>
                        <a href={`#${recording.id}`}>Watch the recording <Arrow /></a>
                      </p>
                    ))}
                </div>
                <span className="session-time">
                  THURSDAY
                  <br />
                  5:30–7 PM ET
                </span>
              </li>
            ))}
          </ol>
        </section>
        <section
          className="format-band"
          id="format"
          aria-labelledby="format-title"
        >
          <div className="course-wrap course-section format-grid">
            <div>
              <p className="eyebrow">HOW WE LEARN</p>
              <h2 id="format-title">
                Follow the agent’s decisions in class.
              </h2>
              <p className="format-lead">
                Keep your laptop closed and ask questions as we predict what
                happens next. Build your own between sessions.
              </p>
              <p>
                <a href={course.publicRepositoryUrl}>Slides and starter code</a>{" "}
                support your project. You’ll be encouraged to share your agent
                through the class app store.
              </p>
            </div>
            <div className="format-notes">
              <div>
                <span>IN THE ROOM</span>
                <h3>60 minutes of material + 30 minutes of Q&A</h3>
                <p>
                  Technical storytelling through slides, live demonstrations,
                  and conversation.
                </p>
              </div>
              <div>
                <span>BETWEEN SESSIONS</span>
                <h3>About 1–2 hours of development each week</h3>
                <p>
                  Start with a research question, a recurring task, or a personal
                  workflow. Make a small version that works, then develop it
                  each week.
                </p>
              </div>
              <div>
                <span>SUPPORT</span>
                <h3>Friday office hours</h3>
                <p>
                  Bring a broken tool call, a confusing code path, or an idea
                  that feels too big. We’ll help you find the next step. Joining
                  details will be shared with registered students.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          className="course-wrap course-section"
          id="materials"
          aria-labelledby="materials-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR BUILDING MATERIALS</p>
              <h2 id="materials-title">
                Starter materials for your own project.
              </h2>
            </div>
            <p>
              Session 1 slides and starter code are available in the{" "}
              <a href={course.publicRepositoryUrl}>public course repository</a>.
              Each session’s materials will be released the day before class.
            </p>
          </div>
          <div className="resource-list">
            {resources.map((resource, index) => (
              <div className="resource-row" key={resource.name}>
                <span className="resource-number">0{index + 1}</span>
                <div>
                  <h3>{resource.name}</h3>
                  <p>{resource.description}</p>
                </div>
                <div className="resource-destination">
                  {resource.url ? (
                    <a
                      className="store-link"
                      href={resource.url}
                      download={resource.download}
                      data-slide-download={resource.download}
                    >
                      {resource.action ?? "Open resource"} <Arrow />
                    </a>
                  ) : (
                    <span className="coming-soon">Coming Soon</span>
                  )}
                  {resource.download && (
                    <p
                      className="slide-download-status"
                      data-slide-download-status=""
                      role="status"
                      hidden
                    />
                  )}
                  {resource.note && <small><em>{resource.note}</em></small>}
                </div>
              </div>
            ))}
          </div>
        </section>
        <SessionRecordings recordings={recordings} />
        <section
          className="course-wrap demo-section"
          id="demo-day"
          aria-labelledby="demo-title"
        >
          <div className="demo-date">
            <span>OCTOBER</span>
            <strong>29</strong>
            <span>DEMO DAY</span>
          </div>
          <div className="demo-copy">
            <p className="eyebrow">SHOW WHAT YOU BUILT</p>
            <h2 id="demo-title">
              Meet other builders through your project.
            </h2>
            <p>
              Share your work with classmates and industry professionals from
              OpenRouter, Amazon, Google, and startups.
            </p>
            <p>
              Judges will select students whose demos they like for coffee
              chats. Come to show your project, give feedback, or see what
              everyone made.
            </p>
          </div>
        </section>
        <section
          className="course-wrap course-section history-section"
          id="last-year"
          aria-labelledby="history-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">FROM THE 2025 CLASS</p>
              <h2 id="history-title">Get a feel for the room.</h2>
            </div>
            <p>
              Last year, we built a personalized newspaper with MCP. These
              highlights offer a look at the examples, questions, and
              discussions.
            </p>
          </div>
          <div className="history-links">
            <a href={historical.playlist}>
              2025 highlights playlist <Arrow />
            </a>
            <a href={historical.repository}>
              2025 course code <Arrow />
            </a>
            <a href={course.archivePath}>
              2025 workshop website <Arrow />
            </a>
          </div>
          <div className="clip-grid">
            {historical.clips.map((clip, index) => (
              <a href={clip.url} className="clip-card" key={clip.url}>
                <span className="clip-label">
                  2025 RECORDING <span aria-hidden="true">0{index + 1}</span>
                </span>
                <h3>{clip.title}</h3>
                <p>{clip.description}</p>
                <span className="clip-action">
                  Watch highlight <Arrow />
                </span>
              </a>
            ))}
          </div>
        </section>
        <Instructors />
        <section
          className="course-wrap course-section practical-section"
          aria-labelledby="practical-title"
        >
          <div className="course-faq" id="before-you-join">
            <h2 id="practical-title">Before you join</h2>
            <details open>
              <summary>Who is the workshop for?</summary>
              <p>
                Members of the CDS community, including students and alumni.
                Undergraduates should have completed DS-UA 112. Attend the first
                three sessions and plan for weekly project work.
              </p>
            </details>
            <details>
              <summary>Where do we meet?</summary>
              <p>
                {course.venue}, {course.address}, New York City. {course.time}.
              </p>
              <p>
                The workshop is in person. Contact the organizer about
                individual attendance questions.
              </p>
            </details>
            <details>
              <summary>What will I need?</summary>
              <p>
                Time to build between sessions and curiosity in the room. Find
                slides and starter code in the{" "}
                <a href={course.publicRepositoryUrl}>
                  public course repository
                </a>. Registered students will receive inference access through
                OpenRouter.
              </p>
            </details>
            <details>
              <summary>How do I register or ask a question?</summary>
              <p>
                {action.note} The registration form requires Google sign-in.
              </p>
              <p>
                <a href={`mailto:${course.contact}`}>
                  Contact the workshop organizer
                </a>{" "}
                about form access, attendance, or other questions.
              </p>
            </details>
          </div>
        </section>
        <StudentCrowd />
        <section className="closing-band" id="register">
          <div className="course-wrap closing-inner">
            <div>
              <p className="eyebrow">NYU CDS · AGENTIC AI WORKSHOP 2026</p>
              <h2>
                Bring your curiosity and build an agent of your own.
              </h2>
              <p>{action.note}</p>
            </div>
            <a className="course-button" href={action.href}>
              {action.label} <Arrow />
            </a>
          </div>
        </section>
      </main>
      <footer className="course-wrap course-footer">
        <a href="/">Adi Singhal</a>
        <span>NYU Center for Data Science · Fall 2026</span>
        <a href={course.archivePath}>
          2025 archive <Arrow />
        </a>
      </footer>
    </div>
  );
}
