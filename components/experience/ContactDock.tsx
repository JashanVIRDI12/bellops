"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { WhatsAppIcon } from "@/components/contact/icons";

/**
 * WhatsApp, one tap away on phones, on every public page: a round button in
 * the bottom-right corner with a quote request typed in. Wider screens don't
 * show it. On the home page it steps aside during the opening scene and the
 * contact section, which have WhatsApp buttons of their own, so it never
 * covers the hero's links or the form.
 */
export function ContactDock() {
  const [contactShown, setContactShown] = useState(false);

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

  return (
    <div
      className="contact-dock"
      data-ga-location="floating"
      data-state={contactShown ? "hidden" : undefined}
    >
      <a
        href={whatsappHref(site.whatsapp, site.whatsappQuote)}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-dock-whatsapp"
        data-track="whatsapp-dock"
      >
        <WhatsAppIcon size={20} />
        <span className="sr-only">
          WhatsApp {site.name} for a quote (opens in a new tab)
        </span>
      </a>
    </div>
  );
}
