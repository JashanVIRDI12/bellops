"use client";

import { type RefObject } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Route-scoped motion. MatchMedia reverts everything when motion is disabled. */
export function useStudioMotion(scope: RefObject<HTMLElement | null>) {
  const pathname = usePathname();
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(scope);
        if (q(".hero-line").length) {
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(q(".hero-line > span"), {
              yPercent: 115,
              rotate: 3,
              duration: 1.15,
              stagger: 0.14,
            })
            .from(
              q(".hero-intro"),
              { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 },
              0.35,
            )
            .from(
              q(".hero-art"),
              { y: 70, opacity: 0, rotate: 0, duration: 1.1, stagger: 0.12 },
              0.25,
            );
          gsap.to(q(".hero-composition"), {
            yPercent: -12,
            ease: "none",
            scrollTrigger: {
              trigger: q(".tour-hero")[0],
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
        q(
          "[data-enter], .site-page .block-head, .site-page .included li, .site-page .process-step, .site-page .showcase-item",
        ).forEach((element: HTMLElement) => {
          gsap.from(element, {
            y: 38,
            opacity: 0,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 94%", once: true },
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
        if (q(".manifesto-word").length) {
          gsap.fromTo(
            q(".manifesto-word"),
            { opacity: 0.2 },
            {
              opacity: 1,
              stagger: 0.08,
              ease: "none",
              scrollTrigger: {
                trigger: q(".story-manifesto")[0],
                start: "top 85%",
                end: "bottom 50%",
                scrub: 0.5,
              },
            },
          );
        }
        q("[data-project-image]").forEach((element: HTMLElement) => {
          gsap.fromTo(
            element,
            { scale: 0.9, rotate: 2, y: 35 },
            {
              scale: 1,
              rotate: -3,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: element.closest(".tour-project"),
                start: "top 85%",
                end: "top 5%",
                scrub: 1,
              },
            },
          );
        });
        q("[data-project-phone]").forEach((element: HTMLElement) => {
          gsap.fromTo(
            element,
            { y: 40, rotate: 10 },
            {
              y: -15,
              rotate: 3,
              ease: "none",
              scrollTrigger: {
                trigger: element.closest(".tour-project"),
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        });
        if (q(".method-orbit").length)
          gsap.to(q(".method-orbit"), {
            rotation: 130,
            ease: "none",
            scrollTrigger: {
              trigger: q(".studio-approach")[0],
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        q(".ticker-track").forEach((track: HTMLElement) => {
          gsap.to(track, {
            xPercent: -50,
            duration: 32,
            repeat: -1,
            ease: "none",
            scrollTrigger: {
              trigger: track.parentElement,
              start: "top bottom",
              end: "bottom top",
              toggleActions: "play pause resume pause",
            },
          });
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
      media.add(
        "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
        () => {
          const cleanups: (() => void)[] = [];
          scope.current
            ?.querySelectorAll<HTMLElement>("[data-magnetic]")
            .forEach((element) => {
              const xTo = gsap.quickTo(element, "x", {
                duration: 0.45,
                ease: "power3.out",
              });
              const yTo = gsap.quickTo(element, "y", {
                duration: 0.45,
                ease: "power3.out",
              });
              const move = (event: PointerEvent) => {
                const rect = element.getBoundingClientRect();
                xTo((event.clientX - rect.left - rect.width / 2) * 0.15);
                yTo((event.clientY - rect.top - rect.height / 2) * 0.15);
              };
              const leave = () => {
                xTo(0);
                yTo(0);
              };
              element.addEventListener("pointermove", move);
              element.addEventListener("pointerleave", leave);
              cleanups.push(() => {
                element.removeEventListener("pointermove", move);
                element.removeEventListener("pointerleave", leave);
              });
            });
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );
      let active = true;
      void document.fonts.ready.then(() => {
        if (active) ScrollTrigger.refresh();
      });
      const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        active = false;
        cancelAnimationFrame(frame);
        media.revert();
      };
    },
    { scope, dependencies: [pathname], revertOnUpdate: true },
  );
}
