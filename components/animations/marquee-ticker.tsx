'use client';

const DEFAULT_ITEMS = [
  'YAAS',
  'MICROCONTENT MASTERY',
  'AD CAMPAIGNS',
  'AI AUTOMATION',
  'SOCIAL MEDIA MARKETING',
  'PERFORMANCE MARKETING',
];

export function MarqueeTicker({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  // Tripled for a truly seamless loop at all viewport widths
  const repeated = [...items, ...items, ...items];

  return (
    <div className="relative border-t border-b border-line py-[14px] overflow-hidden bg-paper">
      {/* Left + right edge fades */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-paper to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" />

      <div className="marquee-outer flex w-max">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center shrink-0">
            <span className="font-display text-[9px] sm:text-[10px] tracking-[0.38em] uppercase text-ink-muted px-6 sm:px-8 select-none">
              {item}
            </span>
            <span className="text-ink/25 text-[8px] shrink-0">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
