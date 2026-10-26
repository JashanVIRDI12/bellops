import type { ReactNode } from "react";
import { preload } from "react-dom";
import { stillImage } from "@/components/experience/still-image";
import type { Hour } from "@/lib/content";
import type { Crumb } from "@/lib/schema";
import { Crumbs, RevealTitle } from "./RevealTitle";

/**
 * A window into the studio: one of its camera shots at a chosen hour, full
 * bleed, with the page's heading set into its lower edge (the home page's
 * grammar). Phones get the portrait framing of the same shot.
 *
 * The one entrance on the page: the shot settles as the heading's words rise
 * from a mask. Only transforms move, so the text is in the HTML from the start.
 */
export function StudioHero({
  hour,
  crumbs,
  heading,
  lead,
  note,
  children,
}: {
  hour: Hour;
  crumbs: readonly Crumb[];
  heading: string;
  lead: string;
  /** A short line under the lead, such as the starting price. */
  note?: string;
  /** Calls to action under the lead. */
  children?: ReactNode;
}) {
  const landscape = stillImage(hour.shot, "landscape", hour.mood, true);
  const tall = hour.portrait ?? hour;
  const portrait = stillImage(tall.shot, "portrait", tall.mood, true);
  // Only the shot for this screen's orientation downloads, straight away.
  preload(landscape.src, {
    as: "image",
    imageSrcSet: landscape.srcSet,
    imageSizes: landscape.sizes,
    fetchPriority: "high",
    media: "(orientation: landscape)",
  });
  preload(portrait.src, {
    as: "image",
    imageSrcSet: portrait.srcSet,
    imageSizes: portrait.sizes,
    fetchPriority: "high",
    media: "(orientation: portrait)",
  });

  return (
    <section className="hero" data-mood={hour.mood} data-ga-location="hero">
      <div className="hero-shot" aria-hidden="true">
        <picture>
          <source
            media="(orientation: portrait)"
            srcSet={portrait.srcSet}
            sizes={portrait.sizes}
          />
          <img {...landscape} alt="" />
        </picture>
      </div>
      <div className="wrap hero-copy">
        <Crumbs trail={crumbs} />
        <RevealTitle text={heading} className="hero-title" />
        <div className="hero-foot">
          <div>
            <p className="hero-lead">{lead}</p>
            {note && <p className="hero-note">{note}</p>}
          </div>
          {children && <div className="hero-actions">{children}</div>}
        </div>
      </div>
    </section>
  );
}
