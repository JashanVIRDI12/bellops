import { ServicePage } from "@/components/site/ServicePage";
import { serviceByHref, serviceMetadata } from "@/lib/services";

const service = serviceByHref("/seo-services");

export const metadata = serviceMetadata(service);

export default function SeoServices() {
  return <ServicePage service={service} />;
}
