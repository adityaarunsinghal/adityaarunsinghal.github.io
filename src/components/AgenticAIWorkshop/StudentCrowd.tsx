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
          <p className="eyebrow">FROM THE REGISTRATION FORM</p>
          <h2 id="crowd-title">Who signed up?</h2>
        </div>
        <p>
          {crowd.responses} responses as of {crowd.snapshot}. These six
          illustrated voices are fictional composites of the different starting
          points people described. A response does not establish attendance.
        </p>
      </div>
      <ol className="crowd-grid">
        {crowd.people.map((person) => (
          <li key={person.id}>
            <details className="crowd-persona">
              <summary>
                <span className="crowd-portrait" style={{ background: person.color }}>
                  <svg viewBox="0 0 240 240" aria-hidden="true">
                    <use href={`/workshops/2026/student-crowd-portraits.svg#art-${person.id}`} />
                  </svg>
                  <span className="crowd-count">{person.count}</span>
                </span>
                <span className="crowd-name">{person.name}</span>
                <span className="crowd-label">{person.label}</span>
                <span className="crowd-intro">{person.intro}</span>
                <span className="crowd-expand">Read my perspective</span>
              </summary>
              <div className="crowd-voice">
                <div>
                  <h3>What excites me</h3>
                  <p>{person.excites}</p>
                </div>
                <div>
                  <h3>What worries me</h3>
                  <p>{person.worries}</p>
                </div>
                <div>
                  <h3>What I want to leave with</h3>
                  <p>{person.leaveWith}</p>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
      <p className="crowd-method">
        Each response selected one agent-experience starting point. Circle
        counts show those answers, not fixed types of people.
      </p>
    </section>
  );
}
