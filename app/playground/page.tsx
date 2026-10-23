import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HeroOrb } from "@/components/three/HeroOrb";
import { WorkShowcase } from "@/components/three/WorkShowcase";

export const metadata: Metadata = {
  title: "Playground",
  robots: { index: false, follow: false },
};

/** Preview page for the 3D components. Not linked from the site. */
export default function PlaygroundPage() {
  return (
    <main className="min-h-svh bg-[#0A0A0F] text-zinc-100">
      <section className="relative h-svh">
        <HeroOrb />
        <Label>HeroOrb</Label>
      </section>

      <section className="relative">
        <div className="px-6 pt-24 md:px-12">
          <Label static>WorkShowcase · scroll</Label>
        </div>
        <WorkShowcase />
      </section>

      <div className="h-[50svh]" />
    </main>
  );
}

function Label({
  children,
  static: isStatic = false,
}: {
  children: ReactNode;
  static?: boolean;
}) {
  return (
    <p
      className={
        (isStatic ? "" : "absolute top-6 left-6 ") +
        "font-mono text-xs tracking-[0.2em] text-zinc-400 uppercase md:left-12"
      }
    >
      {children}
    </p>
  );
}
