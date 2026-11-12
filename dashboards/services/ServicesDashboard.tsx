"use client";

import { useMemo, useState } from "react";
import { DashboardShell, type DashPage } from "@/components/dash/Shell";
import { type FilterDef, SlicerBar, useFilters } from "@/components/dash/filters";
import { BigStat, ColumnChart, ComboChart, DonutChart, FunnelBars, HBarChart, TrendChart } from "@/components/dash/charts";
import { type Column, DataTable, Pivot } from "@/components/dash/tables";
import { groupSum, Kpi, KpiGroup, PageTitle, Panel, standardKpis, sum } from "@/components/dash/ui";
import { type AspDeal, type AspQuoteLine, type AttachDeal, getServicesData, WO_TYPES } from "@/lib/data/services";
import type { OppLine } from "@/lib/data/lines";
import { date, money, moneyFull, MONTHS, num, pct } from "@/lib/format";
import {
  COLS, DETAIL_COLS, fAccount, fAsset, fBU, fChannel, fForecast, fOpp, fPName, fPType, fType, fYear, FORECAST_ORDER,
  L, PROB_BUCKETS, split, topCustomersByProbability,
} from "../shared";

const ao = (r: OppLine) => r.arrOtf;
const fmt$ = (v: number) => money(v);

/* ---------------- Executive Summary ---------------- */
const EXEC_F = [fYear, fAsset];
function ExecutiveSummary() {
  const { lines } = getServicesData();
  const f = useFilters(lines, EXEC_F);
  const { pipe, book } = split(f.filtered);
  const funnel = ["Pipeline", "Best Case", "Commit", "Closed"].map((k) => ({
    name: k,
    value: sum(f.filtered.filter((r) => r.forecast === k), ao),
  }));
  return (
    <div className="grid gap-4">
      <PageTitle title="Exec Summary · SGS Pipeline & Bookings" note="Net ARR + OTF view" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-2">
        <KpiGroup title="Pipeline" items={standardKpis(pipe, "services")} />
        <KpiGroup title="Bookings" tone="bookings" items={standardKpis(book, "services")} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Total Pipeline & Bookings · Net ARR + OTF" subtitle="Close period × forecast category — expand a year">
          <Pivot
            rows={f.filtered.filter((r) => r.forecast !== "Omitted")}
            levels={[{ label: "Close Year", key: (r) => String(r.year), byLabel: true }, { label: "Quarter", key: (r) => r.quarter, byLabel: true }]}
            cols={(r) => r.forecast}
            colOrder={FORECAST_ORDER}
            measures={[{ label: "Net ARR + OTF", value: ao, fmt: fmt$ }]}
            maxHeight={260}
          />
        </Panel>
        <Panel title="Bookings by Asset Type · Net ARR + OTF">
          <DonutChart data={groupSum(book, (r) => r.assetType, ao)} height={240} />
        </Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pipeline by Forecast Category · Net ARR + OTF">
          <FunnelBars data={funnel} />
        </Panel>
        <Panel title="Bookings by Product Type · Net ARR + OTF">
          <HBarChart data={groupSum(book, (r) => r.productType, ao)} />
        </Panel>
      </div>
      <Panel title="Pipeline by Top Customers & Probability · Net ARR + OTF" subtitle="Top 10 accounts, stacked by win probability">
        <HBarChart data={topCustomersByProbability(pipe, ao)} series={PROB_BUCKETS} />
      </Panel>
    </div>
  );
}

