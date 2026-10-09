import { instructors } from "../../workshop/pages";

export default function Instructors() {
  return (
    <section
      className="course-wrap course-section instructor-section"
      id="instructor"
      aria-labelledby="instructor-title"
    >
      <p className="eyebrow">YOUR INSTRUCTORS</p>
      <h2 id="instructor-title">Meet your instructors.</h2>
      <div className="instructor-grid">
        {instructors.map((instructor) => (
          <article
            className="instructor-card"
            key={instructor.id}
            aria-labelledby={`${instructor.id}-instructor-title`}
          >
            <div
              className="instructor-portrait"
              data-instructor-wave=""
              data-instructor-name={instructor.name}
            >
              <img
                id={`${instructor.id}-instructor-wave`}
                src={instructor.still}
                data-wave-src={instructor.wave}
                data-still-src={instructor.still}
                alt={`${instructor.name} waving hello`}
                width="640"
                height={instructor.height}
                loading="lazy"
                decoding="async"
              />
              <button
                type="button"
                data-wave-toggle=""
                aria-controls={`${instructor.id}-instructor-wave`}
                aria-label={`Pause ${instructor.name}'s wave`}
                hidden
              >
                Pause wave
              </button>
            </div>
            <div className="instructor-copy">
              <h3 id={`${instructor.id}-instructor-title`}>{instructor.name}</h3>
              <p>{instructor.biography}</p>
              <a href={instructor.linkedin}>
                Connect on LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
