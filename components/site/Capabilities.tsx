"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/contact/icons";
import { services, site, type Service } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { formatPrice } from "@/lib/pricing";
import { Arrow } from "./Arrow";

/** "Landing pages" -> "landing pages"; names like Google or SEO stay as they are. */
const midSentence = (title: string) =>
  /^[A-Z][a-z]/.test(title) && !title.startsWith("Google")
    ? title[0]!.toLowerCase() + title.slice(1)
    : title;

export function Capabilities({
  items = services.items,
}: {
  items?: readonly Service[];
}) {
  const [selected, setSelected] = useState(items[0]?.href);
  return (
    <div className="capabilities">
      <div className="capabilities-visual">
        <div className="capabilities-photo" aria-hidden="true">
          {items.map((item) => (
            <Image
              key={item.href}
              src={item.navImage}
              alt=""
              width={960}
              height={600}
              sizes="(min-width: 900px) 40vw, 90vw"
              data-active={selected === item.href || undefined}
              loading="lazy"
            />
          ))}
          <span className="photo-corner">The work behind the work.</span>
        </div>
        <p className="capabilities-caption">
          <span>Strategy to launch. And beyond.</span>
          <span>BellOps / Services</span>
        </p>
      </div>
      <ul className="capabilities-list">
        {items.map((item, index) => (
          <li key={item.href} data-active={selected === item.href || undefined}>
            <Link
              href={item.href}
              onPointerEnter={() => setSelected(item.href)}
              onFocus={() => setSelected(item.href)}
            >
              <span className="capability-number">0{index + 1}</span>
              <div className="capability-copy">
                <h3>{item.nav}</h3>
                <span>{item.body}</span>
                <span className="capability-price">
                  {formatPrice(item.price)}
                </span>
              </div>
              <span className="capability-arrow">
                <Arrow diagonal />
              </span>
            </Link>
            <a
              href={whatsappHref(
                site.whatsapp,
                services.whatsappMessage.replace(
                  "{service}",
                  midSentence(item.title),
                ),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="capability-whatsapp"
              data-track={`whatsapp-service${item.href.replace("/", "-")}`}
              data-ga-location="service_card"
            >
              <WhatsAppIcon size={15} />
              <span className="sr-only">
                Ask about {item.title} on WhatsApp (opens in a new tab)
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
