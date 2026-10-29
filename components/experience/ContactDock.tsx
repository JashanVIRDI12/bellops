"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { WhatsAppIcon } from "@/components/contact/icons";
import {
  DOCK_EXPERIMENT_ID,
  readDockVariant,
  type DockVariant,
} from "@/lib/ab";
import { site } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { withGtag } from "@/lib/track";

/** "Hi Bellops, I'd like a quote for my project." to the studio's number. */
const href = whatsappHref(site.whatsapp, site.whatsappQuote);

/** The cookie doesn't change during a visit: nothing to subscribe to. */
const noSubscription = () => () => {};

/**
 * A GA4 event for the dock experiment, by beacon. Sent on load too, so it
 * may wait for Google's tag (lib/track.ts).
 */
const send = (name: string, params: Record<string, string>) =>
  withGtag((gtag) =>
    gtag("event", name, {
      ...params,
      experiment_id: DOCK_EXPERIMENT_ID,
      transport_type: "beacon",
    }),
  );

/**
 * WhatsApp, one tap away on phones, on every public page, in the bottom-right
 * corner with a quote request typed in. Wider screens don't show it. On the
 * home page it steps aside during the opening scene and the contact section,
 * which have WhatsApp buttons of their own, so it never covers the hero's
 * links or the form.
 *
 * A/B test dock_pill_v1 (AB_TEST_DOCK.md, lib/ab.ts): half the visitors get a
 * "Get a quote" pill, half the 52px icon, by the ab_dock cookie proxy.ts
 * sets. Each page view sends experiment_impression (and the ab_dock user
 * property); a tap sends dock_click. The site-wide WhatsApp listener skips
 * the dock (data-variant), so a tap isn't counted twice.
 */
export function ContactDock() {
  // The cookie, read in the browser only: the server renders no dock.
  const variant = useSyncExternalStore<DockVariant | null>(
    noSubscription,
    readDockVariant,
    () => null,
  );
  const [contactShown, setContactShown] = useState(false);

  useEffect(() => {
    if (!variant) return;
    // Next tick, so a remount (React's development checks) sends it once.
    const timer = window.setTimeout(() => {
      // The user property first, so the impression carries it.
      withGtag((gtag) => gtag("set", "user_properties", { ab_dock: variant }));
      send("experiment_impression", { variant });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [variant]);

  useEffect(() => {
    const sections = ["intro", "contact"]
      .map((id) => document.getElementById(id))
      .filter((section) => section !== null);
    if (!sections.length) return;
    const shown = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) shown.add(entry.target);
        else shown.delete(entry.target);
      }
      setContactShown(shown.size > 0);
    });
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!variant) return null;
  const onClick = () =>
    send("dock_click", { variant, location: "whatsapp-dock" });
  const base =
    "contact-dock-link bg-[#25D366] text-black shadow-lg rounded-full h-[52px]";

  return (
    <div
      className="contact-dock"
      data-ga-location="floating"
      data-state={contactShown ? "hidden" : undefined}
    >
      {variant === "pill" ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-track="whatsapp-dock"
          data-variant="pill"
          onClick={onClick}
          className={`${base} flex items-center gap-2 px-5 text-sm font-bold`}
          aria-label="Get a quote on WhatsApp"
        >
          <WhatsAppIcon size={20} />
          <span>Get a quote</span>
        </a>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-track="whatsapp-dock"
          data-variant="icon"
          onClick={onClick}
          className={`${base} flex w-[52px] items-center justify-center`}
          aria-label="Chat with Bellops on WhatsApp"
        >
          <WhatsAppIcon size={24} />
        </a>
      )}
    </div>
  );
}
