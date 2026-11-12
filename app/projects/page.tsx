import type { Metadata } from "next";
import { DashboardCard } from "@/components/DashboardCard";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Reveal } from "@/components/Reveal";
import { CASE_STUDIES, DASHBOARDS } from "@/lib/site";

export const metadata: Metadata = { title: "Work" };

export default function Projects() {
  return (
    <>
      <PageHero eyebrow="Work" title={<>From raw data to <span className="italic">boardroom decisions.</span></>}>
        <p className="mt-6 max-w-2xl text-cream/65">
          Two interactive dashboards rebuilt from my production Power BI reports, plus the analytics-engineering and GenAI work behind them.
        </p>
      </PageHero>

      <section className="bg-cream text-navy">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <Reveal>
            <Eyebrow dark>Interactive dashboards</Eyebrow>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {DASHBOARDS.map((d, i) => (
              <Reveal key={d.slug} delay={i * 0.1}>
                <DashboardCard d={d} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <Eyebrow>Case studies</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-light tracking-tight md:text-5xl">The systems underneath</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDIES.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 0.06} className="flex">
              <article className="flex w-full flex-col rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 transition hover:border-coral/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-coral">{c.cat}</span>
                  <span className="font-mono text-cream/30">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-medium tracking-tight">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/60">{c.body}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {c.metrics.map(([v, l]) => (
                    <div key={l} className="rounded-2xl bg-navy-800 p-3">
                      <p className="font-display text-xl font-light">{v}</p>
                      <p className="text-[11px] text-cream/45">{l}</p>
                    </div>
                  ))}
                </div>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                  {c.tags.map((t) => (
                    <li key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-cream/55">{t}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
