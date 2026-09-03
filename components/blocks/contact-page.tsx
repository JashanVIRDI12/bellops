'use client';

import React, { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import { ArrowRight, Loader2, CheckCircle2, AlertCircle, Mail, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { NavbarModernBlock } from './navbar-modern';
import { Footer } from './agency-landing';
import { GsapScrollProvider } from '@/components/animations/gsap-scroll-provider';

function ContactHeader() {
  return (
    <section className="relative overflow-hidden bg-paper pb-12 pt-28 md:pb-16 md:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 15% 0%, rgba(11,26,43,0.05) 0%, transparent 70%), radial-gradient(45% 40% at 88% 90%, rgba(30,47,168,0.06) 0%, transparent 72%)',
        }}
      />
      <div className="container relative z-10 mx-auto max-w-3xl px-4 text-center md:px-8">
        <p id="hero-tagline" className="eyebrow mb-5">Contact</p>
        <h1
          id="hero-headline"
          className="mb-5 text-[clamp(2rem,5.4vw,3.9rem)] leading-[0.96] tracking-[-0.02em] text-ink"
        >
          Let&apos;s Turn Your Idea Into Action.
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-ink-soft md:text-base">
          Tell us your goal, mission, and problem, and we&apos;ll help you turn it into a clear growth plan.
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   WHAT HAPPENS NEXT — sets expectations before the form is sent
──────────────────────────────────────────────────────────────── */
const NEXT_STEPS = [
  {
    title: 'Discovery call',
    description: 'We learn about your business, audience, priorities, and challenges.',
  },
  {
    title: 'Build the Roadmap',
    description: 'We shape a clear strategy around your objectives and requirements.',
  },
  {
    title: 'Bring It to Life',
    description: 'Our team moves into execution with a clear process and complete visibility.',
  },
];

function WhatHappensNext() {
  return (
    <div className="on-dark dark-zone">
      <section className="reveal-section relative border-t border-line py-16 md:py-24">
        <div className="container mx-auto max-w-5xl px-4 md:px-8">
          <div className="mb-10 text-center md:mb-14">
            <p className="anim-eyebrow eyebrow mb-3">What Happens Next</p>
            <h2 className="split-h2 text-3xl leading-[1.06] tracking-[-0.02em] text-ink sm:text-4xl">
              Three Steps From Hello to Live.
            </h2>
          </div>

          <div className="reveal-stagger grid gap-6 md:grid-cols-3">
            {NEXT_STEPS.map((step, i) => (
              <div key={step.title} className="relative pt-6">
                <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
                <span className="font-display text-xs font-semibold tracking-[0.18em] text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-2 mt-3 font-display text-lg font-semibold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoPanel() {
  const items = [
    {
      icon: Mail,
      label: 'Email',
      value: 'info@pushwebb.com',
      href: 'mailto:info@pushwebb.com',
    },
    {
      icon: Clock,
      label: 'Response time',
      value: 'Within 24 hours',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <div className="w-9 h-9 rounded-lg bg-surface border border-line flex items-center justify-center mb-4 shrink-0">
              <Icon className="w-4 h-4 text-ink" />
            </div>
            <p className="text-ink-muted text-[10px] uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-ink font-medium text-sm">{item.value}</p>
          </>
        );
        return item.href ? (
          <a key={item.label} href={item.href} className="bg-surface hover:bg-surface-hover border border-line rounded-lg p-5 transition-colors duration-200">
            {content}
          </a>
        ) : (
          <div key={item.label} className="bg-surface border border-line rounded-lg p-5">
            {content}
          </div>
        );
      })}

      <div className="bg-surface border border-line rounded-lg p-5">
        <div className="w-9 h-9 rounded-lg bg-surface border border-line flex items-center justify-center mb-4">
          <MapPin className="w-4 h-4 text-ink" />
        </div>
        <p className="text-ink-muted text-[10px] uppercase tracking-widest mb-2">Where we work</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-ink-soft bg-surface border border-line rounded-lg px-2.5 py-1">India</span>
          <span className="text-[11px] text-ink-soft bg-surface border border-line rounded-lg px-2.5 py-1">Dubai, UAE</span>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-lg p-5">
        <p className="text-ink-muted text-[10px] uppercase tracking-widest mb-3">Follow along</p>
        <div className="flex gap-4 text-ink-soft text-sm">
          <a href="#" className="hover:text-ink transition-colors duration-200">Instagram</a>
          <a href="#" className="hover:text-ink transition-colors duration-200">LinkedIn</a>
          <a href="#" className="hover:text-ink transition-colors duration-200">YouTube</a>
        </div>
      </div>
    </div>
  );
}

function ContactFormSection() {
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
        message: 'Please try again later or email us at info@pushwebb.com.',
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
          to_email: 'info@pushwebb.com',
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
        message: 'Something went wrong. Please try again or email info@pushwebb.com.',
      });
    }
  };

  const inputCls = "bg-paper border border-line rounded-lg px-4 py-3 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-ink focus:bg-white transition-colors duration-200";

  return (
    <section id="contact" className="relative bg-paper border-t border-line pb-16 md:pb-32">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10 pt-10 md:pt-14">
        <div className="grid md:grid-cols-5 gap-4">

          <div className="md:col-span-2 order-2 md:order-1">
            <InfoPanel />
          </div>

          <div className="md:col-span-3 order-1 md:order-2 bg-surface border border-line rounded-lg p-6 sm:p-8 md:p-10">
            <p className="anim-eyebrow eyebrow mb-4">Tell Us About Your Brand</p>
            <h2 className="text-2xl sm:text-3xl text-ink leading-[1.1] tracking-[-1px] mb-7">
              Start a Conversation
            </h2>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="form-field grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-ink-muted tracking-[0.2em] uppercase font-medium">Name</label>
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
                  <label className="text-[10px] text-ink-muted tracking-[0.2em] uppercase font-medium">Email</label>
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
                <label className="text-[10px] text-ink-muted tracking-[0.2em] uppercase font-medium">Website or social link</label>
                <input
                  type="text"
                  name="website"
                  value={fields.website}
                  onChange={handleChange}
                  placeholder="https://yourbrand.com or @yourhandle"
                  className={inputCls}
                />
              </div>

              <div className="form-field flex flex-col gap-1.5">
                <label className="text-[10px] text-ink-muted tracking-[0.2em] uppercase font-medium">What do you need?</label>
                <textarea
                  rows={4}
                  name="message"
                  value={fields.message}
                  onChange={handleChange}
                  placeholder="YouTube, short-form content, ad campaigns, AI automation — tell us what you're looking for..."
                  required
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="form-field">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className={cn(
                    'group relative w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-lg text-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed',
                    status === 'idle' && 'bg-ink hover:bg-ink/90 text-paper',
                    status === 'sending' && 'bg-ink/80 text-paper opacity-80',
                    status === 'success' && 'bg-green-600 text-ink',
                    status === 'error' && 'bg-red-600 text-ink',
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
                      <span>Send Message</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <p className="text-ink-muted text-[10px] text-center mt-3">We reply within 24 hours. No pitch — just a real conversation.</p>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

export function ContactPage() {
  return (
    <div className="bg-paper">
      <GsapScrollProvider />
      <NavbarModernBlock />
      <ContactHeader />
      <ContactFormSection />
      <WhatHappensNext />
      <div className="on-dark dark-zone">
        <Footer />
      </div>
    </div>
  );
}
