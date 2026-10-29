/*
 * Data files that posts publish, as schema.org Dataset (lib/schema.ts), for
 * posts whose frontmatter has no `dataset:` block. The release's posts are
 * copied into content/blog exactly as delivered, so the speed study's data
 * description lives here, keyed by slug. A post's own `dataset:` frontmatter
 * wins over an entry here. scripts/blog-index.mjs checks the file exists.
 *
 * Every fact below is from the post's own text (methodology, caveats and
 * FAQ) and the CSV's columns: nothing added.
 */

export const postDatasets = {
  "indian-d2c-website-speed-study": {
    name: "Bellops Indian D2C mobile speed study: homepage lab medians",
    description:
      "Median of 3 Lighthouse 12.8.2 lab runs (mobile emulation, simulated Slow 4G) on the homepages of 50 Indian D2C brands, tested 27 Oct 2026 from a Toronto server, so absolute times are pessimistic for users in India. Per brand: LCP, TBT, CLS, Performance score, transfer size, request count, FCP, TTFB and Speed Index. 49 brands are ranked by median LCP; Yoga Bar is listed but unranked (NO_LCP). Lab data, not CrUX field data.",
    file: "/blog/d2c-speed-study/bellops-d2c-mobile-speed-50.csv",
    measurementTechnique:
      "Lighthouse 12.8.2 lab test, mobile emulation, simulated Slow 4G; median of 3 runs; run from Toronto",
    temporalCoverage: "2026-10-27",
    variableMeasured: [
      "Largest Contentful Paint (LCP, ms)",
      "Total Blocking Time (TBT, ms)",
      "Cumulative Layout Shift (CLS)",
      "Lighthouse Performance score",
      "Transfer size (KB)",
      "Request count",
      "First Contentful Paint (FCP, ms)",
      "Time to First Byte (TTFB, ms)",
      "Speed Index (ms)",
    ],
  },
};
