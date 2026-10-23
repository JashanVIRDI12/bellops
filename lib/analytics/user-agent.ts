/** A rough device, browser and system from the browser's user agent. */
export function describeDevice(ua: string) {
  const device = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua)
    ? "Tablet"
    : /Mobi|iPhone|iPod|Android/i.test(ua)
      ? "Mobile"
      : "Desktop";

  // In-app browsers first: they also claim to be Chrome or Safari.
  const browser = /Instagram/i.test(ua)
    ? "Instagram app"
    : /FBAN|FBAV|FB_IAB/i.test(ua)
      ? "Facebook app"
      : /LinkedInApp/i.test(ua)
        ? "LinkedIn app"
        : /Edg(A|iOS)?\//.test(ua)
          ? "Edge"
          : /OPR\/|Opera/.test(ua)
            ? "Opera"
            : /SamsungBrowser/.test(ua)
              ? "Samsung Internet"
              : /Firefox\/|FxiOS/.test(ua)
                ? "Firefox"
                : /Chrome\/|CriOS/.test(ua)
                  ? "Chrome"
                  : /Safari\//.test(ua)
                    ? "Safari"
                    : "Other";

  const os = /iPhone|iPad|iPod/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /CrOS/.test(ua)
          ? "ChromeOS"
          : /Mac OS X|Macintosh/.test(ua)
            ? "macOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Other";

  return { device, browser, os };
}

/**
 * Crawlers, link previews, monitors and scripts. Every real browser's user
 * agent starts with "Mozilla/"; well-behaved bots that also do are named here.
 */
export function isBot(ua: string) {
  return (
    !ua.startsWith("Mozilla/") ||
    /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|phantom|selenium|puppeteer|playwright/i.test(
      ua,
    )
  );
}
