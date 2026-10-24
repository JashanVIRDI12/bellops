import { ServicePage } from "@/components/site/ServicePage";
import { serviceByHref, serviceMetadata } from "@/lib/services";

const service = serviceByHref("/google-meta-ads");

export const metadata = serviceMetadata(service);

export default function GoogleMetaAds() {
  return <ServicePage service={service} />;
}
