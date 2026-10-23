import type { Metadata } from "next";
import { LogoPreview } from "./view";

export const metadata: Metadata = {
  title: "Logo preview",
  robots: { index: false, follow: false },
};

export default function LogoPreviewPage() {
  return (
    <div className="h-dvh w-full bg-black">
      <LogoPreview />
    </div>
  );
}