/* ---------------- Consolidated Report ---------------- */
const CONS_F = [L("servicesAE", "Services AE"), fYear, fAsset, fForecast, fAccount, fOpp, fPType, fPName, fChannel, fBU, fType];
const SVC_DETAIL = DETAIL_COLS.map((c) => (c.key === "arr" ? { ...c, label: "Net Services ARR" } : c));
function Consolidated() {
  const { lines } = getServicesData();
  const f = useFilters(lines, CONS_F);
  const { pipe, book } = split(f.filtered);
  return (
    <div className="grid gap-4">
      <PageTitle title="SGS Bookings & Pipeline" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-2">
        <KpiGroup title="Open Pipeline (Pipeline, Best Case & Commit)" items={standardKpis(pipe, "services")} />
        <KpiGroup title="Closed Bookings" tone="bookings" items={standardKpis(book, "services")} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Panel title="All Bookings & Pipeline by Close Period · Net ARR + OTF" subtitle="Year › Quarter › Account">
          <Pivot
            rows={f.filtered.filter((r) => r.forecast !== "Omitted")}
            levels={[
              { label: "Close Year", key: (r) => String(r.year), byLabel: true },
              { label: "Quarter", key: (r) => r.quarter, byLabel: true },
              { label: "Account", key: (r) => r.account },
            ]}
            measures={[
              { label: "Net Services ARR", value: (r) => r.arr, fmt: fmt$ },
              { label: "OTF", value: (r) => r.otf, fmt: fmt$ },
              { label: "Net ARR + OTF", value: ao, fmt: fmt$ },
            ]}
            maxHeight={290}
          />
        </Panel>
        <Panel title="Bookings by Asset Type · Net ARR + OTF">
          <DonutChart data={groupSum(book, (r) => r.assetType, ao)} height={270} />
        </Panel>
      </div>
      <Panel title="Detailed View (Pipeline + Bookings)">
        <DataTable rows={f.filtered} columns={[...SVC_DETAIL.slice(0, 10), COLS.commitQty, ...SVC_DETAIL.slice(10)]} title="sgs-consolidated" />
      </Panel>
    </div>
  );
}

/* ---------------- Opportunity Details ---------------- */
const OPP_F = [fAsset, fYear, fForecast, fAccount, fOpp, fPType, fPName, fChannel, fBU, fType];
function OpportunityDetails() {
  const { lines } = getServicesData();
  const f = useFilters(lines, OPP_F);
  const { pipe, book } = split(f.filtered);
  return (
    <div className="grid gap-4">
      <PageTitle title="SGS · Opportunity Details" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-2">
        <KpiGroup title="Pipeline" items={standardKpis(pipe, "services")} />
        <KpiGroup title="Bookings" tone="bookings" items={standardKpis(book, "services")} />
      </div>
      <Panel title="Pivot (Pipeline + Bookings)" subtitle="Account › Opportunity › Product">
        <Pivot
          rows={f.filtered}
          levels={[
            { label: "Account", key: (r) => r.account },
            { label: "Opportunity", key: (r) => `${r.oppName} (${r.quoteTerm} mo)` },
            { label: "Product", key: (r) => `${r.productName} · ${r.channel}` },
          ]}
          measures={[
            { label: "Net Qty", value: (r) => r.netQty, fmt: num },
            { label: "Net Services ARR", value: (r) => r.arr, fmt: fmt$ },
            { label: "OTF", value: (r) => r.otf, fmt: fmt$ },
            { label: "Net ARR + OTF", value: ao, fmt: fmt$ },
            { label: "TCV", value: (r) => r.tcv, fmt: fmt$ },
          ]}
          maxHeight={300}
        />
      </Panel>
      <Panel title="Detailed View (Pipeline + Bookings)">
        <DataTable rows={f.filtered} columns={SVC_DETAIL.filter((c) => c.key !== "owner")} title="sgs-opportunity-details" />
      </Panel>
    </div>
  );
}

