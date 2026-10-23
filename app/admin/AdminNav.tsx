"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Enquiries" },
  { href: "/admin/analytics", label: "Analytics" },
];

/** The portal's sections. Hidden on the sign-in page. */
export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;
  return (
    <nav aria-label="Admin" className="flex gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className="admin-tab"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
