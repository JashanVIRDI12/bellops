"use client";

import { useState, useSyncExternalStore } from "react";
import { cookieNotice } from "@/lib/content";

const COOKIE = "bellops-cookie-notice";
const ONE_YEAR = 60 * 60 * 24 * 365; // seconds

const noop = () => () => {};
const seenBefore = () =>
  document.cookie.split("; ").some((entry) => entry.startsWith(`${COOKIE}=`));

/**
 * A cookie notice: shown until the visitor presses OK, then remembered for a
 * year in a cookie of its own. It doesn't change what the site stores.
 * Rendered only in the browser, since the server can't see the choice
 * without making the page dynamic.
 */
export function CookieNotice() {
  // On the server and while hydrating, assume it was seen: nothing flashes.
  const seen = useSyncExternalStore(noop, seenBefore, () => true);
  const [dismissed, setDismissed] = useState(false);
  if (seen || dismissed) return null;

  const accept = () => {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}=1; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax${secure}`;
    setDismissed(true);
  };

  return (
    <section aria-label="Cookie notice" className="cookie-notice">
      <p>{cookieNotice.text}</p>
      <button type="button" onClick={accept} className="cookie-notice-button">
        {cookieNotice.accept}
      </button>
    </section>
  );
}
