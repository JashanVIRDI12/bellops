import type { Metadata } from "next";
import { LogoPreview } from "./view";

export const metadata: Metadata = {
  title: "Logo preview",
};

export default function LogoPreviewPage() {
  return (
    <div className="h-dvh w-full bg-black">
      <LogoPreview />
    </div>
  );
}
