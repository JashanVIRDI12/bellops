import type { Metadata } from "next";
import { ServicesPage } from "@/components/blocks/services-page";

export const metadata: Metadata = {
  title: "Services — PUSHWebb",
  description:
    "Six connected services — YouTube, microcontent, ad campaigns, AI automation, social media, and performance marketing — built around how brands grow today.",
};

export default function Services() {
  return <ServicesPage />;
}
