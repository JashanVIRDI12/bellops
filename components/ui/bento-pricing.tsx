'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Globe, Search, Share2, Palette, Video } from 'lucide-react';

type ServiceCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  className?: string;
  featured?: boolean;
  badge?: string;
};

function ServiceCard({ icon, title, description, cta, className, featured, badge }: ServiceCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border flex flex-col',
      featured
        ? 'border-white/30 bg-white/10'
        : 'border-white/10 bg-white/[0.03]',
      className,
    )}>
      {badge && (
        <span className="absolute top-3 right-3 text-[9px] font-semibold tracking-widest uppercase text-white/50 border border-white/15 rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
      <div className="flex-1 p-5">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center mb-3',
          featured ? 'bg-white/20' : 'bg-white/5'
        )}>
          {icon}
        </div>
        <h3 className="font-display text-white font-semibold text-sm mb-1.5">{title}</h3>
        <p className="text-white/45 text-xs leading-relaxed">{description}</p>
      </div>
      <div className="px-5 pb-4">
        <a
          href="#contact"
          className={cn(
            'group inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-4 py-2 transition-all duration-200 active:scale-95',
            featured
              ? 'bg-white text-black hover:bg-white/90'
              : 'border border-white/15 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5'
          )}
        >
          {cta}
          <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}

export function BentoPricing() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 h-full">

      <ServiceCard
        icon={<Globe className="w-4 h-4 text-white" />}
        title="Website Development"
        description="Fast, modern websites built to look great, load fast, and turn visitors into customers."
        cta="Get a Quote"
        featured
        badge="Core"
        className="col-span-2"
      />
      <ServiceCard
        icon={<Search className="w-4 h-4 text-white/60" />}
        title="SEO"
        description="Rank where your customers search. Technical SEO, content, and local visibility that drives traffic."
        cta="Boost Rankings"
      />

      <ServiceCard
        icon={<Share2 className="w-4 h-4 text-white/60" />}
        title="Social Media Management"
        description="Content calendars, posting, captions, and community growth across Instagram, LinkedIn, and more."
        cta="Grow Social"
      />
      <ServiceCard
        icon={<Palette className="w-4 h-4 text-white/60" />}
        title="Graphic Designing"
        description="Logos, social kits, ads, flyers, and marketing assets that look sharp on every channel."
        cta="Start Design"
      />
      <ServiceCard
        icon={<Video className="w-4 h-4 text-white/60" />}
        title="Video Editing"
        description="Reels, ads, promos, and long-form cuts edited to hold attention and drive action."
        cta="Edit Video"
      />

    </div>
  );
}
