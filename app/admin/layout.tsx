import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "./AdminNav";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** The admin portal's frame. Pages check the session themselves. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin">
      <header className="admin-bar">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/brand/bellops-wordmark-transparent.png"
            alt="Bellops"
            width={984}
            height={304}
            sizes="96px"
            className="h-auto w-24"
          />
          <span className="text-sm font-semibold text-white/60">Admin</span>
        </Link>
        <AdminNav />
        <Link href="/" prefetch={false} className="admin-quiet-link">
          View website
        </Link>
      </header>
      {children}
    </div>
  );
}
