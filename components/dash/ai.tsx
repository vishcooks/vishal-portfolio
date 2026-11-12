"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowRight, Bot, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { isBooking, isPipeline, type OppLine } from "@/lib/data/lines";
import { money, MONTHS, pct } from "@/lib/format";
import { groupSum, sum, distinct, Panel } from "./ui";

const axis = { stroke: "rgba(244,237,224,0.35)", fontSize: 11, tickLine: false, axisLine: false } as const;

/* ---------------- generated insights (Pulse-style) ---------------- */

export interface Insight {
  tone: "good" | "warn" | "info";
  text: string;
}

export function genInsights(lines: OppLine[]): Insight[] {
  const out: Insight[] = [];
  const book = lines.filter(isBooking);
  const pipe = lines.filter(isPipeline);

  const years = [...new Set(book.map((r) => r.year))].sort();
  const cur = years[years.length - 1];
  const prev = years[years.length - 2];
  if (cur && prev) {
    const maxMonth = Math.max(...book.filter((r) => r.year === cur).map((r) => r.month));
    const a = sum(book.filter((r) => r.year === cur && r.month <= maxMonth), (r) => r.arr);
    const b = sum(book.filter((r) => r.year === prev && r.month <= maxMonth), (r) => r.arr);
    if (b > 0) {
      const d = Math.round((a / b - 1) * 100);
      out.push({
        tone: d >= 0 ? "good" : "warn",
        text: `Closed bookings are tracking ${d >= 0 ? "+" : ""}${d}% vs ${prev} year-to-date — ${money(a)} vs ${money(b)} through ${MONTHS[maxMonth - 1]}.`,
      });
    }
  }

  const pipeTotal = sum(pipe, (r) => r.arrOtf);
  if (pipeTotal > 0) {
    const top = groupSum(pipe, (r) => r.account, (r) => r.arrOtf)[0];
    const share = top.value / pipeTotal;
    out.push(
      share > 0.1
        ? { tone: "warn", text: `${top.name} alone is ${pct(share, 0)} of open pipeline (${money(top.value)}) — concentration risk worth watching.` }
        : { tone: "info", text: `Pipeline is well diversified — the largest account is ${pct(share, 0)} of open value.` },
    );
  }

  const byM = new Map<string, number>();
  book.forEach((r) => byM.set(`${r.year}-${r.month}`, (byM.get(`${r.year}-${r.month}`) ?? 0) + r.arr));
  const vals = [...byM.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (vals.length > 6) {
    const mean = vals.reduce((s, [, v]) => s + v, 0) / vals.length;
    const sd = Math.sqrt(vals.reduce((s, [, v]) => s + (v - mean) ** 2, 0) / vals.length) || 1;
    const [k, v] = vals.reduce((mx, e) => (Math.abs(e[1] - mean) > Math.abs(mx[1] - mean) ? e : mx));
    const z = (v - mean) / sd;
    if (Math.abs(z) > 1.5) {
      const [y, m] = k.split("-").map(Number);
      const driver = groupSum(book.filter((r) => r.year === y && r.month === m), (r) => r.productType, (r) => r.arr)[0];
      out.push({
        tone: z > 0 ? "good" : "warn",
        text: `${MONTHS[m - 1]} ${y} bookings ${z > 0 ? "spiked" : "dipped"} ${Math.abs(Math.round((v / mean - 1) * 100))}% vs the average month${driver ? `, led by ${driver.name}` : ""} — flagged as an outlier.`,
      });
    }
  }

  const aiBook = book.filter((r) => r.isAI);
  if (aiBook.length && book.length) {
    const share = sum(aiBook, (r) => r.arr) / Math.max(1, sum(book, (r) => r.arr));
    out.push({ tone: "info", text: `AI products are ${pct(share, 0)} of booked ARR in the current slice — adoption keeps compounding.` });
  }
  return out.slice(0, 4);
}

const TONE = {
  good: { icon: TrendingUp, cls: "text-teal", bg: "bg-teal/15" },
  warn: { icon: AlertTriangle, cls: "text-sand", bg: "bg-sand/15" },
  info: { icon: Sparkles, cls: "text-lilac", bg: "bg-lilac/15" },
} as const;

export function InsightStrip({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;
  return (
    <section className="rounded-2xl border border-lilac/25 bg-gradient-to-br from-lilac/[0.09] via-white/[0.02] to-transparent p-4">
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-lilac">
          <Sparkles className="size-3.5" /> Generated insights
        </span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-cream/40">recomputed on every filter</span>
      </header>
      <ul className="grid gap-2 md:grid-cols-2">
        {insights.map((i, k) => {
          const T = TONE[i.tone];
          return (
            <li key={k} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-navy-900/50 px-3.5 py-3">
              <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${T.bg}`}>
                <T.icon className={`size-3.5 ${T.cls}`} />
              </span>
              <p className="text-[12.5px] leading-relaxed text-cream/80">{i.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------- churn / risk scoring ---------------- */

export interface RiskBucket {
  name: string;
  value: number;
  n: number;
}

export function churnRisk(lines: OppLine[]): { buckets: RiskBucket[]; atRisk: number } {
  const book = lines.filter(isBooking);
  const years = [...new Set(book.map((r) => r.year))].sort();
  const cur = years[years.length - 1];
  const prev = years[years.length - 2];
  const acc = new Map<string, { cur: number; prev: number }>();
  book.forEach((r) => {
    const e = acc.get(r.account) ?? { cur: 0, prev: 0 };
    if (r.year === cur) e.cur += r.arr;
    else if (r.year === prev) e.prev += r.arr;
    acc.set(r.account, e);
  });
  const buckets: RiskBucket[] = [
    { name: "High risk", value: 0, n: 0 },
    { name: "Watch", value: 0, n: 0 },
    { name: "Stable", value: 0, n: 0 },
  ];
  acc.forEach(({ cur: c, prev: p }) => {
    const v = Math.max(c, p);
    if (p > 0 && c < p * 0.55) {
      buckets[0].value += v; buckets[0].n++;
    } else if (p > 0 && c < p) {
      buckets[1].value += v; buckets[1].n++;
    } else {
      buckets[2].value += v; buckets[2].n++;
    }
  });
  return { buckets, atRisk: buckets[0].value };
}

export function RiskPanel({ lines }: { lines: OppLine[] }) {
  const { buckets } = useMemo(() => churnRisk(lines), [lines]);
  const total = sum(buckets, (b) => b.value) || 1;
  return (
    <Panel title="Churn propensity" subtitle="Account-level scoring · booked ARR trend signal">
      <div className="flex h-full flex-col gap-3">
        {buckets.map((b, i) => (
          <div key={b.name}>
            <div className="mb-1 flex items-baseline justify-between text-[11px]">
              <span className="text-cream/70">{b.name} <span className="text-cream/35">· {b.n} accts</span></span>
              <span className="tabular-nums text-cream/55">{money(b.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(b.value / total) * 100}%`, background: i === 0 ? "#FF6B58" : i === 1 ? "#E8B87D" : "#5EC4B6" }}
              />
            </div>
          </div>
        ))}
        <p className="mt-auto flex items-center gap-1.5 border-t border-white/[0.07] pt-3 text-[10.5px] text-cream/40">
          <Bot className="size-3.5 text-lilac" /> Propensity score · YoY booked-ARR contraction model
        </p>
      </div>
    </Panel>
  );
}

/* ---------------- Ask the data (NLQ) ---------------- */

interface QA {
  q: string;
  a: ReactNode;
}

function answer(q: string, lines: OppLine[]): string | null {
  const s = q.toLowerCase();
  const book = lines.filter(isBooking);
  const pipe = lines.filter(isPipeline);
  const has = (...ws: string[]) => ws.some((w) => s.includes(w));

  if (has("attach", "sar")) {
    return "Attach rate lives on the Service Attach Rate tabs — unit-based (share of deals with a services line) and bookings-$ (services bookings ÷ product bookings). Filter the exec view to a product family to see how attach moves.";
  }
  if (has("forecast", "land", "quarter", "exit")) {
    const w = { Closed: 1, Commit: 0.9, "Best Case": 0.55 } as Record<string, number>;
    const fc = sum(lines.filter((r) => w[r.forecast] !== undefined), (r) => r.arrOtf * w[r.forecast]);
    return `Weighted forecast for the selected slice is ≈ ${money(fc)} (Closed 100% · Commit 90% · Best Case 55%, pipeline excluded). See the Weighted Forecast tab for the full model and confidence band.`;
  }
  if (has("churn", "risk", "contraction", "renewal")) {
    const { buckets, atRisk } = churnRisk(lines);
    return `${money(atRisk)} of booked ARR sits in high-risk accounts — ${buckets[0].n} accounts whose current-year bookings are tracking below 55% of last year. ${buckets[1].n} more are on watch.`;
  }
  if (has("ai", "genai", "artificial")) {
    const ai = book.filter((r) => r.isAI);
    const share = sum(ai, (r) => r.arr) / Math.max(1, sum(book, (r) => r.arr));
    const top = groupSum(ai, (r) => r.productName, (r) => r.arr)[0];
    return ai.length
      ? `AI products hold ${pct(share, 0)} of booked ARR (${money(sum(ai, (r) => r.arr))}). ${top?.name ?? "—"} is the top AI product. The AI Products tab breaks this down monthly.`
      : "No AI product lines in the current filter selection.";
  }
  if (has("book", "closed", "won", "revenue", "arr")) {
    if (!book.length) return "No closed bookings in the current filter selection.";
    const top = groupSum(book, (r) => r.account, (r) => r.arrOtf)[0];
    return `Closed bookings total ${money(sum(book, (r) => r.arrOtf))} — net ARR ${money(sum(book, (r) => r.arr))} plus ${money(sum(book, (r) => r.otf))} in one-time fees, across ${distinct(book, (r) => r.account)} accounts. ${top.name} leads at ${money(top.value)}.`;
  }
  if (has("pipeline", "open", "commit", "best case")) {
    if (!pipe.length) return "No open pipeline in the current filter selection.";
    const top = groupSum(pipe, (r) => r.account, (r) => r.arrOtf)[0];
    return `Open pipeline is ${money(sum(pipe, (r) => r.arrOtf))} across ${distinct(pipe, (r) => r.oppId)} opportunities — ${money(top.value)} of it sits in ${top.name}.`;
  }
  if (has("top", "biggest", "largest", "who")) {
    const top = groupSum(lines, (r) => r.account, (r) => r.arrOtf)[0];
    return top ? `${top.name} is the largest account in this view at ${money(top.value)} of Net ARR + one-time fees.` : null;
  }
  return null;
}

export function AskData({ lines, hints = ["How are bookings tracking?", "What's in the pipeline?", "How much is AI?", "Where's the churn risk?"] }: { lines: OppLine[]; hints?: string[] }) {
  const [q, setQ] = useState("");
  const [qa, setQa] = useState<QA | null>(null);
  const ask = (query: string) => {
    const t = query.trim();
    if (!t) return;
    setQa({ q: t, a: answer(t, lines) ?? "That question isn't covered by this view — try bookings, pipeline, AI share, forecast, churn risk or top accounts." });
  };
  return (
    <Panel
      title="Ask the data"
      subtitle="Natural-language query over the current filter slice"
      action={<span className="inline-flex items-center gap-1 rounded-full border border-lilac/30 bg-lilac/10 px-2 py-0.5 text-[10px] text-lilac"><Sparkles className="size-3" /> NLQ</span>}
    >
      <div className="flex h-full flex-col gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(q);
            setQ("");
          }}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-navy-900/60 px-3 py-2 focus-within:border-lilac/50"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask about bookings, pipeline, AI share, risk…"
            className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-cream/30"
            aria-label="Ask a question about the data"
          />
          <button type="submit" className="grid size-6 shrink-0 place-items-center rounded-full bg-coral text-navy" aria-label="Ask">
            <ArrowRight className="size-3.5" />
          </button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          {hints.map((h) => (
            <button key={h} onClick={() => ask(h)} className="rounded-full border border-white/10 px-2.5 py-1 text-[10.5px] text-cream/50 transition hover:border-lilac/40 hover:text-cream">
              {h}
            </button>
          ))}
        </div>
        {qa && (
          <div className="rounded-xl border border-lilac/20 bg-lilac/[0.06] p-3.5">
            <p className="mb-1 text-[10.5px] font-medium uppercase tracking-widest text-lilac/80">“{qa.q}”</p>
            <p className="text-[13px] leading-relaxed text-cream/85">{qa.a}</p>
            <p className="mt-2 text-[10px] text-cream/30">Answered deterministically from the filtered rows — no model call.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}

/* ---------------- forecast w/ confidence band ---------------- */

export interface BandPoint {
  name: string;
  actual?: number;
  projected?: number;
  band?: [number, number];
}

export function ForecastBand({
  data, fmt = (v: number) => money(v), height = 260,
}: { data: BandPoint[]; fmt?: (v: number) => string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="band-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A99BE0" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#A99BE0" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(244,237,224,0.06)" vertical={false} />
        <XAxis dataKey="name" {...axis} minTickGap={16} />
        <YAxis {...axis} tickFormatter={(v) => fmt(Number(v))} width={56} />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div className="rounded-xl border border-white/10 bg-navy-800/95 px-3 py-2 text-xs shadow-xl">
                <p className="mb-1 text-cream/50">{label}</p>
                {payload
                  .filter((p) => p.dataKey !== "band")
                  .map((p, i) => (
                    <p key={i} className="flex items-center gap-2 text-cream">
                      <span className="size-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-cream/70">{p.name === "projected" ? "Projected" : "Weighted actual"}</span>
                      <span className="ml-auto pl-3 font-medium tabular-nums">{fmt(Number(p.value))}</span>
                    </p>
                  ))}
              </div>
            ) : null
          }
          cursor={{ stroke: "rgba(244,237,224,0.15)" }}
        />
        <Area dataKey="band" stroke="none" fill="url(#band-g)" name="90% interval" animationDuration={900} />
        <Line dataKey="actual" stroke="#8FB2E3" strokeWidth={2} dot={false} name="actual" animationDuration={800} />
        <Line dataKey="projected" stroke="#A99BE0" strokeWidth={2} strokeDasharray="5 4" dot={false} name="projected" animationDuration={800} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ConfidenceBadge({ level }: { level: "high" | "mixed" | "low" }) {
  const map = {
    high: ["High confidence", "border-teal/30 bg-teal/10 text-teal"],
    mixed: ["Mixed signals", "border-sand/30 bg-sand/10 text-sand"],
    low: ["Low confidence", "border-coral/30 bg-coral/10 text-coral"],
  } as const;
  const [label, cls] = map[level];
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] ${cls}`}><ShieldAlert className="size-3" /> {label}</span>;
}
