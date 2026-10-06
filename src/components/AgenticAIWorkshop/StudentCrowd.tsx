import { crowd } from "../../workshop/crowd";

export default function StudentCrowd() {
  return (
    <section
      className="course-wrap course-section student-crowd"
      id="crowd"
      aria-labelledby="crowd-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">FROM THE WORKSHOP FORMS</p>
          <h2 id="crowd-title">Who signed up?</h2>
        </div>
        <p>
          Fictional voices based on replies as of {crowd.snapshot}.
          Approximate counts overlap.
        </p>
      </div>
      <ol className="crowd-grid">
        {crowd.people.map((person) => (
          <li key={person.id}>
            <details className="crowd-persona">
              <summary>
                <span className="crowd-portrait" style={{ background: person.color }}>
                  <svg viewBox="0 0 240 240" aria-hidden="true">
                    <use href={`/workshops/2026/student-crowd-portraits.svg#art-${person.portrait}`} />
                  </svg>
                  <span
                    className="crowd-count"
                    aria-label={`Approximately ${person.count}`}
                  >
                    ≈{person.count}
                  </span>
                </span>
                <span className="crowd-name">{person.name}</span>
                <span className="crowd-label">{person.label}</span>
                <span className="crowd-expand">Read my perspective</span>
              </summary>
              <div className="crowd-voice">
                <p>{person.blurb}</p>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
