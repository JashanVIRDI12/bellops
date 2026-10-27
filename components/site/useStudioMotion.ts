"use client";

import { useEffect, type RefObject } from "react";
import { usePathname } from "next/navigation";

/**
 * The inner pages' motion: blocks rise in as they scroll into view, photos
 * settle, and a reading line tracks the page. Route-scoped; matchMedia
 * reverts everything when motion is disabled. GSAP loads in its own chunk
 * once the page has rendered.
 */
export function useStudioMotion(scope: RefObject<HTMLElement | null>) {
  const pathname = usePathname();
  useEffect(() => {
    let revert: (() => void) | undefined;
    let cancelled = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled || !scope.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          const media = gsap.matchMedia();
          media.add("(prefers-reduced-motion: no-preference)", () => {
            const q = gsap.utils.selector(scope);
            q(
              "[data-enter], .site-page .block-head, .site-page .included li, .site-page .process-step, .site-page .showcase-item",
            ).forEach((element: HTMLElement) => {
              gsap.from(element, {
                y: 38,
                opacity: 0,
                duration: 0.95,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: element,
                  start: "top 94%",
                  once: true,
                },
              });
            });
            q("[data-photo] img").forEach((element: HTMLElement) => {
              gsap.fromTo(
                element,
                { scale: 1.15 },
                {
                  scale: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: element.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                  },
                },
              );
            });
            q(".reading-progress").forEach((element: HTMLElement) =>
              gsap.to(element, {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: scope.current,
                  start: "top top",
                  end: "bottom bottom",
                  scrub: true,
                },
              }),
            );
          });
          let active = true;
          void document.fonts.ready.then(() => {
            if (active) ScrollTrigger.refresh();
          });
          const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
          revert = () => {
            active = false;
            cancelAnimationFrame(frame);
          };
        }, scope.current);
        const stop = revert;
        revert = () => {
          stop?.();
          context.revert();
        };
      },
    );
    return () => {
      cancelled = true;
      revert?.();
    };
  }, [pathname, scope]);
}
