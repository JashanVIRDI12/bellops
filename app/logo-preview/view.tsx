"use client";

import dynamic from "next/dynamic";

const Logo3D = dynamic(
  () => import("@/components/Logo3D").then((mod) => mod.Logo3D),
  { ssr: false },
);

export function LogoPreview() {
  return <Logo3D />;
}