/* ---------------- Weighted Forecast ---------------- */
const WEIGHTS: Record<string, number> = { Closed: 1, Commit: 0.9, "Best Case": 0.55 };
const WF_F = [fYear, fAsset, fForecast, fAccount, fBU];
function WeightedForecast() {
  const { lines } = getServicesData();
  const f = useFilters(lines, WF_F);
  const rows = f.filtered.filter((r) => r.forecast in WEIGHTS);
  const w = (r: OppLine, v: number) => v * WEIGHTS[r.forecast];
  const forecast = sum(rows, (r) => w(r, r.arrOtf));
  const byAsset = groupSum(rows, (r) => r.assetType, (r) => w(r, r.arrOtf)).map(({ name }) => ({
    name,
    ...Object.fromEntries(Object.keys(WEIGHTS).map((k) => [k, sum(rows.filter((r) => r.assetType === name && r.forecast === k), (r) => w(r, r.arrOtf))])),
  }));
  const fc = (k: string, v: (r: OppLine) => number, weighted = false) => ({
    label: `${weighted ? "Weighted " : ""}${k}`,
    value: (r: OppLine) => (r.forecast === k ? (weighted ? w(r, v(r)) : v(r)) : 0),
    fmt: fmt$,
  });
  const lv = [{ label: "Asset Type", key: (r: OppLine) => r.assetType }, { label: "Product Type", key: (r: OppLine) => r.productType }];
  return (
    <div className="grid gap-4">
      <PageTitle title="Weighted Forecast" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Panel title="Bookings Forecast (Net ARR + OTF) by Asset Type" subtitle="Stacked by weighted forecast category">
          <HBarChart data={byAsset} series={Object.keys(WEIGHTS)} />
        </Panel>
        <div className="grid content-start gap-4">
          <BigStat label="SGS Bookings Forecast · Net ARR + OTF" value={money(forecast)} sub="Weighted, for the selected close period" />
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-xs leading-relaxed text-cream/60">
            <p className="mb-2 font-medium text-cream/85">Methodology</p>
            Weighted by forecast category: <b className="text-cream">Closed 100%</b>, <b className="text-cream">Commit 90%</b>,{" "}
            <b className="text-cream">Best Case 55%</b>. Pipeline and Omitted are excluded. Source: CRM opportunities with SGS product lines.
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Bookings Forecast by Net ARR">
          <Pivot rows={rows} levels={lv} measures={[fc("Closed", (r) => r.arr), fc("Commit", (r) => r.arr), fc("Commit", (r) => r.arr, true), fc("Best Case", (r) => r.arr), fc("Best Case", (r) => r.arr, true)]} maxHeight={260} />
        </Panel>
        <Panel title="Bookings Forecast by OTF">
          <Pivot rows={rows} levels={lv} measures={[fc("Closed", (r) => r.otf), fc("Commit", (r) => r.otf), fc("Commit", (r) => r.otf, true), fc("Best Case", (r) => r.otf), fc("Best Case", (r) => r.otf, true)]} maxHeight={260} />
        </Panel>
      </div>
      <Panel title="Detailed View">
        <DataTable rows={rows} columns={SVC_DETAIL.filter((c) => c.key !== "owner")} title="sgs-weighted-forecast" />
      </Panel>
    </div>
  );
}

