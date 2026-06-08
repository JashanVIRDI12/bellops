"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { BentoPricing } from "@/components/ui/bento-pricing";

function ServicesIntro() {
  return (
    <div className="mb-4">
      <p className="eyebrow mb-4">
        Services
      </p>
      <h2 className="font-display text-white font-bold text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em] text-glow-sm">
        Full-Stack Digital<br />For Growing Businesses.
      </h2>
      <p className="text-white/40 text-sm md:text-base mt-3 max-w-md mx-auto leading-relaxed">
        Websites, social, SEO, design, and video — one team handling everything your business needs to grow.
      </p>
    </div>
  );
}

export function PricingScrollSection() {
  return (
    <div id="services" className="relative bg-black overflow-hidden border-t border-white/5">
      {/* Minimal purple gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(139,92,246,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_80%,rgba(109,40,217,0.08),transparent)]" />

      {/* Mobile — clean section, no tablet wrapper */}
      <div className="md:hidden relative z-10 py-16 px-4">
        <div className="text-center mb-8">
          <ServicesIntro />
        </div>
        <div className="max-w-md mx-auto">
          <BentoPricing />
        </div>
      </div>

      {/* Desktop — scroll-into-tablet effect */}
      <div className="hidden md:block relative z-10">
        <ContainerScroll
          titleComponent={<ServicesIntro />}
        >
          <BentoPricing />
        </ContainerScroll>
      </div>
    </div>
  );
}
