import { ServicePage } from "@/components/site/ServicePage";
import { serviceByHref, serviceMetadata } from "@/lib/services";

const service = serviceByHref("/branding");

export const metadata = serviceMetadata(service);

export default function Branding() {
  return <ServicePage service={service} />;
}
