import { ServicePage } from "@/components/site/ServicePage";
import { serviceByHref, serviceMetadata } from "@/lib/services";

const service = serviceByHref("/landing-pages");

export const metadata = serviceMetadata(service);

export default function LandingPages() {
  return <ServicePage service={service} />;
}
