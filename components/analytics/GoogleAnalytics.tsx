"use client";

import { GoogleAnalytics as GoogleTag } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackClick } from "@/lib/track";

/**
 * Google Analytics 4 on every page: Google's tag (gtag.js) through
 * @next/third-parties, rendered once from the root layout, so every route
 * has it (route groups, the blog, 404s). The tag's address is in each page's
 * HTML (a preload), and gtag.js runs after the page has hydrated. The first
 * page view is sent by the tag's config; later ones come from GA4's
 * enhanced measurement (history changes), which is on by default.
 *
 * Not on /admin: the admin pages show enquiries, and no third-party script
 * runs next to them.
 */
export function GoogleAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const admin = pathname?.startsWith("/admin") ?? false;

  // One listener for the whole site: WhatsApp, phone and email links and the
  // calls to action (lib/track.ts).
  useEffect(() => {
    if (admin) return;
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest?.("a, button");
      if (target) trackClick(target);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [admin]);

  return admin ? null : <GoogleTag gaId={gaId} />;
}
