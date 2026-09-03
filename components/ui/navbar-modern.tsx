"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Layers, Home, UserCheck, Mail, ChevronDown } from "lucide-react";

/** Every channel that has its own section on /services. */
const SERVICE_LINKS = [
  { label: "YAAS: YouTube as a Service", href: "/services#yaas" },
  { label: "Microcontent Mastery", href: "/services#microcontent" },
  { label: "ROI-Driven Ad Campaigns", href: "/services#ad-campaigns" },
  { label: "Social Media Marketing", href: "/services#social-media" },
  { label: "Performance Marketing", href: "/services#performance-marketing" },
  { label: "AI Automation", href: "/services#ai-automation" },
];

export function NavbarModern() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/", icon: Home, children: null },
    { label: "Services", href: "/services", icon: Layers, children: SERVICE_LINKS },
    { label: "About", href: "/about", icon: UserCheck, children: null },
    { label: "Contact", href: "/contact", icon: Mail, children: null },
  ];

  // Detect scroll state for subtle glass reaction
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-[100] w-full pt-3 sm:pt-5 pb-2 px-3 sm:px-6 pointer-events-none flex flex-col items-center"
    >
      {/* Floating Pill Capsule */}
      <div
        className={`pointer-events-auto relative flex items-center justify-between gap-3 sm:gap-6 rounded-full border transition-all duration-300 w-full max-w-3xl lg:max-w-4xl px-3.5 py-2 sm:px-5 sm:py-2.5 ${
          scrolled
            ? "border-ink/12 bg-white/85 backdrop-blur-2xl shadow-[0_10px_30px_-18px_rgba(11,26,43,0.45)]"
            : "border-ink/8 bg-white/60 backdrop-blur-xl shadow-[0_6px_20px_-16px_rgba(11,26,43,0.35)] hover:border-ink/15"
        }`}
      >
        {/* Subtle top edge hairline glow streak */}
        <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-ink/12 to-transparent" />

        {/* Brand Logo — Clean Text Only */}
        <Link
          href="/"
          className="group flex items-baseline gap-0.5 select-none no-underline transition-transform duration-200 hover:scale-[1.02] pl-1 sm:pl-2 shrink-0"
          onClick={() => setOpen(false)}
        >
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink transition-colors duration-200">
            PUSH
          </span>
          <span className="font-display text-lg sm:text-xl font-medium tracking-tight text-ink-muted transition-colors duration-200 group-hover:text-ink">
            Webb
          </span>
        </Link>

        {/* Desktop Navigation Links with Magnetic Floating Pill */}
        <nav
          className="relative hidden md:flex items-center gap-1"
          onMouseLeave={() => {
            setHoveredIndex(null);
            setServicesOpen(false);
          }}
        >
          {navItems.map((item, index) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href.startsWith("/#")
                ? false
                : pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  setServicesOpen(Boolean(item.children));
                }}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium font-display transition-colors duration-200 rounded-full select-none ${
                  isActive
                    ? "text-ink font-semibold"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                {/* Magnetic sliding hover pill */}
                {hoveredIndex === index && (
                  <motion.span
                    layoutId="navbar-hover-pill"
                    className="absolute inset-0 rounded-full bg-ink/[0.06] border border-ink/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Active Route Indicator Dot */}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-dot"
                    className="relative z-10 h-1.5 w-1.5 rounded-full bg-accent"
                  />
                )}

                <span className="relative z-10">{item.label}</span>
                {item.children ? (
                  <ChevronDown
                    className={`relative z-10 h-3 w-3 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                  />
                ) : null}
              </Link>
            );
          })}

          {/* Services panel. It lives inside <nav> so the pointer never leaves
              the hover target on its way down, and its top padding bridges the
              gap to the pill. */}
          <AnimatePresence>
            {servicesOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-1/2 top-full z-50 w-[19rem] -translate-x-1/2 pt-4"
              >
                <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-2 shadow-[0_20px_48px_-24px_rgba(11,26,43,0.45)]">
                  <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                    What we do
                  </p>
                  {SERVICE_LINKS.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      onClick={() => setServicesOpen(false)}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 font-display text-[13px] font-medium text-ink/75 transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink"
                    >
                      <span>{service.label}</span>
                      <ArrowRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                    </Link>
                  ))}
                  <Link
                    href="/services"
                    onClick={() => setServicesOpen(false)}
                    className="mt-1 flex items-center justify-between gap-2 rounded-xl border-t border-ink/10 px-3 pb-2 pt-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors duration-150 hover:text-accent"
                  >
                    <span>All services</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Right Section: Call to Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          {/* Glowing Pill Call-To-Action Button */}
          <Link
            href="/contact"
            className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 overflow-hidden rounded-full bg-ink px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold text-paper shadow-[0_6px_18px_-10px_rgba(11,26,43,0.7)] transition-all duration-300 hover:bg-accent hover:shadow-[0_10px_24px_-12px_rgba(30,47,168,0.7)] hover:scale-[1.03] active:scale-[0.98]"
          >
            {/* Shimmer sweep ray */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

            <span className="relative z-10 font-display">Book a Call</span>
            <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.05] hover:bg-ink/[0.10] text-ink border border-ink/10 transition-colors duration-200 md:hidden active:scale-95"
          >
            <div className="flex h-3.5 w-3.5 flex-col justify-between">
              <motion.span
                animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="h-0.5 w-full rounded-full bg-ink origin-center"
              />
              <motion.span
                animate={open ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="h-0.5 w-full rounded-full bg-ink"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="h-0.5 w-full rounded-full bg-ink origin-center"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Animated Mobile Dropdown Menu with Glassmorphism */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mt-2 w-full max-w-sm overflow-hidden md:hidden"
          >
            <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-3.5 shadow-[0_18px_50px_-24px_rgba(11,26,43,0.45)]">
              {/* Top glow streak */}
              <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink/12 to-transparent" />

              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : item.href.startsWith("/#")
                      ? false
                      : pathname === item.href;

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 + 0.04 }}
                    >
                      <div
                        className={`flex items-center rounded-xl pr-1 transition-all duration-200 ${
                          isActive ? "bg-ink/[0.06]" : "hover:bg-ink/[0.04]"
                        }`}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex flex-1 items-center justify-between rounded-xl px-3.5 py-2.5 font-display text-sm font-medium ${
                            isActive ? "text-ink" : "text-ink/70"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink/10 bg-ink/[0.06]">
                              <Icon className="h-3.5 w-3.5 text-ink" />
                            </div>
                            <span>{item.label}</span>
                          </div>
                          {isActive ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          ) : !item.children ? (
                            <ArrowRight className="h-3.5 w-3.5 text-ink-muted opacity-50" />
                          ) : null}
                        </Link>

                        {item.children ? (
                          <button
                            type="button"
                            onClick={() => setMobileServicesOpen((v) => !v)}
                            aria-expanded={mobileServicesOpen}
                            aria-label={mobileServicesOpen ? "Hide services" : "Show services"}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-ink"
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                        ) : null}
                      </div>

                      {item.children && mobileServicesOpen ? (
                        <div className="mb-1 ml-6 flex flex-col border-l border-ink/10 pl-3">
                          {item.children.map((service) => (
                            <Link
                              key={service.href}
                              href={service.href}
                              onClick={() => setOpen(false)}
                              className="rounded-lg px-2 py-1.5 font-display text-[13px] text-ink/65 transition-colors hover:text-ink"
                            >
                              {service.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile Bottom CTA */}
              <div className="mt-3 pt-3 border-t border-ink/[0.08] flex flex-col gap-2">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-center font-display text-sm font-semibold text-paper transition-all hover:bg-accent active:scale-98"
                >
                  <span>Book a Brainstorming Call</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
