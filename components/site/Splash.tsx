import Image from "next/image";

/** sessionStorage key: the intro plays once per tab session. */
const SEEN_KEY = "bellops_intro_seen";

/*
 * Decides before the first paint (it runs as the page is parsed, before any
 * content below it), so the intro is either there from the first frame or
 * not at all: the page never flashes up and then gets covered. Skipped when
 * it already played in this tab, with reduced motion, for crawlers, on
 * /admin, and when sessionStorage is unavailable (it couldn't play just
 * once).
 */
const decide = `(function(){try{var s=sessionStorage,e=document.getElementById("splash");if(!e||s.getItem("${SEEN_KEY}"))return;s.setItem("${SEEN_KEY}","1");if(matchMedia("(prefers-reduced-motion: reduce)").matches||/bot|crawl|spider|slurp/i.test(navigator.userAgent)||location.pathname.indexOf("/admin")===0)return;e.setAttribute("data-play","")}catch(_){}})()`;

/**
 * The first-visit intro (CLAUDE_TASKS_LOADER.md): the Bellops wordmark and a
 * thin progress line on the night ground, for 1.2 s, then a 300 ms fade.
 *
 * Not rendered at the moment (app/layout.tsx): in Lighthouse's mobile runs
 * it added about 1 s of Speed Index on every page and nudged the home
 * page's LCP above its baseline, the release plan's limit. To use it,
 * render <Splash /> first in the root layout's <body>.
 *
 * - Timing is CSS only (app/globals.css, .splash), so the intro ends on time
 *   even while JavaScript is still loading, and it never takes taps
 *   (pointer-events: none): the page underneath is usable at once.
 * - The page is rendered and painted underneath as usual; the overlay is
 *   decorative (aria-hidden) and off without JavaScript, so crawlers and
 *   screen readers get the page itself.
 * - The wordmark is the header's own image with the header's `sizes`, so it
 *   is the same file and download.
 */
export function Splash() {
  return (
    <>
      {/* The script below adds data-play before React hydrates. */}
      <div
        id="splash"
        className="splash"
        aria-hidden="true"
        suppressHydrationWarning
      >
        <Image
          src="/brand/bellops-wordmark-transparent.png"
          alt=""
          width={112}
          height={35}
          // Must match components/nav/SiteHeader.tsx: one file for both.
          sizes="(min-width: 768px) 112px, (min-width: 360px) 96px, 80px"
          loading="eager"
          className="splash-logo"
        />
        <span className="splash-line" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: decide }} />
    </>
  );
}
