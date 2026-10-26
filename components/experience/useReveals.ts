"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Scroll-scrubbed text. While the camera travels to a shot, its text block
 * fades and lifts in and the headline rises line by line from behind a mask;
 * both finish as the camera lands.
 */
export function useReveals(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils
          .toArray<HTMLElement>("[data-reveal-block]")
          .forEach((block) => {
            const section = block.closest("[data-beat]") ?? block;
            gsap.from(block, {
              autoAlpha: 0,
              y: 48,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top 75%",
                end: "top 10%",
                scrub: true,
              },
            });
          });

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((heading) => {
          const section = heading.closest("[data-beat]") ?? heading;
          SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (split) =>
              gsap.from(split.lines, {
                yPercent: 110,
                stagger: 0.14,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top 55%",
                  end: "top top",
                  scrub: true,
                },
              }),
          });
        });
      });
      return () => media.revert();
    },
    { scope },
  );
}