/* ---------------- ASP & Work Orders ---------------- */
type AspRow = AspDeal & { asset: string; ptype: string; product: string; channel: string; bu: string; type: string };
const A = <K extends keyof AspRow & string>(key: K, label: string, sort?: "desc"): FilterDef<AspRow> => ({ key, label, sort });
const ASP_F = [A("year", "Close Year", "desc"), A("forecast", "Forecast"), A("account", "Account"), A("channel", "Channel"), A("bu", "Business Unit"), A("type", "Opp Type")];
const woTotal = (d: AspDeal) => Object.values(d.wo).reduce((a, b) => a + b, 0) + d.adjustment;
function AspWorkOrders() {
  const { asp } = getServicesData();
  const rows = useMemo<AspRow[]>(
    () => asp.map((d) => ({ ...d, asset: d.line.assetType, ptype: d.line.productType, product: d.line.productName, channel: d.line.channel, bu: d.line.businessUnit, type: d.line.type })),
    [asp],
  );
  const f = useFilters(rows, ASP_F);
  const aspCols: Column<AspRow>[] = [
    { key: "account", label: "Account", value: (r) => r.account },
    { key: "opp", label: "Opportunity", value: (r) => r.oppName },
    { key: "close", label: "Close Date", value: (r) => r.closeDate, fmt: (v: string) => date(v) },
    { key: "fc", label: "Forecast", value: (r) => r.forecast },
    { key: "term", label: "Quote Term", value: (r) => r.quoteTerm, num: true, fmt: (v: number) => `${v} mo` },
    { key: "arr", label: "Converted ARR", value: (r) => r.arr, num: true, total: true, fmt: (v: number) => moneyFull(v) },
    { key: "tcv", label: "TCV", value: (r) => r.tcv, num: true, total: true, fmt: (v: number) => moneyFull(v) },
    { key: "link", label: "Link", value: (r) => r.oppId, fmt: (v: string) => <span className="text-sky">{v} ↗</span> },
  ];
  const woCols: Column<AspRow>[] = [
    aspCols[0], aspCols[1], aspCols[2], aspCols[3],
    ...WO_TYPES.map(([k, label]) => ({ key: k, label, value: (r: AspRow) => r.wo[k], num: true, total: true, fmt: (v: number) => moneyFull(v) })),
    { key: "adj", label: "ASP Adjustment", value: (r) => r.adjustment, num: true, total: true, fmt: (v: number) => moneyFull(v) },
    { key: "bal", label: "Balance", value: (r) => r.tcv - woTotal(r), num: true, total: true, fmt: (v: number) => <span className="text-coral">{moneyFull(v)}</span> },
  ];
  const totalTcv = sum(f.filtered, (r) => r.tcv);
  const totalWo = sum(f.filtered, woTotal);
  return (
    <div className="grid gap-4">
      <PageTitle title="ASP & Work Orders" note="Advanced Services Packages and draw-down" />
      <SlicerBar api={f} />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Kpi label="ASP Deals" value={num(f.filtered.length)} />
        <Kpi label="ASP TCV" value={money(totalTcv)} accent />
        <Kpi label="Work Orders Drawn" value={money(totalWo)} />
        <Kpi label="Utilisation" value={totalTcv ? pct(totalWo / totalTcv) : "–"} />
      </div>
      <Panel title="ASP Deals">
        <DataTable rows={f.filtered} columns={aspCols} pageSize={6} title="asp-deals" />
      </Panel>
      <Panel title="Work Order">
        <DataTable rows={f.filtered.filter((r) => r.forecast === "Closed")} columns={woCols} pageSize={6} title="work-orders" />
      </Panel>
      <Panel title="Detailed View">
        <DataTable rows={f.filtered.map((r) => r.line)} columns={SVC_DETAIL.filter((c) => c.key !== "owner")} pageSize={6} title="asp-detail" />
      </Panel>
    </div>
  );
}

