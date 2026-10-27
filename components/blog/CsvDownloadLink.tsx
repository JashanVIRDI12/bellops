"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/track";

/**
 * A data file's download link in a post. The click reports
 * blog_csv_download {post, file} to Google Analytics (by beacon, so it
 * arrives even as the download starts).
 */
export function CsvDownloadLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      download
      onClick={() =>
        track("blog_csv_download", {
          post: window.location.pathname.split("/").filter(Boolean).pop() ?? "",
          file: href.split("/").pop() ?? href,
        })
      }
    >
      {children}
    </a>
  );
}
