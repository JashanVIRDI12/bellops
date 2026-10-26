import { DraftPage, draftMetadata } from "@/components/site/DraftPage";
import { draftPage } from "@/lib/drafts";

// A scaffold waiting for its copy: see lib/drafts.ts.
const page = draftPage("/3d-product-configurator");

export const metadata = draftMetadata(page);

export default function ProductConfigurator() {
  return <DraftPage page={page} />;
}
