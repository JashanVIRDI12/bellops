"use client";

import type { ComponentProps } from "react";
import { scrollToSection } from "./scroll-control";

/** An in-page link that glides with the smooth scroll; without JS it still jumps. */
export function GlideLink({
  to,
  ...props
}: Omit<ComponentProps<"a">, "href" | "onClick"> & { to: string }) {
  return (
    <a
      href={`#${to}`}
      onClick={(event) => {
        event.preventDefault();
        scrollToSection(to);
        history.replaceState(null, "", `#${to}`);
      }}
      {...props}
    />
  );
}
