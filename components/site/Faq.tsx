import { faqs } from "@/lib/content";

type Question = { question: string; answer: string };

/** Common questions, each opening in place. Defaults to the service pages' set. */
export function Faq({
  items = faqs,
  heading = "Questions",
}: {
  items?: readonly Question[];
  heading?: string;
}) {
  return (
    <section aria-labelledby="faq" className="wrap split block">
      <h2 id="faq" className="block-title">
        {heading}
      </h2>
      <div className="faq">
        {items.map((faq) => (
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
