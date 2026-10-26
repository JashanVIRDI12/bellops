"use client";

import { useRef } from "react";
import { Tracker } from "@/components/analytics/Tracker";
import { projects } from "@/lib/work";
import { Chapters } from "./Chapters";
import { ContactDock } from "./ContactDock";
import { CookieNotice } from "./CookieNotice";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { SmoothScroll } from "./SmoothScroll";
import { Stage } from "./Stage";
import { useBeatTracker } from "./useBeatTracker";
import { useStudioMotion } from "@/components/site/useStudioMotion";

/**
 * The home page: a scroll-driven walk through the Bellops studio, shown in the
 * visitor's own time of day and weather.
 * The page scrolls normally; a fixed stage behind it plays the camera shot
 * that matches each section. `main` has no z-index on purpose: a stacking
 * context there would stop the intro headline blending with the stage.
 */
export function Experience() {
  const content = useRef<HTMLElement>(null);
  useBeatTracker(content);
  useStudioMotion(content);

  return (
    <>
      <SmoothScroll />
      <Stage projects={projects} />
      <SiteHeader variant="tour" />
      <main id="main" ref={content} className="studio-experience relative">
        <div className="reading-progress" aria-hidden="true" />
        <Chapters />
      </main>
      <ContactDock />
      <CookieNotice />
      <Tracker />
      <div aria-hidden className="grain" />
    </>
  );
}
