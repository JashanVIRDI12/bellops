/** What a service includes: a plain list, set large. */
export function Included({ items }: { items: readonly string[] }) {
  return (
    <section aria-labelledby="included" className="wrap split block">
      <h2 id="included" className="block-title">
        What&apos;s included
      </h2>
      <ul className="included">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
