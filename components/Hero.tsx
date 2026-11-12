"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BrainCircuit, Database, LineChart, Network, Workflow } from "lucide-react";
import { Backdrop } from "./Backdrop";
import { KineticHeadline, Magnetic, PointerGlow } from "./motion";
import { DASHBOARDS } from "@/lib/site";

const FEATURES = [
  { icon: Database, label: "dbt + Snowflake", sub: "governed medallion models" },
  { icon: BrainCircuit, label: "GenAI & LLMs", sub: "Cortex · Bedrock" },
  { icon: LineChart, label: "Power BI · DAX", sub: "exec semantic layers" },
  { icon: Workflow, label: "PySpark · Delta", sub: "15M+ rows, 100% reconciled" },
  { icon: Network, label: "MCP · Agents", sub: "AI-augmented delivery" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-16">
      <Backdrop />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
        <PointerGlow />
      </div>
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 md:px-8">
        <div className="grid flex-1 items-end gap-10 pb-10 pt-10 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:pt-16">
          <div className="flex h-full flex-col justify-end lg:pt-40">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="glass mb-6 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs text-cream/80"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-coral" />
              </span>
              Analytics Engineer · Bengaluru, India
            </motion.p>
            <KineticHeadline
              delay={0.1}
              className="font-display text-[clamp(2.75rem,6vw,5.25rem)] font-light leading-[0.98] tracking-[-0.035em] text-cream"
              lines={[{ text: "Revenue data that" }, { text: "answers back.", className: "italic text-cream/90" }]}
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease }}
              className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream/70 md:text-base"
            >
              I&apos;m Vishal — I build the dbt + Snowflake models, semantic layers and GenAI apps behind $300M+ of ARR planning.
              Fewer spreadsheets, faster answers, one number everyone trusts.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease }}
              className="mt-8 flex flex-wrap items-center gap-5"
            >
              <Magnetic>
                <Link href="/projects/" className="group inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-medium text-navy shadow-lg shadow-coral/25 transition hover:bg-coral-600">
                  Explore the dashboards <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </Link>
              </Magnetic>
              <Link href="/resume/" className="inline-flex items-center gap-1.5 text-sm text-cream/85 hover:text-cream">
                View résumé <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.45, ease }}
            className="glass w-full max-w-md justify-self-end rounded-3xl p-4 shadow-2xl shadow-black/30"
          >
            <div className="flex items-center justify-between px-1 pb-3">
              <p className="flex items-center gap-2 text-xs text-cream/70">
                <LineChart className="size-3.5" /> Live dashboards, synthetic data
              </p>
              <span className="text-[11px] text-cream/45">2 reports</span>
            </div>
            <div className="space-y-2.5">
              {DASHBOARDS.map((d, i) => (
                <Link key={d.slug} href={`/projects/${d.slug}/`} className="group block rounded-2xl border border-white/10 bg-navy-900/35 p-3.5 transition hover:border-coral/50 hover:bg-navy-900/55">
                  <div className="flex items-center justify-between text-[11px] text-cream/50">
                    <span>{d.kicker.split("·")[0].trim()}</span>
                    <span>{d.pages.length} pages</span>
                  </div>
                  <p className="mt-1 text-[15px] font-medium leading-snug text-cream">{d.title}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <MiniSpark seed={i} />
                    <span className="inline-flex items-center gap-1 text-xs text-cream/60 transition group-hover:text-coral">
                      Open <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/projects/" className="mt-3 inline-flex rounded-full bg-coral px-3 py-1.5 text-[11px] font-medium text-navy">
              See all work →
            </Link>
          </motion.aside>
        </div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {FEATURES.map((f, i) => (
            <li key={f.label} className={`relative px-1 py-5 pr-4 lg:border-l lg:border-white/10 lg:px-5 ${i === 0 ? "lg:border-l-0 lg:pl-0" : ""}`}>
              {i === 0 && <span className="absolute -top-px left-0 h-0.5 w-16 bg-coral" />}
              <f.icon className={`size-4 ${i === 0 ? "text-coral" : "text-cream/60"}`} />
              <p className={`mt-2 text-[13px] ${i === 0 ? "text-coral" : "text-cream/85"}`}>{f.label}</p>
              <p className="text-xs text-cream/45">{f.sub}</p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

function MiniSpark({ seed }: { seed: number }) {
  const pts = seed === 0 ? [8, 12, 10, 16, 14, 20, 18, 26, 24, 30] : [10, 9, 14, 13, 18, 16, 22, 21, 27, 29];
  const d = pts.map((y, i) => `${i === 0 ? "M" : "L"}${i * 12} ${34 - y}`).join(" ");
  return (
    <svg viewBox="0 0 108 36" className="h-9 w-28" aria-hidden>
      <defs>
        <linearGradient id={`sp-${seed}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FF6B58" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FF6B58" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L108 36 L0 36Z`} fill={`url(#sp-${seed})`} />
      <path d={d} fill="none" stroke="#FF6B58" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
