/**
 * Where a visit came from. The browser records the landing page's UTM tags,
 * ad click IDs and referring site once per visit; the server turns them into
 * a readable channel ("Google Ads", "Instagram", "Direct", …).
 *
 * Tag ad links with utm_source / utm_medium / utm_campaign to see campaigns
 * by name in the admin portal, e.g. ?utm_source=meta&utm_medium=paid&utm_campaign=diwali
 */

export type Visit = {
  session: string;
  referrer: string; // the referring site's host, never the full address
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  clickId: "" | "google" | "meta" | "microsoft";
};

export const emptyVisit: Visit = {
  session: "",
  referrer: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  clickId: "",
};

const text = (value: unknown, max: number) =>
  typeof value === "string"
    ? value
        .replace(/[^\p{L}\p{N} _.:/@+-]/gu, "")
        .trim()
        .slice(0, max)
    : "";

/** Cleans a visit sent from the browser; anything unexpected becomes empty. */
export function parseVisit(raw: unknown): Visit {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const session = text(input.session, 40);
  return {
    session: /^[a-zA-Z0-9-]{8,40}$/.test(session) ? session : "",
    referrer: text(input.referrer, 120).toLowerCase(),
    utmSource: text(input.utmSource, 60),
    utmMedium: text(input.utmMedium, 60),
    utmCampaign: text(input.utmCampaign, 100),
    clickId:
      (["google", "meta", "microsoft"] as const).find(
        (id) => id === input.clickId,
      ) ?? "",
  };
}

const referrerNames: [RegExp, string][] = [
  [/(^|\.)google\./, "Google Search"],
  [/(^|\.)bing\.com$/, "Bing Search"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo Search"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)facebook\.com$|^fb\.me$/, "Facebook"],
  [/^t\.co$|(^|\.)x\.com$|(^|\.)twitter\.com$/, "X (Twitter)"],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, "LinkedIn"],
  [/(^|\.)youtube\.com$|^youtu\.be$/, "YouTube"],
  [/(^|\.)whatsapp\.(com|net)$|^wa\.me$/, "WhatsApp"],
  [/(^|\.)chatgpt\.com$|^chat\.openai\.com$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
];

const sourceNames: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  fb: "Facebook",
  instagram: "Instagram",
  ig: "Instagram",
  meta: "Meta",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  twitter: "X (Twitter)",
  x: "X (Twitter)",
  bing: "Bing",
  email: "Email",
  newsletter: "Newsletter",
};

const titleCase = (value: string) =>
  value.replace(
    /(^|[\s_-])(\p{L})/gu,
    (_, gap: string, letter: string) =>
      `${gap === "_" || gap === "-" ? " " : gap}${letter.toUpperCase()}`,
  );

/** The channel shown in the admin portal, plus the campaign if tagged. */
export function channelFor(visit: Visit) {
  const source = visit.utmSource.toLowerCase();
  const medium = visit.utmMedium.toLowerCase();
  const paid = /cpc|ppc|paid|^ads?$|display|cpm|sponsored/.test(medium);
  let channel: string;

  if (visit.clickId === "google" || (source.includes("google") && paid))
    channel = "Google Ads";
  else if (
    visit.clickId === "microsoft" ||
    (/bing|microsoft/.test(source) && paid)
  )
    channel = "Microsoft Ads";
  else if (/facebook|instagram|^fb$|^ig$|meta/.test(source) && paid)
    channel = "Meta Ads";
  else if (source) channel = sourceNames[source] ?? titleCase(source);
  // Facebook and Instagram add an fbclid to every outgoing link, ad or not.
  else if (visit.clickId === "meta") channel = "Facebook / Instagram";
  else if (visit.referrer)
    channel =
      referrerNames.find(([pattern]) => pattern.test(visit.referrer))?.[1] ??
      visit.referrer.replace(/^www\./, "");
  else channel = "Direct";

  return {
    source: channel.slice(0, 60),
    medium: visit.utmMedium,
    campaign: visit.utmCampaign,
  };
}
