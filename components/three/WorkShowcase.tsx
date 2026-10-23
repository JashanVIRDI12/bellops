"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { projects as defaultProjects, type WorkProject } from "@/lib/work";
import { SceneErrorBoundary } from "./utils/SceneErrorBoundary";
import { cx } from "./utils/cx";
import { use3DSupport, type RenderMode } from "./utils/use3DSupport";
import { useInView } from "./utils/useInView";
import { usePrefersReducedMotion } from "./utils/usePrefersReducedMotion";

// three.js and drei load in their own chunk, only once the section is close
// to the viewport on a capable device.
const WorkShowcaseScene = dynamic(() => import("./scenes/WorkShowcaseScene"), {
  ssr: false,
});

export type WorkShowcaseProps = {
  /** Defaults to the projects in lib/work.ts. */
  projects?: readonly WorkProject[];
  /** Gentle idle bob on the devices. Off = the canvas only renders while you scroll or hover. */
  float?: boolean;
  /** "auto" (default), or force "3d" / "fallback" for testing. */
  mode?: RenderMode;
  className?: string;
};

/**
 * Scroll-driven project showcase: one screen-height of scroll per project.
 * The 3D devices sit in a sticky layer behind real, focusable captions and links,
 * so keyboard and screen-reader users get the same content.
 */
export function WorkShowcase({
  projects = defaultProjects,
  float = true,
  mode = "auto",
  className,
}: WorkShowcaseProps) {
  const section = useRef<HTMLDivElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  // Preload half a screen early so textures are ready when it scrolls in.
  const { inView, hasEntered } = useInView(section, "50% 0px");
  const decision = use3DSupport(mode);
  const reducedMotion = usePrefersReducedMotion();

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => setFailed(true), []);
  // A click on the 3D devices follows the same link as the caption.
  const openProject = useCallback((index: number) => {
    links.current[index]?.click();
  }, []);

  const mount3D = decision === "3d" && hasEntered && !failed;
  const showStatic = decision === "fallback" || failed;

  return (
    <div ref={section} className={cx("relative", className)}>
      {mount3D && (
        <div aria-hidden className="absolute inset-0">
          <div
            className={cx(
              "sticky top-0 h-svh transition-opacity duration-700 ease-out",
              ready ? "opacity-100" : "opacity-0",
            )}
          >
            <SceneErrorBoundary onError={markFailed}>
              <WorkShowcaseScene
                projects={projects}
                scrollTarget={section}
                active={inView}
                reducedMotion={reducedMotion}
                float={float}
                onOpen={openProject}
                onReady={markReady}
                onContextLost={markFailed}
              />
            </SceneErrorBoundary>
          </div>
        </div>
      )}

      <ol className="relative">
        {projects.map((project, index) => (
          <li
            key={project.slug}
            className={cx(
              // Pointer events pass through to the canvas, except on the caption.
              "pointer-events-none flex min-h-svh flex-col px-6 md:px-12",
              showStatic
                ? "justify-center gap-14 py-16"
                : "justify-end pb-12 md:pb-16",
            )}
          >
            {showStatic && <StaticDevices project={project} />}

            <div className="pointer-events-auto max-w-md">
              <p className="text-xs tracking-[0.2em] text-zinc-400 uppercase">
                <span className="text-[#7B5CFF]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span aria-hidden className="mx-2 text-zinc-600">
                  /
                </span>
                {project.client}
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-tight text-balance text-zinc-100 md:text-3xl">
                {project.title}
              </h3>
              <ProjectLink
                href={project.url}
                linkRef={(element) => {
                  links.current[index] = element;
                }}
              >
                View project
                <span className="sr-only">: {project.client}</span>
              </ProjectLink>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Flat screenshots for phones, low-end devices and anything without WebGL. */
function StaticDevices({ project }: { project: WorkProject }) {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10">
        <Image
          src={project.image}
          alt={`${project.client} website on desktop`}
          fill
          sizes="(max-width: 896px) 92vw, 56rem"
          className="object-cover"
        />
      </div>
      <div className="absolute right-4 -bottom-8 aspect-9/19.5 w-[22%] max-w-40 overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl ring-1 shadow-black/60 ring-white/15 md:right-10">
        <Image
          src={project.mobileImage}
          alt={`${project.client} website on mobile`}
          fill
          sizes="(max-width: 768px) 22vw, 10rem"
          className="object-cover"
        />
      </div>
    </div>
  );
}

const linkClass =
  "mt-5 inline-flex items-center gap-2 text-sm text-zinc-200 underline decoration-[#7B5CFF]/60 underline-offset-4 transition-colors hover:text-white hover:decoration-[#7B5CFF] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7B5CFF]";

function ProjectLink({
  href,
  linkRef,
  children,
}: {
  href: string;
  linkRef: (element: HTMLAnchorElement | null) => void;
  children: ReactNode;
}) {
  // Site paths use client-side navigation; full URLs open in a new tab.
  if (href.startsWith("/")) {
    return (
      <Link ref={linkRef} href={href} className={linkClass}>
        {children}
        <span aria-hidden>→</span>
      </Link>
    );
  }

  return (
    <a
      ref={linkRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {children}
      <span aria-hidden>↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
