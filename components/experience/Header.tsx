"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import { chapters, site } from "@/lib/content";
import { scrollToSection } from "./SmoothScroll";
import { useBeat } from "./store";

const LAST_BEAT = chapters.reduce((sum, chapter) => sum + chapter.beats, 0) - 1;

const links = [
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
];

/** Plain anchors that glide with the smooth scroll; without JS they still jump. */
function glideTo(id: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection(id);
    history.replaceState(null, "", `#${id}`);
  };
}

/**
 * White navigation over a feathered top shade stays legible across the tour.
 * In the contact section the form scrolls under it, so it gets a solid shade.
 */
export function Header() {
  const solid = useBeat() >= LAST_BEAT;
  return (
    <header
      data-solid={solid || undefined}
      className="experience-header pointer-events-none fixed inset-x-0 top-0 z-[36] flex items-center justify-between px-6 py-5 text-white md:px-12 md:py-7 lg:px-16"
    >
      <a
        href="#intro"
        onClick={glideTo("intro")}
        aria-label={`${site.name} home`}
        className="pointer-events-auto shrink-0 focus-visible:outline-white"
      >
        <Image
          src="/brand/bellops-wordmark-transparent.png"
          alt={site.name}
          width={984}
          height={304}
          sizes="(min-width: 768px) 112px, (min-width: 360px) 96px, 80px"
          preload
          className="h-auto w-20 min-[360px]:w-24 md:w-28"
        />
      </a>
      <nav aria-label="Main" className="pointer-events-auto">
        <ul className="flex gap-5 text-sm font-semibold md:gap-8">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={glideTo(link.id)}
                className="opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
