"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, MessageSquareQuote, Menu, X } from "lucide-react";

export function NavbarModern() {
  const navItems = [
    { label: "Services", href: "#services" },
    { label: "Our Work", href: "#work" },
    { label: "Case Studies", href: "#case-studies" },
    { label: "About", href: "#about" },
  ];

  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-black py-4 md:py-7">
      <div className="flex justify-center px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 w-full max-w-xl md:max-w-3xl">

          {/* Brand */}
          <a href="#" className="px-2 shrink-0 flex items-center">
            <Image
              src="/bellops.PNG"
              alt="BellOps"
              width={140}
              height={42}
              className="h-10 w-auto object-contain"
              priority
            />
          </a>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/50 hover:text-white text-sm font-medium px-3 py-2 md:px-4 rounded-full transition-all duration-300 hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden text-white/60 hover:text-white rounded-full p-2 transition-all duration-300 hover:bg-white/10 active:scale-95"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <a
              href="#contact"
              className="hidden sm:inline-flex group relative text-white/40 hover:text-white rounded-full p-2.5 transition-all duration-300 hover:bg-white/10 active:scale-95"
            >
              <MessageSquareQuote className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            </a>

            <a
              href="#free-audit"
              className="group relative flex items-center gap-1.5 sm:gap-2 bg-white text-black text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] active:scale-95"
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:-translate-x-0.5">Free Review</span>
              <ArrowRight className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-500 ease-in-out" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden px-3 sm:px-4 mt-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-col">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-white/65 hover:text-white text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
