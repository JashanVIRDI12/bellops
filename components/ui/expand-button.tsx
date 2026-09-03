'use client';

import { ArrowRight } from 'lucide-react';

interface ExpandButtonProps {
  href?: string;
  label: string;
  id?: string;
}

export function ExpandButton({ href, label, id }: ExpandButtonProps) {
  return (
    <a
      id={id}
      href={href}
      className="group inline-flex items-center gap-2.5 h-[54px] px-6 rounded-lg bg-surface border border-line text-ink font-semibold text-sm transition-colors duration-200 hover:bg-surface-hover active:scale-[0.97]"
    >
      {label}
      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </a>
  );
}
