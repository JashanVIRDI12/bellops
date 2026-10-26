import Image from "next/image";
import { clients } from "@/lib/clients";

/**
 * The brands we've worked with, as one-colour logos in a row. Logos only:
 * quotes join once clients have approved real ones.
 */
export function ProofStrip() {
  return (
    <section aria-labelledby="clients" className="proof-strip paper-section">
      <div className="studio-wrap proof-strip-inner">
        <h2 id="clients" className="studio-label">
          Brands we&apos;ve worked with
        </h2>
        <ul className="proof-logos">
          {clients.map((client) => (
            <li key={client.name}>
              {client.logo ? (
                <Image
                  src={client.logo.src}
                  alt={client.name}
                  width={client.logo.width}
                  height={client.logo.height}
                  style={{
                    height: client.logo.display,
                    width: "auto",
                  }}
                  sizes={`${Math.ceil((client.logo.display * client.logo.width) / client.logo.height)}px`}
                />
              ) : (
                <span className="proof-wordmark">{client.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
