import { faqs } from "@/lib/content";

/** Common questions, each opening in place. */
export function Faq() {
  return (
    <section aria-labelledby="faq" className="wrap split block">
      <h2 id="faq" className="block-title">
        Questions
      </h2>
      <div className="faq">
        {faqs.map((faq) => (
          <details key={faq.question} className="faq-item">
            <summary>
              <span>{faq.question}</span>
              <span className="faq-icon" aria-hidden="true" />
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
