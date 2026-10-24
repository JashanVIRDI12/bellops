import { ServicePage } from "@/components/site/ServicePage";
import { serviceByHref, serviceMetadata } from "@/lib/services";

const service = serviceByHref("/website-care-plans");

export const metadata = serviceMetadata(service);

export default function WebsiteCarePlans() {
  return <ServicePage service={service} />;
}
