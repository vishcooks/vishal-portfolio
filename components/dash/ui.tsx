"use client";

import type { ReactNode } from "react";
import { money, num } from "@/lib/format";

export function Panel({
  title, subtitle, children, className = "", action,
}: { title?: string; subtitle?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-[13px] font-medium tracking-tight text-cream/90">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[11px] text-cream/40">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function Kpi({ label, value, accent, hint }: { label: string; value: string; accent?: boolean; hint?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-navy-900/40 px-3.5 py-3">
      <p className="truncate text-[10.5px] uppercase tracking-[0.12em] text-cream/45">{label}</p>
      <p className={`mt-1 truncate font-display text-xl font-light tabular-nums ${accent ? "text-coral" : "text-cream"}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 truncate text-[10.5px] text-cream/35">{hint}</p>}
    </div>
  );
}

export function KpiGroup({
  title, items, tone = "pipeline",
}: { title: string; items: { label: string; value: string; hint?: string }[]; tone?: "pipeline" | "bookings" }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={`size-1.5 rounded-full ${tone === "bookings" ? "bg-coral" : "bg-sky"}`} />
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-cream/60">{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((k, i) => (
          <Kpi key={k.label} {...k} accent={tone === "bookings" && i === 0} />
        ))}
      </div>
    </div>
  );
}

export function PageTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <h2 className="font-display text-2xl font-light tracking-tight text-cream md:text-[28px]">{title}</h2>
      {note && <p className="text-xs text-cream/40">{note}</p>}
    </div>
  );
}

export const sum = <T,>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0);
export const distinct = <T,>(rows: T[], f: (r: T) => string) => new Set(rows.map(f)).size;

export function groupSum<T>(rows: T[], key: (r: T) => string, val: (r: T) => number, top?: number) {
  const m = new Map<string, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + val(r));
  const out = Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  return top ? out.slice(0, top) : out;
}

export interface MoneyRow {
  arr: number;
  otf: number;
  arrOtf: number;
  tcv: number;
  account: string;
}

export function standardKpis(rows: MoneyRow[], variant: "arr" | "services") {
  const arr = sum(rows, (r) => r.arr);
  const otf = sum(rows, (r) => r.otf);
  return variant === "arr"
    ? [
        { label: "Net ARR", value: money(arr) },
        { label: "One-Time Fees", value: money(otf) },
        { label: "Contract Value", value: money(sum(rows, (r) => r.tcv)) },
        { label: "Customers", value: num(distinct(rows, (r) => r.account)) },
      ]
    : [
        { label: "Net Services ARR", value: money(arr) },
        { label: "One-Time Fees", value: money(otf) },
        { label: "Net ARR + Fees", value: money(arr + otf) },
        { label: "Customers", value: num(distinct(rows, (r) => r.account)) },
      ];
}
