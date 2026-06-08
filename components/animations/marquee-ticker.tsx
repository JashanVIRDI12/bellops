'use client';

const ITEMS = [
  'SOCIAL MEDIA',
  'WEBSITE DEVELOPMENT',
  'SEO GROWTH',
  'GRAPHIC DESIGN',
  'VIDEO EDITING',
  'BUSINESS GROWTH',
];

export function MarqueeTicker() {
  // Tripled for a truly seamless loop at all viewport widths
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="relative border-t border-b border-white/[0.06] py-[14px] overflow-hidden bg-black/80 backdrop-blur-sm">
      {/* Left + right edge fades */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div className="marquee-outer flex w-max">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center shrink-0">
            <span className="font-display text-[9px] sm:text-[10px] tracking-[0.38em] uppercase text-white/18 px-6 sm:px-8 select-none">
              {item}
            </span>
            <span className="text-white/12 text-[8px] shrink-0">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
