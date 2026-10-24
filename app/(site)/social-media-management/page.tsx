import { ServicePage } from "@/components/site/ServicePage";
import { serviceByHref, serviceMetadata } from "@/lib/services";

const service = serviceByHref("/social-media-management");

export const metadata = serviceMetadata(service);

export default function SocialMediaManagement() {
  return <ServicePage service={service} />;
}