/* ---------------- YoY ASP Breakup ---------------- */
type QL = AspQuoteLine & { closeYear: number; bu: string; forecast: string };
const Q = <K extends keyof QL & string>(key: K, label: string, sort?: "desc"): FilterDef<QL> => ({ key, label, sort });
const QL_F = [Q("endYear", "Consumption Year (End Date)", "desc"), Q("closeYear", "Close Year", "desc"), Q("account", "Account"), Q("productName", "Product"), Q("quoteType", "Quote Type"), Q("bu", "Business Unit")];
function YoyAsp() {
  const { aspLines } = getServicesData();
  const rows = useMemo<QL[]>(() => aspLines.map((l) => ({ ...l, closeYear: l.line.year, bu: l.line.businessUnit, forecast: l.line.forecast })), [aspLines]);
  const f = useFilters(rows, QL_F);
  const years = Array.from(new Set(f.filtered.map((r) => r.endYear))).sort();
  const yoy = years.map((y) => {
    const g = f.filtered.filter((r) => r.endYear === y);
    return { name: String(y), "ASP Deals": sum(g, (r) => r.aspStd), "Work Order": sum(g, (r) => r.workOrder), Balance: sum(g, (r) => r.remaining) };
  });
  return (
    <div className="grid gap-4">
      <PageTitle title="YoY · ASP & Work Orders" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="ASP Deals"><DonutChart data={groupSum(f.filtered, (r) => r.productName, (r) => r.aspStd)} height={190} /></Panel>
        <Panel title="Work Order"><DonutChart data={groupSum(f.filtered, (r) => r.productName, (r) => r.workOrder)} height={190} /></Panel>
        <Panel title="Balance"><DonutChart data={groupSum(f.filtered, (r) => r.productName, (r) => r.remaining)} height={190} /></Panel>
      </div>
      <Panel title="Year-over-year consumption" subtitle="ASP value vs. work orders drawn, by consumption year">
        <ColumnChart data={yoy} series={["ASP Deals", "Work Order", "Balance"]} height={230} />
      </Panel>
      <Panel title="ASP & WO" subtitle="Account › Opportunity › Consumption year">
        <Pivot
          rows={f.filtered}
          levels={[
            { label: "Account", key: (r) => r.account },
            { label: "Opportunity", key: (r) => `${r.oppName} · ${r.quoteType}` },
            { label: "Period", key: (r) => `${r.endYear} · ${r.productName}`, byLabel: true },
          ]}
          measures={[
            { label: "ASP Std Value", value: (r) => r.aspStd, fmt: fmt$ },
            { label: "Work Order", value: (r) => r.workOrder, fmt: fmt$ },
            { label: "Net Remaining", value: (r) => r.remaining, fmt: fmt$ },
          ]}
          maxHeight={300}
        />
      </Panel>
      <Panel title="Detailed View">
        <DataTable
          rows={f.filtered}
          pageSize={6}
          title="asp-quote-lines"
          columns={[
            { key: "account", label: "Account", value: (r) => r.account },
            { key: "quote", label: "Quote", value: (r) => r.quoteName },
            { key: "product", label: "Product", value: (r) => r.productName },
            { key: "type", label: "Quote Type", value: (r) => r.quoteType },
            { key: "period", label: "Start → End", value: (r) => r.startEnd },
            { key: "close", label: "Close Date", value: (r) => r.line.closeDate, fmt: (v: string) => date(v) },
            { key: "std", label: "ASP Std Value", value: (r) => r.aspStd, num: true, total: true, fmt: (v: number) => moneyFull(v) },
            { key: "wo", label: "Work Order", value: (r) => r.workOrder, num: true, total: true, fmt: (v: number) => moneyFull(v) },
            { key: "rem", label: "Net Remaining", value: (r) => r.remaining, num: true, total: true, fmt: (v: number) => moneyFull(v) },
          ]}
        />
      </Panel>
    </div>
  );
}

/* ---------------- Service Attach Rate (shared) ---------------- */
const T = <K extends keyof AttachDeal & string>(key: K, label: string, sort?: "desc"): FilterDef<AttachDeal> => ({ key, label, sort });
const SAR_F = [T("year", "Close Year", "desc"), T("businessUnit", "Business Unit"), T("team", "Team"), T("industry", "Industry"), T("productName", "Product"), T("account", "Account"), T("csm", "CSM"), T("serviceOwner", "Service Owner")];
const SAR_F_BOOK = [...SAR_F, T("productFamily", "Product Family")];

const unitRate = (rows: AttachDeal[]) => (rows.length ? rows.filter((r) => r.hasServices).length / rows.length : 0);

function rateBy(rows: AttachDeal[], key: (r: AttachDeal) => string, rate: (g: AttachDeal[]) => number) {
  const m = new Map<string, AttachDeal[]>();
  rows.forEach((r) => m.set(key(r), [...(m.get(key(r)) ?? []), r]));
  return Array.from(m, ([name, g]) => ({ name, value: rate(g), n: g.length })).sort((a, b) => b.value - a.value);
}

function rateTrend(rows: AttachDeal[], rate: (g: AttachDeal[]) => number, years: number[]) {
  return MONTHS.map((m, i) => ({
    month: m,
    ...Object.fromEntries(
      years.map((y) => {
        const g = rows.filter((r) => r.year === y && r.month === i + 1);
        return [String(y), g.length ? rate(g) : (null as unknown as number)];
      }),
    ),
  }));
}

