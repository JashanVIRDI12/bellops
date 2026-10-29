/**
 * The next page's outline while it loads (RouteProgress shows it when a
 * navigation is slow): the page's frame in the site's colours, with blocks
 * where its heading and text will be. Pages are prerendered and
 * prefetched, so it's rarely on screen for long.
 *
 * `hero` for pages that open on a studio window (the full-height hero), such
 * as /work and /3d-website-design; without it, a page that opens on a title
 * (the blog, case studies, the rest).
 */
export function PageSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <div className="page-skeleton" aria-busy="true">
      <p className="sr-only" role="status">
        Loading…
      </p>
      <div className={hero ? "hero page-skeleton-hero" : "wrap case-intro"}>
        <div className={hero ? "wrap hero-copy" : undefined}>
          <span className="skeleton skeleton-crumbs" />
          <span className="skeleton skeleton-title" />
          <span className="skeleton skeleton-title skeleton-short" />
          <span className="skeleton skeleton-line" />
          <span className="skeleton skeleton-line skeleton-short" />
        </div>
      </div>
      {!hero && (
        <div className="wrap page-skeleton-body block">
          <span className="skeleton skeleton-line" />
          <span className="skeleton skeleton-line" />
          <span className="skeleton skeleton-line skeleton-short" />
        </div>
      )}
    </div>
  );
}
