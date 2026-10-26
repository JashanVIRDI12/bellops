"use client";
import { useRef, type ReactNode } from "react";
import { useStudioMotion } from "./useStudioMotion";

export function SiteMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useStudioMotion(root);
  return (
    <div ref={root} className="site-page">
      <div className="reading-progress" aria-hidden="true" />
      {children}
    </div>
  );
}
