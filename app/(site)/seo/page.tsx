import { ServicePage } from "@/components/site/ServicePage";
import { serviceByHref, serviceMetadata } from "@/lib/services";

const service = serviceByHref("/seo");

export const metadata = serviceMetadata(service);

export default function Seo() {
  return <ServicePage service={service} />;
}
