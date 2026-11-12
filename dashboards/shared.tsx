"use client";

import { ExternalLink } from "lucide-react";
import type { Column } from "@/components/dash/tables";
import type { FilterDef } from "@/components/dash/filters";
import { isBooking, isPipeline, type OppLine } from "@/lib/data/lines";
import { date, moneyFull, MONTHS, num } from "@/lib/format";

export const L = <K extends keyof OppLine & string>(key: K, label: string, sort?: "desc"): FilterDef<OppLine> => ({ key, label, sort });

export const fYear = L("year", "Close Year", "desc");
export const fForecast = L("forecast", "Forecast");
export const fAccount = L("account", "Account");
export const fBU = L("businessUnit", "Business Unit");
export const fTeam = L("team", "Team");
export const fPType = L("productType", "Product Type");
export const fPName = L("productName", "Product");
export const fChannel = L("channel", "Channel");
export const fType = L("type", "Opp Type");
export const fIndustry = L("industry", "Industry");
export const fAsset = L("assetType", "Asset Type");
export const fOpp = L("oppName", "Opportunity");

export const split = (rows: OppLine[]) => ({ pipe: rows.filter(isPipeline), book: rows.filter(isBooking) });

const link = (id: string) => (
  <span className="inline-flex items-center gap-1 text-sky">
    {id.replace("#", "")} <ExternalLink className="size-3" />
  </span>
);

type Col = Column<OppLine>;
const c = (key: string, label: string, value: (r: OppLine) => string | number, extra: Partial<Col> = {}): Col => ({ key, label, value, ...extra });
const $ = { num: true, total: true, fmt: (v: number) => moneyFull(v) } as const;

export const COLS = {
  account: c("account", "Account", (r) => r.account),
  opp: c("opp", "Opportunity", (r) => r.oppName),
  close: c("close", "Close Date", (r) => r.closeDate, { fmt: (v: string) => date(v) }),
  forecast: c("forecast", "Forecast", (r) => r.forecast, {
    fmt: (v: string) => (
      <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${v === "Closed" ? "bg-coral/15 text-coral" : v === "Commit" ? "bg-teal/15 text-teal" : "bg-white/5 text-cream/60"}`}>{v}</span>
    ),
  }),
  owner: c("owner", "Opp Owner", (r) => r.owner),
  link: c("link", "Link", (r) => r.link, { fmt: (v: string) => link(v) }),
  ps: c("ps", "PS Request Status", (r) => r.psStatus),
  term: c("term", "Quote Term", (r) => r.quoteTerm, { num: true, fmt: (v: number) => `${v} mo` }),
  asset: c("asset", "Asset Type", (r) => r.assetType),
  channel: c("channel", "Channel", (r) => r.channel),
  product: c("product", "Product", (r) => r.productName),
  ptype: c("ptype", "Product Type", (r) => r.productType),
  qty: c("qty", "Net Qty", (r) => r.netQty, { num: true, total: true, fmt: (v: number) => num(v) }),
  commitQty: c("commitQty", "Commit Qty", (r) => r.commitQty, { num: true, total: true, fmt: (v: number) => num(v) }),
  unit: c("unit", "List Unit Price", (r) => r.listUnitPrice, { num: true, fmt: (v: number) => moneyFull(v) }),
  arr: c("arr", "Net ARR", (r) => r.arr, $),
  otf: c("otf", "OTF", (r) => r.otf, $),
  arrOtf: c("arrOtf", "Net ARR + OTF", (r) => r.arrOtf, $),
  tcv: c("tcv", "TCV", (r) => r.tcv, $),
  required: c("required", "Required By", (r) => r.requiredBy, { fmt: (v: string) => date(v) }),
  lead: c("lead", "Lead Source", (r) => r.leadSource),
  resold: c("resold", "Resold By", (r) => r.resoldBy),
  partner: c("partner", "Partner Type", (r) => r.partnerType),
};

export const DETAIL_COLS: Col[] = [
  COLS.account, COLS.close, COLS.forecast, COLS.owner, COLS.product, COLS.ptype, COLS.asset, COLS.channel, COLS.term,
  COLS.qty, COLS.unit, COLS.arr, COLS.otf, COLS.arrOtf, COLS.tcv, COLS.ps, COLS.required, COLS.link,
];

export const PROB_BUCKETS = ["90%+", "50–70%", "10–40%", "<10%"];
export const probBucket = (p: number) => (p >= 90 ? "90%+" : p >= 50 ? "50–70%" : p >= 10 ? "10–40%" : "<10%");

export function topCustomersByProbability(pipe: OppLine[], val: (r: OppLine) => number, n = 10) {
  const byAcc = new Map<string, Record<string, number>>();
  for (const r of pipe) {
    const m = byAcc.get(r.account) ?? {};
    const b = probBucket(r.probability);
    m[b] = (m[b] ?? 0) + val(r);
    m.__t = (m.__t ?? 0) + val(r);
    byAcc.set(r.account, m);
  }
  return Array.from(byAcc)
    .sort(([, a], [, b]) => b.__t - a.__t)
    .slice(0, n)
    .map(([name, m]) => ({ name, ...m }) as Record<string, string | number>);
}

export function monthlyTrend<T extends { closeDate: string }>(rows: T[], series: Record<string, (r: T) => number>) {
  const m = new Map<string, Record<string, number>>();
  for (const r of rows) {
    const k = r.closeDate.slice(0, 7);
    const e = m.get(k) ?? Object.fromEntries(Object.keys(series).map((s) => [s, 0]));
    for (const [s, f] of Object.entries(series)) e[s] += f(r);
    m.set(k, e);
  }
  return Array.from(m)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, e]) => ({ month: `${MONTHS[Number(k.slice(5)) - 1]} ${k.slice(2, 4)}`, ...e }));
}

export const FORECAST_ORDER = ["Closed", "Commit", "Best Case", "Pipeline", "Omitted"];