const attachCols = (sel: (r: AttachDeal) => [number, number]): Column<AttachDeal>[] => [
  { key: "account", label: "Account", value: (r) => r.account },
  { key: "close", label: "Close Date", value: (r) => r.closeDate, fmt: (v: string) => date(v) },
  { key: "family", label: "Product Family", value: (r) => r.productFamily },
  { key: "product", label: "Product", value: (r) => r.productName },
  { key: "ptype", label: "Product Type", value: (r) => r.productType },
  { key: "channel", label: "Channel", value: (r) => r.channel },
  { key: "users", label: "No of Users", value: (r) => r.users, num: true, total: true, fmt: (v: number) => num(v) },
  { key: "term", label: "Quote Term", value: (r) => r.quoteTerm, num: true, fmt: (v: number) => `${v} mo` },
  { key: "svc", label: "Services", value: (r) => (r.hasServices ? "Attached" : "—"), fmt: (v: string) => <span className={v === "Attached" ? "text-teal" : "text-cream/30"}>{v}</span> },
  { key: "pb", label: "Product Bookings", value: (r) => sel(r)[0], num: true, total: true, fmt: (v: number) => moneyFull(v) },
  { key: "sb", label: "Services Bookings", value: (r) => sel(r)[1], num: true, total: true, fmt: (v: number) => moneyFull(v) },
];

function AttachUnit() {
  const { attach } = getServicesData();
  const f = useFilters(attach, SAR_F);
  const trend = useMemo(() => rateTrend(f.filtered, unitRate, [2023, 2024, 2025]), [f.filtered]);
  const p = (v: number) => pct(v, 0);
  return (
    <div className="grid gap-4">
      <PageTitle title="SGS Attach Rate · Unit Based" note="Share of product deals with at least one services line" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Panel title="Service Attach Rate Trend" subtitle="Monthly, by close year">
          <TrendChart data={trend} x="month" series={["2023", "2024", "2025"]} fmt={p} height={240} />
        </Panel>
        <div className="grid content-start gap-4">
          <BigStat label="Product Service Attach Rate" value={pct(unitRate(f.filtered))} sub={`${num(f.filtered.filter((r) => r.hasServices).length)} of ${num(f.filtered.length)} deals`} />
          <Kpi label="Deals analysed" value={num(f.filtered.length)} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <Panel title="Product Type · Service Attach Rate"><HBarChart data={rateBy(f.filtered, (r) => r.productType, unitRate)} fmt={p} labelWidth={120} /></Panel>
          <Panel title="Channel Type · Service Attach Rate"><HBarChart data={rateBy(f.filtered, (r) => r.channel, unitRate)} fmt={p} color="#8FB2E3" labelWidth={120} /></Panel>
        </div>
        <Panel title="Asset Type · Service Attach Rate">
          <ColumnChart data={rateBy(f.filtered, (r) => r.assetType, unitRate).map((d) => ({ name: d.name, "Attach %": d.value }))} series={["Attach %"]} fmt={p} height={380} />
        </Panel>
      </div>
      <Panel title="Detailed View">
        <DataTable rows={f.filtered} columns={attachCols((r) => [r.productArr + r.productOtf, r.servicesArr + r.servicesOtf])} title="attach-unit" />
      </Panel>
    </div>
  );
}

const BOOKING_TYPES = ["Net ARR", "OTF", "Net ARR + OTF"] as const;
type BT = (typeof BOOKING_TYPES)[number];
const pick = (bt: BT) => (r: AttachDeal): [number, number] =>
  bt === "Net ARR" ? [r.productArr, r.servicesArr] : bt === "OTF" ? [r.productOtf, r.servicesOtf] : [r.productArr + r.productOtf, r.servicesArr + r.servicesOtf];

