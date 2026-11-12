"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { NAV, SITE } from "@/lib/site";
import { usePalette } from "./CommandPalette";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Home">
      <svg viewBox="0 0 28 20" className="h-4 w-6 text-cream" aria-hidden>
        <path d="M1 14c3-6 6-6 9 0s6 6 9 0 5-8 8-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="25" cy="5" r="2.4" className="fill-coral" />
      </svg>
      <span className="text-[15px] font-medium tracking-tight text-cream">{SITE.name}</span>
    </Link>
  );
}

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const palette = usePalette();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href.replace(/\/$/, "")));

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-navy-900/85 backdrop-blur-xl border-b border-white/[0.06]" : ""}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        <Logo />
        <nav className="glass hidden items-center gap-1 rounded-full p-1 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`relative rounded-full px-4 py-1.5 text-[13px] transition ${isActive(n.href) ? "text-navy" : "text-cream/70 hover:text-cream"}`}>
              {isActive(n.href) && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-cream" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
              <span className="relative">{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={palette.open}
            className="glass hidden items-center gap-2 rounded-full px-3 py-2 text-[12px] text-cream/60 transition hover:text-cream lg:inline-flex"
            aria-label="Open command menu"
          >
            <Search className="size-3.5" /> Jump to…
            <kbd className="rounded border border-white/15 px-1.5 font-mono text-[10px]">Ctrl K</kbd>
          </button>
          <a href={`mailto:${SITE.email}`} className="hidden items-center gap-1 rounded-full bg-coral px-4 py-2 text-[13px] font-medium text-navy transition hover:bg-coral-600 sm:inline-flex">
            Let&apos;s talk <ArrowUpRight className="size-3.5" />
          </a>
          <button className="glass grid size-10 place-items-center rounded-full md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mx-4 mb-3 grid gap-1 rounded-3xl border border-white/10 bg-navy-800/95 p-2 backdrop-blur-xl md:hidden" aria-label="Mobile">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`rounded-2xl px-4 py-3 text-sm ${isActive(n.href) ? "bg-cream text-navy" : "text-cream/80"}`}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
