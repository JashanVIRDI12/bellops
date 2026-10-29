/**
 * The Google Analytics 4 measurement ID, from NEXT_PUBLIC_GA_ID (set in
 * .env.local and in Vercel's Production and Preview environments). It's
 * read at build time; without it, or with something that isn't a G- ID,
 * the site builds without Google Analytics (next.config.ts warns).
 */
const raw = process.env.NEXT_PUBLIC_GA_ID?.trim();

export const gaId = raw && /^G-[A-Z0-9]+$/.test(raw) ? raw : undefined;
