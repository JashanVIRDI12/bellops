import { DraftPage, draftMetadata } from "@/components/site/DraftPage";
import { draftPage } from "@/lib/drafts";

// A scaffold waiting for its copy: see lib/drafts.ts.
const page = draftPage("/three-js-development");

export const metadata = draftMetadata(page);

export default function ThreeJsDevelopment() {
  return <DraftPage page={page} />;
}
