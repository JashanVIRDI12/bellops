import type { Metadata } from "next";
import { ServicePage } from "@/components/site/ServicePage";
import { servicePages } from "@/lib/content";
import { shareMetadata } from "@/lib/seo";

const page = servicePages.premium;

export const metadata: Metadata = {
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: page.path },
  ...shareMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
  }),
};

export default function PremiumWebsiteDesign() {
  return (
    <ServicePage
      page={page}
      related={["Landing pages", "SEO & speed optimization"]}
    />
  );
}
