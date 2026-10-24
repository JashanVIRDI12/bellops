import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";
import { SiteNav } from "./SiteNav";

/** The inner pages' header: the wordmark home, and the main links. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link
        href="/"
        aria-label={`${site.name} home`}
        className="shrink-0 focus-visible:outline-white"
      >
        <Image
          src="/brand/bellops-wordmark-transparent.png"
          alt={site.name}
          width={984}
          height={304}
          sizes="(min-width: 768px) 112px, 96px"
          preload
          className="h-auto w-24 md:w-28"
        />
      </Link>
      <SiteNav />
    </header>
  );
}
