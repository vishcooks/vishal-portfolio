import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { Logo } from "./Nav";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-navy-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr_1fr] md:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-cream/55">
            Analytics Engineer building the single source of truth for GTM &amp; product — and the GenAI layer on top of it.
          </p>
          <a href={`mailto:${SITE.email}`} className="mt-5 inline-flex items-center gap-1 text-sm text-coral hover:underline">
            {SITE.email} <ArrowUpRight className="size-3.5" />
          </a>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-cream/40">Pages</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href} className="hover:text-cream">{n.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-cream/40">Elsewhere</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li><a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-cream">LinkedIn ↗</a></li>
            <li><a href={SITE.github} target="_blank" rel="noopener noreferrer" className="hover:text-cream">GitHub ↗</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t border-white/[0.05] px-5 py-6 text-xs text-cream/35 md:px-8">
        <span>© 2026 {SITE.name}</span>
        <span>Next.js · TypeScript · Tailwind CSS · Motion · Recharts</span>
      </div>
    </footer>
  );
}
