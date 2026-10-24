import { ServicePage } from "@/components/site/ServicePage";
import { serviceByHref, serviceMetadata } from "@/lib/services";

const service = serviceByHref("/premium-website-design");

export const metadata = serviceMetadata(service);

export default function PremiumWebsiteDesign() {
  return <ServicePage service={service} />;
}
