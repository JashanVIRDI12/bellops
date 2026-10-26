import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import type { Crumb } from "@/lib/schema";

/**
 * A page's <h1>, its words rising from a mask on arrival. Only transforms
 * move, so the text is in the HTML (and readable) from the start.
 */
export function RevealTitle({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <h1 className={`reveal-title ${className}`}>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="reveal-word">
            <span style={{ "--i": index } as CSSProperties}>{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  );
}

/** Where a page sits: links back up the trail, the current page last. */
export function Crumbs({ trail }: { trail: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        {trail.map((crumb) =>
          crumb.href ? (
            <li key={crumb.label}>
              <Link href={crumb.href}>{crumb.label}</Link>
            </li>
          ) : (
            <li key={crumb.label}>
              <span aria-current="page">{crumb.label}</span>
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}
