"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

const STAGES = [
  {
    key: "source",
    label: "Source",
    title: "Start with the mess.",
    body: "CRM opportunities, CPQ quote lines, billing exports. Duplicates, mixed currencies, product names typed five different ways.",
  },
  {
    key: "model",
    label: "Model",
    title: "Model it once, in dbt.",
    body: "Staging → intermediate → marts on Snowflake. Conformed product, account and close-date dimensions everyone joins to.",
  },
  {
    key: "metric",
    label: "Metric",
    title: "Define the number. Test the number.",
    body: "Net ARR, OTF and TCV defined once in the semantic layer — with tests that fail loudly before a VP ever sees a wrong figure.",
  },
  {
    key: "decision",
    label: "Decision",
    title: "Ship the answer, not the query.",
    body: "Power BI for the operating rhythm, Cortex & Bedrock for the “why” — plain-English narratives on top of governed data.",
  },
] as const;

export function Lineage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(STAGES.length - 1, Math.floor(v * STAGES.length))));
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative lg:h-[340vh]" aria-label="How I work: source to decision">
      <div className="relative lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]"
          style={{ backgroundImage: "radial-gradient(rgba(244,237,224,0.18) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-5 py-24 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-0 [&>*]:min-w-0">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/45">How I work · source → decision</p>
            <div className="relative mt-10 hidden pl-6 lg:block">
              <div className="absolute left-0 top-1 h-[calc(100%-8px)] w-px bg-white/10">
                <motion.div className="w-px bg-coral" style={{ height: bar }} />
              </div>
              {STAGES.map((s, i) => (
                <div key={s.key} className={`pb-9 transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-30"}`}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-coral">{s.label}</p>
                  <h3 className="mt-2 font-display text-3xl font-light tracking-tight">{s.title}</h3>
                  <AnimatePresence initial={false}>
                    {i === active && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-md overflow-hidden pt-2 text-[15px] leading-relaxed text-cream/60"
                      >
                        {s.body}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <Stage index={active} />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:hidden [&>*]:min-w-0">
            {STAGES.map((s, i) => (
              <div key={s.key}>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-coral">{s.label}</p>
                <h3 className="mt-2 font-display text-2xl font-light tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">{s.body}</p>
                <div className="mt-5"><Stage index={i} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stage({ index }: { index: number }) {
  const s = STAGES[index];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-navy-800/70 shadow-2xl shadow-black/30">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 font-mono text-[11px] text-cream/45">
        <span className="size-2 rounded-full bg-coral/70" />
        {["raw.salesforce_opportunity_line", "models/marts/fct_bookings.sql", "semantic/measures.dax", "exec_summary · narrative"][index]}
      </div>
      <div className="h-[380px] p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.45 }}
            className="h-full"
          >
            {index === 0 && <RawRows />}
            {index === 1 && <Code lines={SQL} />}
            {index === 2 && <Metric />}
            {index === 3 && <Decision />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const RAW = [
  ["0068x…A1", "Pro Arch - email ", "USD", "12,400", "Closed Won"],
  ["0068x…A1", "Pro Arch - email ", "USD", "12,400", "Closed Won"],
  ["0068x…B7", "ProArchive Email", "EUR", "9,850", "closed won"],
  ["0068x…C2", "PA-EML", "USD", "NULL", "Commit"],
  ["0068x…D9", "Mobile Txt Capture", "GBP", "7,200", "Best case"],
  ["0068x…E4", "AI Risk Scoring", "USD", "-3,100", "Closed Won"],
  ["0068x…F0", "pro archive (email)", "USD", "15,000", "Pipeline"],
];

function RawRows() {
  return (
    <div className="font-mono text-[11.5px]">
      <div className="grid grid-cols-[1fr_1.6fr_0.6fr_0.8fr_1fr] gap-2 border-b border-white/10 pb-2 text-cream/40">
        <span>opp_id</span><span>product_name</span><span>ccy</span><span>arr</span><span>stage</span>
      </div>
      {RAW.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`grid grid-cols-[1fr_1.6fr_0.6fr_0.8fr_1fr] gap-2 border-b border-white/[0.04] py-2 ${i === 1 ? "text-coral/80 line-through decoration-coral/60" : "text-cream/70"}`}
        >
          {r.map((c, j) => (
            <span key={j} className={`truncate ${c === "NULL" || c.startsWith("-") || c.endsWith(" ") ? "text-coral" : ""}`}>{c}</span>
          ))}
        </motion.div>
      ))}
      <p className="mt-4 text-[11px] text-cream/40">
        <span className="text-coral">4 issues</span> · duplicate line · trailing whitespace · null ARR · 3 currencies
      </p>
    </div>
  );
}

const SQL = [
  ["k", "with "], ["t", "lines "], ["k", "as "], ["p", "("],
  ["n", ""],
  ["k", "  select "], ["t", "opp_id, product_key, close_date,"],
  ["n", ""],
  ["t", "         "], ["f", "convert_ccy"], ["t", "(arr, ccy, close_date) "], ["k", "as "], ["t", "net_arr"],
  ["n", ""],
  ["k", "  from "], ["f", "{{ ref('int_opportunity_lines') }}"],
  ["n", ""],
  ["k", "  qualify "], ["f", "row_number"], ["t", "() "], ["k", "over "], ["t", "(partition by line_id) = 1"],
  ["n", ""],
  ["p", ")"],
  ["n", ""],
  ["k", "select "], ["t", "l.*, p.product_type, p.is_ai_sku, f.forecast_category"],
  ["n", ""],
  ["k", "from "], ["t", "lines l"],
  ["n", ""],
  ["k", "join "], ["f", "{{ ref('dim_product') }}"], ["t", " p "], ["k", "using "], ["t", "(product_key)"],
  ["n", ""],
  ["k", "join "], ["f", "{{ ref('dim_forecast') }}"], ["t", " f "], ["k", "using "], ["t", "(stage)"],
] as const;

function Code({ lines }: { lines: typeof SQL }) {
  const rows: (typeof SQL)[number][][] = [[]];
  lines.forEach((t) => (t[0] === "n" ? rows.push([]) : rows[rows.length - 1].push(t)));
  const color = { k: "text-coral", t: "text-cream/75", f: "text-sky", p: "text-sand", n: "" } as const;
  return (
    <pre className="scrollbar-thin overflow-x-auto font-mono text-[12px] leading-6">
      {rows.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }} className="flex">
          <span className="mr-4 w-5 select-none text-right text-cream/20">{i + 1}</span>
          <span>{r.map((t, j) => <span key={j} className={color[t[0]]}>{t[1]}</span>)}</span>
        </motion.div>
      ))}
    </pre>
  );
}

function Metric() {
  const tests = ["not_null(net_arr)", "unique(line_id)", "accepted_values(forecast)", "ties_to_finance(± 0.5%)"];
  return (
    <div className="flex h-full flex-col">
      <pre className="rounded-2xl bg-navy-900/60 p-4 font-mono text-[12px] leading-6 text-cream/80">
        <span className="text-sky">Net ARR</span> ={"\n"}
        <span className="text-coral">CALCULATE</span>({"\n"}
        {"    "}<span className="text-coral">SUM</span>(fct_bookings[net_arr]),{"\n"}
        {"    "}dim_forecast[category] = <span className="text-sand">&quot;Closed&quot;</span>{"\n"}
        )
      </pre>
      <ul className="mt-5 grid gap-2">
        {tests.map((t, i) => (
          <motion.li
            key={t}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.15 }}
            className="flex items-center justify-between rounded-xl border border-white/[0.07] px-3 py-2 font-mono text-[12px]"
          >
            <span className="text-cream/70">{t}</span>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.45 + i * 0.15, type: "spring" }} className="rounded-full bg-teal/15 px-2 py-0.5 text-[10.5px] text-teal">
              PASS
            </motion.span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const NARRATIVE = "Commit is tracking 12% ahead of last quarter. Three enterprise renewals drive 41% of the gap — all have services attached, so expect OTF to land early.";

function Decision() {
  const bars = [38, 44, 41, 52, 49, 61, 58, 72];
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {[["Bookings", "$4.8M"], ["Commit", "$1.9M"], ["Attach", "47%"]].map(([k, v], i) => (
          <div key={k} className="rounded-xl border border-white/[0.07] bg-navy-900/50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-cream/40">{k}</p>
            <p className={`font-display text-xl font-light ${i === 0 ? "text-coral" : ""}`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="flex h-28 items-end gap-2">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 rounded-t-md"
            style={{ background: i === bars.length - 1 ? "#FF6B58" : "rgba(143,178,227,0.45)" }}
          />
        ))}
      </div>
      <div className="mt-auto rounded-2xl border border-coral/25 bg-coral/[0.07] p-4">
        <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-widest text-coral">Generated insight</p>
        <p className="text-[13px] leading-relaxed text-cream/85">
          {NARRATIVE.split(" ").map((w, i) => (
            <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.035 }}>
              {w}{" "}
            </motion.span>
          ))}
        </p>
      </div>
    </div>
  );
}
