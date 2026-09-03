import type { Metadata } from "next";
import { ContactPage } from "@/components/blocks/contact-page";

export const metadata: Metadata = {
  title: "Contact — PUSHWebb",
  description: "Start a conversation with PUSHWebb about YouTube, short-form content, ad campaigns, or AI automation for your brand.",
};

export default function Contact() {
  return <ContactPage />;
}