function AttachBookings() {
  const { attach } = getServicesData();
  const f = useFilters(attach, SAR_F_BOOK);
  const [bt, setBt] = useState<BT>("Net ARR + OTF");
  const sel = pick(bt);
  const rate = (g: AttachDeal[]) => {
    const p = sum(g, (r) => sel(r)[0]);
    return p ? sum(g, (r) => sel(r)[1]) / p : 0;
  };
  const trend = rateTrend(f.filtered, rate, [2023, 2024, 2025, 2026]);
  const fr = f.filtered;
  const kp = (k: keyof AttachDeal) => money(sum(fr, (r) => r[k] as number));
  const assetCombo = rateBy(fr, (r) => r.assetType, rate).map((d) => ({
    name: d.name,
    "Services Bookings": sum(fr.filter((r) => r.assetType === d.name), (r) => sel(r)[1]),
    "SAR %": d.value,
  }));
  const p = (v: number) => pct(v, 1);
  return (
    <div className="grid gap-4">
      <PageTitle title="SGS Attach Rate · Bookings $" note="Services bookings ÷ product bookings" />
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1" role="tablist" aria-label="Bookings type">
          {BOOKING_TYPES.map((t) => (
            <button key={t} onClick={() => setBt(t)} className={`rounded-full px-3 py-1 text-xs transition ${bt === t ? "bg-coral text-navy" : "text-cream/60 hover:text-cream"}`}>
              {t}
            </button>
          ))}
        </div>
        <SlicerBar api={f} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Panel title="Service Attach Rate Trend" subtitle={`Monthly, ${bt}`}>
          <TrendChart data={trend} x="month" series={["2023", "2024", "2025", "2026"]} fmt={p} height={260} />
        </Panel>
        <div className="grid content-start gap-3">
          <BigStat label="Services Attach Rate" value={pct(rate(fr))} sub={`Based on ${bt}`} />
          <div className="grid grid-cols-3 gap-2">
            <Kpi label="Net Svc ARR" value={kp("servicesArr")} />
            <Kpi label="Svc OTF" value={kp("servicesOtf")} />
            <Kpi label="Svc ARR+OTF" value={money(sum(fr, (r) => r.servicesArr + r.servicesOtf))} accent />
            <Kpi label="Net Prod ARR" value={kp("productArr")} />
            <Kpi label="Prod OTF" value={kp("productOtf")} />
            <Kpi label="Prod ARR+OTF" value={money(sum(fr, (r) => r.productArr + r.productOtf))} />
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Product Type · Service Attach Rate"><HBarChart data={rateBy(fr, (r) => r.productType, rate)} fmt={p} labelWidth={120} /></Panel>
        <Panel title="Asset Type · Service Attach Rate" subtitle="Bars: services bookings · Line: attach %">
          <ComboChart data={assetCombo} bar="Services Bookings" line="SAR %" height={270} />
        </Panel>
        <Panel title="Channel Type · Service Attach Rate"><HBarChart data={rateBy(fr, (r) => r.channel, rate)} fmt={p} color="#8FB2E3" labelWidth={120} /></Panel>
        <Panel title={`Product Name · Services Bookings (${bt})`}>
          <HBarChart data={groupSum(fr, (r) => r.productName, (r) => sel(r)[1])} color="#E8B87D" labelWidth={170} />
        </Panel>
      </div>
      <Panel title="Detailed View">
        <DataTable rows={fr} columns={attachCols(sel)} title="attach-bookings" />
      </Panel>
    </div>
  );
}

