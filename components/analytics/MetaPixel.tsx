"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackingAllowed } from "@/lib/analytics/client";
import { initializeMeta, trackMeta } from "@/lib/analytics/meta";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/** Stays off until a real pixel is configured; the privacy page is deferred. */
export function MetaPixel() {
  const pathname = usePathname();
  useEffect(() => {
    if (!/^\d+$/.test(PIXEL_ID) || pathname.startsWith("/admin")) return;
    if (!trackingAllowed()) return;
    if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return;
    initializeMeta(PIXEL_ID);
    trackMeta("PageView");
    // One delegated listener covers WhatsApp on every public route.
    const onContact = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.(
        'a[href^="https://wa.me/"]',
      );
      if (link)
        trackMeta("Contact", {
          content_name: link.getAttribute("data-track") ?? "whatsapp",
        });
    };
    document.addEventListener("click", onContact, { capture: true });
    return () =>
      document.removeEventListener("click", onContact, { capture: true });
  }, [pathname]);
  return null;
}
