'use client';

import { ImageIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type BasePlaceholderProps = {
  /** Short description of what real asset should go here — shown until `src` is provided. */
  label: string;
  /** Optional hint, e.g. suggested dimensions or format. */
  hint?: string;
  /** Once a real image is available, pass its src and the placeholder chrome disappears. */
  src?: string;
  alt?: string;
  className?: string;
};

/**
 * Drop-in placeholder for a rectangular image/graphic (photos, screenshots,
 * thumbnails). Pass `src` later to swap in the real asset without touching
 * any layout code.
 */
export function ImagePlaceholder({
  label,
  hint,
  src,
  alt,
  className,
  aspect = 'aspect-video',
  rounded = 'rounded-lg',
}: BasePlaceholderProps & { aspect?: string; rounded?: string }) {
  if (src) {
    return (
      <div className={cn('relative overflow-hidden', aspect, rounded, className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? label} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 border border-dashed border-line bg-surface text-center px-4 overflow-hidden',
        aspect,
        rounded,
        className,
      )}
    >
      <ImageIcon className="w-5 h-5 text-ink-muted relative z-10" strokeWidth={1.5} />
      <p className="relative z-10 text-ink-muted text-[11px] font-medium leading-snug max-w-[200px]">{label}</p>
      {hint && <p className="relative z-10 text-ink-muted text-[9px] uppercase tracking-widest">{hint}</p>}
    </div>
  );
}

/** Compact placeholder for a client/partner logo strip. */
export function LogoPlaceholder({ label, src, alt, className }: BasePlaceholderProps) {
  if (src) {
    return (
      <div className={cn('relative flex items-center justify-center h-10 w-28 shrink-0', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? label}
          className="max-h-full max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center h-10 px-5 border border-dashed border-line rounded-lg bg-surface text-ink-muted text-[11px] font-semibold tracking-wide whitespace-nowrap shrink-0',
        className,
      )}
    >
      {label}
    </div>
  );
}

/** Circular placeholder for a headshot / avatar (team, testimonials). */
export function AvatarPlaceholder({
  label,
  src,
  alt,
  className,
  size = 56,
}: BasePlaceholderProps & { size?: number }) {
  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden shrink-0', className)} style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? label} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      title={label}
      className={cn(
        'relative rounded-full border border-dashed border-line bg-surface flex items-center justify-center shrink-0',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <User className="w-1/3 h-1/3 text-ink-muted" strokeWidth={1.5} />
    </div>
  );
}
