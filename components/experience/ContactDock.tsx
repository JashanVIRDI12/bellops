"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { WhatsAppIcon } from "@/components/contact/icons";

/**
 * WhatsApp, one tap away on phones, on every public page: a round button in
 * the bottom-right corner with a quote request typed in. Wider screens don't
 * show it. It steps aside while the home page's contact section is on screen,
 * so it never covers the form.
 */
export function ContactDock() {
  const [contactShown, setContactShown] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!contact) return;
    const observer = new IntersectionObserver(([entry]) =>
      setContactShown(entry?.isIntersecting ?? false),
    );
    observer.observe(contact);
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
