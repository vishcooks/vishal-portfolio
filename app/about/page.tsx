import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Reveal } from "@/components/Reveal";
import { CERTS, EDUCATION, SKILLS } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

const PRINCIPLES = [
  ["Documentation-first", "Every model ships with tested metric definitions, lineage and clear handoffs."],
  ["Insight over method", "Lead with the decision the data unlocks, not the pipeline behind it."],
  ["AI as a force multiplier", "GenAI for SQL generation, docs and conversational analytics — under governance."],
  ["Global-ready", "Handoffs good enough that projects progress 24/7 without real-time oversight."],
];

export default function About() {
  return (
    <>
      <PageHero eyebrow="About" title={<>Build it, document it, <span className="italic">own it.</span></>} />

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:px-8 lg:grid-cols-[1.3fr_1fr]">
        <Reveal className="space-y-5 text-[17px] leading-relaxed text-cream/75">
          <p>
            I&apos;m an <b className="font-medium text-cream">Analytics Engineer at an enterprise SaaS company</b>, embedded in the Product organization. I work with Product
            Managers, Product Strategy and Engineering leadership to make GTM and product data trustworthy, documented and genuinely self-serve.
          </p>
          <p>
            Over 4+ years I&apos;ve built dbt and Snowflake models that power <b className="font-medium text-cream">$300M+ ARR</b> planning, forecasting and
            revenue analytics — across the full ELT lifecycle: PySpark &amp; Delta Lake pipelines, medallion modeling and Power BI / Tableau delivery.
          </p>
          <p>
            Recently I&apos;ve been building GenAI-powered apps on Snowflake for predictive churn and product adoption, using Cortex Analyst and AWS
            Bedrock to bring insights directly to revenue leadership — and shipping changes through MCP-connected, agent-assisted workflows under
            team governance.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="grid content-start gap-3">
          {PRINCIPLES.map(([t, b], i) => (
            <div key={t} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <p className="flex items-center gap-3 font-medium"><span className="font-mono text-xs text-coral">0{i + 1}</span>{t}</p>
              <p className="mt-1.5 pl-8 text-sm text-cream/55">{b}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="bg-cream text-navy">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <Reveal>
            <Eyebrow dark>Skills &amp; tooling</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-light tracking-tight md:text-5xl">The stack I reach for</h2>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(SKILLS).map(([group, items], i) => (
              <Reveal key={group} delay={(i % 3) * 0.05} className="bg-cream p-7">
                <h3 className="text-sm font-semibold">{group}</h3>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {items.map((s) => (
                    <li key={s} className="rounded-full border border-navy/15 px-3 py-1 text-xs text-navy/75">{s}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:px-8">
        {[["Certifications", CERTS], ["Education", EDUCATION]].map(([title, rows]) => (
          <Reveal key={title as string}>
            <Eyebrow>{title as string}</Eyebrow>
            <ul className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {(rows as string[][]).map(([n, y]) => (
                <li key={n} className="flex items-baseline justify-between gap-6 py-4">
                  <span className="text-cream/85">{n}</span>
                  <span className="shrink-0 font-mono text-xs text-cream/40">{y}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </section>
    </>
  );
}
