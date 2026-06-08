'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyPortfolioImageProps {
  url: string;
  alt: string;
  className?: string;
}

/** Fetches Microlink screenshots only when the card enters the viewport. */
export function LazyPortfolioImage({ url, alt, className }: LazyPortfolioImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '80px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full h-full">
      {shouldLoad ? (
        <img
          src={`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={className}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full bg-white/[0.04] animate-pulse" />
      )}
    </div>
  );
}
