import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, EyeOff, FlaskConical, Layers } from "lucide-react";
import { PageHero } from "./PageHero";
import { Reveal } from "./Reveal";
import { DASHBOARDS, type Dashboard } from "@/lib/site";

export function ProjectLayout({ d, children }: { d: Dashboard; children: ReactNode }) {
  const other = DASHBOARDS.find((x) => x.slug !== d.slug)!;
  return (
    <>
      <PageHero eyebrow={d.kicker} title={d.title}>
        <p className="mt-6 max-w-2xl text-cream/70">{d.summary}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {d.stack.map((s) => (
            <span key={s} className="glass rounded-full px-3 py-1 text-xs text-cream/80">{s}</span>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-[1440px] px-3 pb-6 md:px-6" id="dashboard">
        <Reveal>{children}</Reveal>
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-2 text-xs text-cream/45">
          <span className="inline-flex items-center gap-1.5"><FlaskConical className="size-3.5 text-coral" /> 100% synthetic data — no customer or company figures</span>
          <span className="inline-flex items-center gap-1.5"><Layers className="size-3.5" /> {d.pages.length} report pages · rebuilt on synthetic data</span>
          <span className="inline-flex items-center gap-1.5"><EyeOff className="size-3.5" /> Hidden, duplicate &amp; backup pages intentionally excluded</span>
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.22em] text-coral">The problem</p>
          <p className="mt-4 font-display text-2xl font-light leading-snug md:text-3xl">{d.problem}</p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {d.impact.map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <p className="font-display text-3xl font-light">{m.value}</p>
                <p className="mt-1 text-[11px] leading-snug text-cream/50">{m.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-[11px] uppercase tracking-[0.22em] text-coral">What I built</p>
          <ol className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {d.build.map((b, i) => (
              <li key={b} className="flex gap-5 py-5">
                <span className="font-mono text-xs text-cream/35">0{i + 1}</span>
                <p className="text-[15px] leading-relaxed text-cream/80">{b}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-white/[0.07] px-5 py-10 md:px-8">
        <Link href="/projects/" className="inline-flex items-center gap-2 text-sm text-cream/60 hover:text-cream">
          <ArrowLeft className="size-4" /> All work
        </Link>
        <Link href={`/projects/${other.slug}/`} className="group inline-flex items-center gap-2 text-sm">
          <span className="text-cream/45">Next:</span> {other.title}
          <ArrowRight className="size-4 text-coral transition group-hover:translate-x-1" />
        </Link>
      </section>
    </>
  );
}
