"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { servicePages, workPage } from "@/lib/content";

/** The inner pages' links. Phones show Work and Contact; the services are in the footer. */
const links = [
  { href: workPage.path, label: "Work", always: true },
  { href: servicePages.premium.path, label: servicePages.premium.navLabel },
  { href: servicePages.landing.path, label: servicePages.landing.navLabel },
  { href: "/#contact", label: "Contact", always: true },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex gap-5 text-sm font-semibold md:gap-8">
        {links.map((link) => {
          const current =
            pathname === link.href ||
            (link.href !== "/#contact" && pathname.startsWith(`${link.href}/`));
          return (
            <li
              key={link.href}
              className={link.always ? "" : "hidden md:block"}
            >
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className="text-white/75 transition-colors hover:text-white aria-[current=page]:text-white"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
