import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { DashboardCard } from "@/components/DashboardCard";
import { Eyebrow, Reveal } from "@/components/Reveal";
import { Backdrop } from "@/components/Backdrop";
import { Lineage } from "@/components/Lineage";
import { Experience } from "@/components/Experience";
import { CountUp } from "@/components/motion";
import { DASHBOARDS, SITE, SKILLS } from "@/lib/site";

const STATS = [
  { to: 300, prefix: "$", suffix: "M+", label: "ARR planned on models I built" },
  { to: 75, suffix: "%", label: "less manual report prep" },
  { to: 15, suffix: "M+", label: "records migrated, 100% reconciled" },
  { to: 25, suffix: "+", label: "production dashboards owned" },
];

export default function Home() {
  const stack = Object.values(SKILLS).flat();
  return (
    <>
      <Hero />

      <section className="bg-cream text-navy">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid grid-cols-2 gap-y-10 border-b border-navy/10 pb-16 md:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className={i ? "md:border-l md:border-navy/10 md:pl-8" : ""}>
                <p className="font-display text-5xl font-light tracking-tight md:text-6xl">
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-2 max-w-[14rem] text-sm text-navy/60">{s.label}</p>
              </Reveal>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6 pt-16">
            <Reveal>
              <Eyebrow dark>Featured work</Eyebrow>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
                Two production reports, <span className="italic text-coral">rebuilt to click.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-sm text-sm leading-relaxed text-navy/65">
                Every published page from the original Power BI files — slicers, pivots, drill-downs and exports — running in your browser on synthetic data.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {DASHBOARDS.map((d, i) => (
              <Reveal key={d.slug} delay={i * 0.1}>
                <DashboardCard d={d} index={i} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 flex justify-center">
            <Link href="/projects/" className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-5 py-2.5 text-sm transition hover:border-navy hover:bg-navy hover:text-cream">
              All projects & case studies <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Lineage />

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Experience</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
              Four years, one thread: <span className="italic">make the number trustworthy.</span>
            </h2>
          </div>
          <Link href="/resume/" className="inline-flex items-center gap-1.5 text-sm text-cream/70 hover:text-coral">
            Full résumé <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <Experience />
      </section>

      <section className="overflow-hidden border-y border-white/[0.07] py-8" aria-label="Tech stack">
        <div className="flex w-max animate-[marquee_60s_linear_infinite] gap-10 whitespace-nowrap hover:[animation-play-state:paused]">
          {[...stack, ...stack].map((s, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-2xl font-light text-cream/40 transition hover:text-cream" aria-hidden={i >= stack.length}>
              {s} <span className="size-1.5 rounded-full bg-coral/70" />
            </span>
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <Backdrop intensity={0.8} />
        <div className="relative mx-auto max-w-7xl px-5 py-28 text-center md:px-8 md:py-36">
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
              Messy revenue data and a leadership review on Friday?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-cream/65">I&apos;m always up for a conversation about Snowflake, dbt, semantic models or GenAI-powered BI.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-medium text-navy transition hover:bg-coral-600">
                Email me <ArrowUpRight className="size-4" />
              </a>
              <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm">
                LinkedIn <ArrowUpRight className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
