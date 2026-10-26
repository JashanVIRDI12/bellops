"use client";

import { chapters, site } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { WhatsAppIcon } from "@/components/contact/icons";
import { useBeat } from "./store";

const LAST_BEAT = chapters.reduce((sum, chapter) => sum + chapter.beats, 0) - 1;

/**
 * WhatsApp, one tap away during the tour. It steps aside on the opening scene
 * and the contact section, which have their own buttons.
 */
export function ContactDock() {
  const beat = useBeat();
  return (
    <div
      className="contact-dock"
      data-ga-location="floating"
      data-state={beat === 0 || beat >= LAST_BEAT ? "hidden" : undefined}
    >
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-dock-whatsapp"
        data-track="whatsapp-dock"
      >
        <WhatsAppIcon size={20} />
        <span className="contact-dock-label">WhatsApp</span>
        <span className="sr-only"> {site.name} (opens in a new tab)</span>
      </a>
    </div>
  );
}