/* ---------------- CR&A ---------------- */
const CRA_F = [fYear, fForecast, fAsset, L("leadSource", "Lead Source"), L("resoldBy", "Resold By"), fAccount];
function CallRecording() {
  const { lines } = getServicesData();
  const cra = useMemo(() => lines.filter((l) => l.productFamily === "Call Recording & Analytics"), [lines]);
  const f = useFilters(cra, CRA_F);
  const { pipe, book } = split(f.filtered);
  const scope = f.filtered.filter((r) => r.forecast !== "Omitted");
  return (
    <div className="grid gap-4">
      <PageTitle title="Call Recording & Analytics" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-2">
        <KpiGroup title="Pipeline" items={standardKpis(pipe, "services")} />
        <KpiGroup title="Bookings" tone="bookings" items={standardKpis(book, "services")} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Pivot (Pipeline + Bookings)" subtitle="Account › Opportunity">
          <Pivot
            rows={scope}
            levels={[{ label: "Account", key: (r) => r.account }, { label: "Opportunity", key: (r) => r.oppName }]}
            measures={[
              { label: "Net Services ARR", value: (r) => r.arr, fmt: fmt$ },
              { label: "OTF", value: (r) => r.otf, fmt: fmt$ },
              { label: "Net ARR + OTF", value: ao, fmt: fmt$ },
              { label: "TCV", value: (r) => r.tcv, fmt: fmt$ },
            ]}
            maxHeight={360}
          />
        </Panel>
        <div className="grid gap-4">
          <Panel title="Asset Type · Net Services ARR + OTF"><DonutChart data={groupSum(scope, (r) => r.assetType, ao)} height={160} /></Panel>
          <Panel title="Resold By · Net Services ARR + OTF"><DonutChart data={groupSum(scope, (r) => r.resoldBy, ao)} height={160} /></Panel>
        </div>
      </div>
      <Panel title="Detailed View (Pipeline + Bookings)">
        <DataTable rows={f.filtered} columns={[COLS.account, COLS.close, COLS.forecast, COLS.owner, COLS.lead, COLS.resold, COLS.partner, COLS.product, COLS.asset, COLS.channel, COLS.term, COLS.qty, COLS.arr, COLS.otf, COLS.arrOtf, COLS.tcv, COLS.ps, COLS.link]} title="cra-detail" />
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Partner Type · Net Services ARR + OTF"><HBarChart data={groupSum(scope, (r) => r.partnerType, ao)} color="#5EC4B6" labelWidth={130} /></Panel>
        <Panel title="Lead Source · Net Services ARR + OTF"><DonutChart data={groupSum(scope, (r) => r.leadSource, ao)} height={170} /></Panel>
      </div>
    </div>
  );
}

/* ---------------- Product Services Mapping ---------------- */
const MAP_F = [fAsset, fPType, fPName, L("productCode", "Product Code"), fChannel];
function ProductMapping() {
  const { lines } = getServicesData();
  const f = useFilters(lines, MAP_F);
  return (
    <div className="grid gap-4">
      <PageTitle title="Product Services Mapping" note="Asset Type › Product Type › Channel › Product › Code" />
      <SlicerBar api={f} />
      <Panel title="Mapping" subtitle="Expand any level · booked Net ARR + OTF and opportunity count for context">
        <Pivot
          rows={f.filtered}
          levels={[
            { label: "Asset Type", key: (r) => r.assetType },
            { label: "Product Type", key: (r) => r.productType },
            { label: "Channel", key: (r) => r.channel },
            { label: "Product", key: (r) => r.productName },
            { label: "Code", key: (r) => r.productCode },
          ]}
          measures={[
            { label: "Booked Net ARR + OTF", value: (r) => (r.forecast === "Closed" ? r.arrOtf : 0), fmt: fmt$ },
            { label: "Opportunity Lines", value: () => 1, fmt: num },
          ]}
          maxHeight={560}
        />
      </Panel>
    </div>
  );
}

const PAGES: DashPage[] = [
  { id: "executive-summary", label: "Executive Summary", render: () => <ExecutiveSummary /> },
  { id: "consolidated-report", label: "Consolidated Report", render: () => <Consolidated /> },
  { id: "opportunity-details", label: "Opportunity Details", render: () => <OpportunityDetails /> },
  { id: "weighted-forecast", label: "Weighted Forecast", render: () => <WeightedForecast /> },
  { id: "asp-work-orders", label: "ASP & Work Orders", render: () => <AspWorkOrders /> },
  { id: "yoy-asp", label: "YoY ASP Breakup", render: () => <YoyAsp /> },
  { id: "attach-unit", label: "Service Attach Rate · Unit", render: () => <AttachUnit /> },
  { id: "attach-bookings", label: "Service Attach Rate · Bookings $", render: () => <AttachBookings /> },
  { id: "cra", label: "CR&A", render: () => <CallRecording /> },
  { id: "product-mapping", label: "Product Services Mapping", render: () => <ProductMapping /> },
];

export default function ServicesDashboard() {
  return <DashboardShell title="Services Bookings & Pipeline.pbix" pages={PAGES} />;
}
