import { projectProcess } from "@/lib/content";

/**
 * How a project runs. It's a sequence, so the steps are numbered; the heading
 * stays in view while they scroll past.
 */
export function Process() {
  return (
    <section aria-labelledby="process" className="wrap split process block">
      <div className="process-head">
        <h2 id="process" className="block-title">
          {projectProcess.heading}
        </h2>
        <p className="block-note">One small team, start to finish.</p>
      </div>
      <ol className="process-steps">
        {projectProcess.steps.map((step, index) => (
          <li key={step.title} className="process-step">
            <span className="process-number" aria-hidden="true">
              {index + 1}
            </span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
