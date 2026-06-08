"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import emailjs from '@emailjs/browser';
import { ArrowRight, CheckCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { InteractiveHeroSection } from './interactive-hero-section';
import { NavbarModernBlock } from './navbar-modern';
import { PricingScrollSection } from './pricing-scroll-section';
import { SplineSceneLazy } from '@/components/ui/splite';
import { LazyPortfolioImage } from '@/components/ui/lazy-portfolio-image';
import { Spotlight } from '@/components/ui/spotlight';
import { GsapScrollProvider } from '@/components/animations/gsap-scroll-provider';
import { MarqueeTicker } from '@/components/animations/marquee-ticker';

function AgencyHero() {
  return <InteractiveHeroSection />;
}

function ProofSection() {
  return (
    <section id="case-studies" className="relative py-16 md:py-32 bg-black border-t border-white/5 overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
      {/* Faint top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            {/* eyebrow — GSAP targeted via .anim-eyebrow */}
            <p className="anim-eyebrow eyebrow mb-3">Case Study</p>
            {/* h2 words split by GSAP */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.05] tracking-[-0.03em]">
              Real Businesses.{' '}<br />{' '}Real Growth.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Healthcare', 'Transport', 'Fitness', 'E-commerce'].map((tag) => (
              <span key={tag} className="anim-tag text-[10px] text-white/30 border border-white/10 rounded-full px-3 py-1 tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Case study — full width horizontal split */}
        <div className="grid md:grid-cols-5 gap-3 mb-3">

          {/* Story — 3 cols — GSAP targeted via #proof-story */}
          <div id="proof-story" className="hud-card glow-border md:col-span-3 bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase text-white/35 border border-white/10 rounded-full px-3 py-1 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 inline-block" />
                Charter Company — Coaching Business
              </span>
              <p className="text-white/65 text-base leading-relaxed mb-4">
                Charter Company had a website pulling in <span className="text-white font-semibold">2–3 leads a month</span>. Their social was inconsistent and search visibility was almost zero.
              </p>
              <p className="text-white/65 text-base leading-relaxed">
                We rebuilt their website, ran SEO, refreshed their marketing visuals, and managed their social — turning scattered efforts into a steady flow of leads every day.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-8">
              {['Website Dev', 'SEO', 'Social Media', 'Graphic Design'].map((t) => (
                <span key={t} className="text-[10px] text-white/30 border border-white/10 rounded-full px-2.5 py-1">{t}</span>
              ))}
            </div>
          </div>

          {/* Result — 2 cols — GSAP targeted via #proof-stats */}
          <div id="proof-stats" className="md:col-span-2 flex flex-col gap-3">
            {/* Big stat — counter targeted via #stat-counter-30x */}
            <div className="relative flex-1 bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden">
              {/* Glow behind number */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.12),transparent)] pointer-events-none" />
              <div id="stat-counter-30x" className="relative font-display text-[4rem] sm:text-[5.5rem] font-bold text-white leading-none tracking-tighter" style={{ textShadow: '0 0 40px rgba(139,92,246,0.4)' }}>30x</div>
              <div className="relative text-white/40 text-xs font-medium mt-2 tracking-wide uppercase">More Leads / Month</div>
            </div>
            {/* Before / after */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 flex items-center justify-between">
              <div className="text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Before</div>
                <div className="text-white font-bold text-lg">2–3<span className="text-white/40 text-xs font-normal ml-1">/mo</span></div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20" />
              <div className="text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">After</div>
                <div className="text-white font-bold text-lg">3+<span className="text-white/40 text-xs font-normal ml-1">/day</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom summary — each child targeted via .anim-proof-bottom */}
        <div className="proof-bottom-grid grid md:grid-cols-3 gap-3">
          <div className="anim-proof-bottom md:col-span-2 bg-white/[0.02] border border-white/8 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <p className="text-white/50 text-sm leading-relaxed">
              We&apos;ve delivered <span className="text-white font-medium">10+ websites</span>, social campaigns, SEO, design, and video for businesses across healthcare{' '}
              <span className="text-white/70">(CHW — Chase Healthcare &amp; Wellness)</span>, transport, fitness, restaurants, and local services.
              One team for your full growth stack.
            </p>
          </div>
          <div className="anim-proof-bottom bg-white/[0.02] border border-white/8 rounded-2xl p-6 sm:p-7 flex flex-col justify-center gap-3">
            {[
              { n: '5', l: 'Core services' },
              { n: '30x', l: 'Lead growth (Charter)' },
              { n: '10+', l: 'Businesses & projects' },
            ].map((s) => (
              <div key={s.n} className="flex items-baseline gap-2">
                <span className="text-white font-bold text-xl tracking-tight font-display">{s.n}</span>
                <span className="text-white/35 text-xs">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function ServicesSection() {
  return <PricingScrollSection />;
}

function AuditCTA() {
  return (
    <section id="free-audit" className="relative py-16 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(139,92,246,0.2),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_10%_60%,rgba(109,40,217,0.1),transparent)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-3">

          {/* Left — GSAP targeted via #audit-left */}
          <div id="audit-left" className="hud-card glow-border bg-white/[0.03] border border-white/8 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col justify-between">
            <div>
              <p className="eyebrow mb-5">Free Digital Review</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-[1.08] tracking-[-0.03em] mb-5">
                Is Your Business<br />Falling Behind?
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Weak social, slow sites, poor SEO, or dated visuals all cost you customers. We&apos;ll review your digital presence and show you exactly what to fix first.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-[10px] text-white/25 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" />
              Takes 24 hours. No commitment.
            </div>
          </div>

          {/* Right — GSAP targeted via #audit-right */}
          <div id="audit-right" className="flex flex-col gap-3">
            <div className="flex-1 bg-white/[0.03] border border-white/8 rounded-2xl p-6 sm:p-7">
              <p className="eyebrow mb-5">What you get</p>
              <ul className="space-y-3">
                {[
                  'Website, SEO, and social quick wins',
                  'Where your business is losing customers',
                  'Design and content gaps to close',
                  'Full written breakdown — no fluff',
                ].map((item) => (
                  <li key={item} className="audit-list-item flex items-center gap-3 text-white/55 text-sm">
                    <CheckCircle className="w-4 h-4 text-white/25 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex flex-col items-start gap-4">
              <p className="text-white/40 text-xs leading-relaxed">
                Share your website or social handles. We&apos;ll send a full digital review within 24 hours.
              </p>
              <a
                href="#contact"
                className="group relative w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3.5 rounded-xl text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_28px_rgba(255,255,255,0.2)] active:scale-[0.98]"
              >
                <span className="transition-transform duration-300 group-hover:-translate-x-0.5">Get Your Free Review</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-black/8 to-transparent transition-transform duration-500" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const stats = [
    { value: '5', label: 'Services under one roof', count: 5, suffix: '' },
    { value: '30x', label: 'Lead growth delivered', count: 30, suffix: 'x' },
    { value: '24h', label: 'Review turnaround', count: 24, suffix: 'h' },
  ];

  return (
    <section id="about" className="relative py-16 md:py-32 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(139,92,246,0.07),transparent)]" />
      {/* Floating orbs for depth */}
      <FloatingOrb className="w-80 h-80 bg-purple-500/10 -top-10 right-1/4" />
      <FloatingOrb className="w-64 h-64 bg-violet-600/7 bottom-0 left-1/3" />
      {/* Spinning ring decoration */}
      <div className="absolute top-12 right-8 pointer-events-none opacity-[0.06] hidden md:block">
        <svg className="ring-spin" width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="74" stroke="white" strokeWidth="1" strokeDasharray="8 6" />
          <circle cx="80" cy="80" r="54" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-3">

          {/* Main about card — GSAP targeted via #about-main-card */}
          <div id="about-main-card" className="hud-card glow-border md:col-span-2 bg-white/[0.03] border border-white/8 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col justify-between">
            <div>
              <p className="anim-eyebrow eyebrow mb-5">About</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-[1.08] tracking-[-0.03em] mb-6">
                We&apos;re BellOps.
              </h2>
              <p className="text-white/55 text-sm md:text-base leading-relaxed">
                BellOps is a full-service digital agency — social media management, website development, SEO, graphic design, and video editing for businesses that want to grow without juggling five freelancers.
              </p>
              <p className="text-white/40 text-sm leading-relaxed mt-4">
                No bloated retainers. No vague deliverables. Clear scope, sharp creative, and measurable growth across every channel.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/8 flex items-center gap-3">
              <a
                href="#contact"
                className="group flex items-center gap-2 border border-white/15 text-white/60 hover:text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-white/8 hover:border-white/25 active:scale-95"
              >
                Work with us
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Stats column — cards targeted via .stat-card, numbers via .stat-number */}
          <div className="flex flex-col gap-3">
            {stats.map((s, i) => (
              <div key={s.value} className="stat-card relative flex-1 bg-white/[0.03] border border-white/8 rounded-2xl p-6 flex flex-col justify-center overflow-hidden">
                {/* Subtle bg accent on first stat */}
                {i === 0 && (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(139,92,246,0.07),transparent)] pointer-events-none" />
                )}
                <div
                  className="stat-number relative font-display text-3xl md:text-4xl font-bold text-white tracking-[-0.04em] leading-none mb-2"
                  data-count={String(s.count)}
                  data-suffix={s.suffix}
                >
                  {s.value}
                </div>
                <p className="relative text-white/35 text-xs leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function SplineSection() {
  const { toast } = useToast();
  const [fields, setFields] = useState({ name: '', email: '', website: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (status !== 'success' && status !== 'error') return;
    const timer = window.setTimeout(() => setStatus('idle'), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (status === 'success' || status === 'error') setStatus('idle');
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name || !fields.email || !fields.message) {
      setStatus('error');
      toast({
        type: 'error',
        title: 'Missing fields',
        message: 'Please fill in your name, email, and message.',
      });
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setStatus('error');
      toast({
        type: 'error',
        title: 'Email not configured',
        message: 'Please try again later or email us at info@bellops.in.',
      });
      return;
    }

    setStatus('sending');
    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: fields.name,
          from_email: fields.email,
          reply_to: fields.email,
          website: fields.website || '—',
          message: fields.message,
          to_email: 'info@bellops.in',
        },
        { publicKey },
      );
      setStatus('success');
      setFields({ name: '', email: '', website: '', message: '' });
      toast({
        type: 'success',
        title: 'Message sent!',
        message: "We'll get back to you within 24 hours.",
      });
    } catch {
      setStatus('error');
      toast({
        type: 'error',
        title: 'Failed to send',
        message: 'Something went wrong. Please try again or email info@bellops.in.',
      });
    }
  };

  const inputCls = "bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all duration-200";

  return (
    <section id="contact" className="relative w-full md:h-screen bg-black border-t border-white/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <Spotlight className="top-0 left-0 md:left-20 -top-20" fill="white" />
      </div>

      <div className="flex flex-col md:flex-row md:h-full">
        {/* Contact form */}
        <div className="w-full md:w-[42%] relative z-10 flex flex-col justify-center px-5 sm:px-8 md:px-16 py-16 md:py-0">
          <p className="anim-eyebrow eyebrow mb-4">Let&apos;s Talk</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-[1.08] tracking-[-0.03em] mb-8">
            Let&apos;s Grow Your Business{' '}<br />{' '}Across Every Channel.
          </h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="form-field grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={fields.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={fields.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div className="form-field flex flex-col gap-1.5">
              <label className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-medium">Website or social link</label>
              <input
                type="text"
                name="website"
                value={fields.website}
                onChange={handleChange}
                placeholder="https://yoursite.com or @yourbusiness"
                className={inputCls}
              />
            </div>

            <div className="form-field flex flex-col gap-1.5">
              <label className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-medium">What do you need?</label>
              <textarea
                rows={4}
                name="message"
                value={fields.message}
                onChange={handleChange}
                placeholder="Social, website, SEO, design, video — tell us what you're looking for..."
                required
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="form-field">
              <button
                type="submit"
                disabled={status === 'sending'}
                className={cn(
                  'group relative w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl text-sm overflow-hidden transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed',
                  status === 'idle' && 'bg-white text-black hover:shadow-[0_0_28px_rgba(255,255,255,0.18)]',
                  status === 'sending' && 'bg-white/80 text-black opacity-80',
                  status === 'success' && 'bg-green-500 text-white shadow-[0_0_24px_rgba(34,197,94,0.35)]',
                  status === 'error' && 'bg-red-500/90 text-white shadow-[0_0_24px_rgba(239,68,68,0.3)]',
                )}
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending…</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sent!</span>
                  </>
                ) : status === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                ) : (
                  <>
                    <span className="transition-transform duration-300 group-hover:-translate-x-0.5">Send Message</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
                {status === 'idle' && (
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-black/8 to-transparent transition-transform duration-500" />
                )}
              </button>
              <p className="text-white/20 text-[10px] text-center mt-3">We reply within 24 hours. No pitch — just a real conversation.</p>
            </div>
          </form>
        </div>

        {/* Spline robot */}
        <div className="relative w-full h-[70vh] md:h-auto md:flex-1">
          <SplineSceneLazy
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
            unmountWhenHidden
          />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/5 py-10 overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-20" />
      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <Image
            src="/bellops.PNG"
            alt="BellOps"
            width={120}
            height={36}
            className="h-9 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
          />
        <p className="text-white/20 text-xs sm:text-sm">© 2026 BellOps. All rights reserved.</p>
        <div className="flex gap-6 text-white/30 text-sm">
          <a href="#" className="hover:text-white transition-colors duration-200">Privacy</a>
          <a href="#" className="hover:text-white transition-colors duration-200">Terms</a>
          <a href="#" className="hover:text-white transition-colors duration-200">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function FloatingOrb({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ filter: 'blur(60px)' }}
    />
  );
}

function WorkSection() {
  const sites = [
    { url: "https://chw.co.in", domain: "chw.co.in", name: "CHW", label: "Healthcare & Wellness" },
    { url: "https://activecoach.ca", domain: "activecoach.ca", name: "Charter Bus", label: "Charter Bus Services" },
    { url: "https://deegeegraphics.com", domain: "deegeegraphics.com", name: "DeeGee Graphics", label: "Design Studio" },
    { url: "https://harriertransport.ca", domain: "harriertransport.ca", name: "Harrier Transport", label: "Transport & Logistics" },
    { url: "https://growguides.me", domain: "growguides.me", name: "GrowGuides", label: "Growth & Education" },
  ];

  return (
    <section id="work" className="relative py-16 md:py-32 bg-black border-t border-white/5 overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-50" />
      {/* Floating accent orbs */}
      <FloatingOrb className="w-72 h-72 bg-purple-600/8 top-1/4 -left-20" />
      <FloatingOrb className="w-96 h-96 bg-indigo-500/6 bottom-1/4 -right-28" />

      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-4">
          <div>
            <p className="anim-eyebrow eyebrow mb-3">Portfolio</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.05] tracking-[-0.03em]">
              Our Work
            </h2>
          </div>
          <p className="text-white/30 text-sm">{sites.length}+ client projects</p>
        </div>

        {/* work-grid — targeted for perspective + card stagger */}
        <div className="work-grid grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sites.map((site, i) => (
            <a
              key={site.domain}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              /* work-card — GSAP stagger + 3D hover */
              className="work-card hud-card group relative bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-colors duration-300"
            >
              <div className="relative h-40 overflow-hidden bg-white/5">
                <LazyPortfolioImage
                  url={site.url}
                  alt={site.name}
                  className="w-full h-full object-cover object-top opacity-70 group-hover:opacity-90 group-hover:scale-[1.03] transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] text-white/30 font-mono">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">{site.name}</div>
                  <div className="text-white/35 text-xs">{site.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/25 text-xs font-mono hidden md:block">{site.domain}</span>
                  <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/10 transition-all duration-300">
                    <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </a>
          ))}

          <div className="work-card relative bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center min-h-[180px]">
            <div className="flex gap-1.5 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/15" />
              ))}
            </div>
            <p className="text-white/40 font-semibold text-sm mb-1">And many more</p>
            <p className="text-white/20 text-xs">10+ businesses served</p>
          </div>
        </div>

      </div>
    </section>
  );
}

export function AgencyLanding() {
  return (
    <div className="bg-black">
      {/* Central GSAP animation engine — renders cursor glow, runs all scroll animations */}
      <GsapScrollProvider />

      <NavbarModernBlock />
      <AgencyHero />

      {/* Marquee ticker between hero and proof */}
      <MarqueeTicker />

      <ProofSection />
      <ServicesSection />
      <WorkSection />

      {/* Marquee ticker before CTA */}
      <MarqueeTicker />

      <AuditCTA />
      <AboutSection />
      <SplineSection />
      <Footer />
    </div>
  );
}
