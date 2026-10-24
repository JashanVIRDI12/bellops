import Link from "next/link";
import { stillImage } from "@/components/experience/still-image";
import type { Service } from "@/lib/content";
import { RowPreview } from "./RowPreview";

/**
 * Services as a typographic list: one row each, the name set large. With
 * `preview`, wide screens show each service's studio shot beside the pointer.
 */
export function ServiceRows({
  items,
  titleLevel = "h3",
  preview = false,
}: {
  items: readonly Service[];
  titleLevel?: "h2" | "h3";
  preview?: boolean;
}) {
  const Title = titleLevel;
  const list = (
    <ul className="rows">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="row" data-row={item.href}>
            <Title className="row-title">{item.title}</Title>
            <span className="row-body">{item.body}</span>
            <span className="row-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
  if (!preview) return list;
  return (
    <RowPreview
      images={items.map((item) => ({
        key: item.href,
        props: stillImage(
          item.page.hour.shot,
          "landscape",
          item.page.hour.mood,
          false,
          "26rem",
        ),
      }))}
    >
      {list}
    </RowPreview>
  );
}
