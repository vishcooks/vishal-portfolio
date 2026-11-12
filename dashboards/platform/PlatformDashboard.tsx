"use client";

import { useMemo } from "react";
import { DashboardShell, type DashPage } from "@/components/dash/Shell";
import { SlicerBar, useFilters } from "@/components/dash/filters";
import { BigStat, DonutChart, HBarChart, TrendChart } from "@/components/dash/charts";
import { DataTable, Pivot } from "@/components/dash/tables";
import { groupSum, KpiGroup, PageTitle, Panel, standardKpis, sum } from "@/components/dash/ui";
import { AskData, genInsights, InsightStrip, RiskPanel } from "@/components/dash/ai";
import { getPlatformData } from "@/lib/data/platform";
import type { OppLine } from "@/lib/data/lines";
import { money, MONTHS, pct } from "@/lib/format";
import {
  DETAIL_COLS, fAccount, fBU, fChannel, fForecast, fIndustry, fPName, fPType, fTeam, fType, fYear, FORECAST_ORDER,
  monthlyTrend, PROB_BUCKETS, split, topCustomersByProbability,
} from "../shared";

const arr = (r: OppLine) => r.arr;
const EXEC_FILTERS = [fYear, fPType];
const FULL_FILTERS = [fYear, fForecast, fAccount, fBU, fTeam, fPType, fPName, fChannel, fType, fIndustry];

function ExecutiveSummary() {
  const { lines, partners } = getPlatformData();
  const f = useFilters(lines, EXEC_FILTERS);
  const { pipe, book } = split(f.filtered);

  const partnerTrend = useMemo(() => {
    const names = Array.from(new Set(partners.map((p) => p.partner)));
    return {
      names,
      data: MONTHS.map((m, i) => ({
        month: m,
        ...Object.fromEntries(names.map((n) => [n, partners.find((p) => p.partner === n && p.month === i + 1)?.revenue ?? 0])),
      })),
    };
  }, [partners]);

  return (
    <div className="grid gap-4">
      <PageTitle title="Platform Pipeline & Bookings · Exec Summary" note="ARR = annual recurring revenue · OTF = one-time fees · TCV = total contract value" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-2">
        <KpiGroup title="Pipeline" items={standardKpis(pipe, "arr")} />
        <KpiGroup title="Bookings" tone="bookings" items={standardKpis(book, "arr")} />
      </div>
      <InsightStrip insights={genInsights(f.filtered)} />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <AskData lines={f.filtered} />
        <RiskPanel lines={f.filtered} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Revenue by Partner 2025" subtitle="Monthly partner-sourced revenue">
          <TrendChart data={partnerTrend.data} x="month" series={partnerTrend.names} height={250} />
        </Panel>
        <Panel title="Bookings by Industry · Net ARR">
          <DonutChart data={groupSum(book, (r) => r.industry, arr)} height={250} />
        </Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Total Pipeline & Bookings · Net ARR" subtitle="Close period × forecast category — expand a year">
          <Pivot
            rows={f.filtered.filter((r) => r.forecast !== "Omitted")}
            levels={[{ label: "Close Year", key: (r) => String(r.year), byLabel: true }, { label: "Quarter", key: (r) => r.quarter, byLabel: true }]}
            cols={(r) => r.forecast}
            colOrder={FORECAST_ORDER}
            measures={[{ label: "Net ARR", value: arr, fmt: (v) => money(v) }]}
            maxHeight={260}
          />
        </Panel>
        <Panel title="Bookings by Product Type · Net ARR">
          <HBarChart data={groupSum(book, (r) => r.productType, arr)} labelWidth={120} />
        </Panel>
      </div>
      <Panel title="Pipeline by Top Customers & Probability · Net ARR" subtitle="Top 10 accounts, stacked by win probability">
        <HBarChart data={topCustomersByProbability(pipe, arr)} series={PROB_BUCKETS} />
      </Panel>
    </div>
  );
}

function Consolidated() {
  const { lines } = getPlatformData();
  const f = useFilters(lines, FULL_FILTERS);
  const { pipe, book } = split(f.filtered);
  const trend = useMemo(() => monthlyTrend(book, { "Net ARR": arr }), [book]);
  return (
    <div className="grid gap-4">
      <PageTitle title="Platform Bookings, Pipeline & Trend" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-2">
        <KpiGroup title="Pipeline" items={standardKpis(pipe, "arr")} />
        <KpiGroup title="Bookings" tone="bookings" items={standardKpis(book, "arr")} />
      </div>
      <Panel title="Bookings Trend · Net ARR" subtitle="Monthly closed bookings">
        <TrendChart data={trend} x="month" series={["Net ARR"]} area height={260} />
      </Panel>
      <Panel title="Detailed View (Pipeline + Bookings)">
        <DataTable rows={f.filtered} columns={DETAIL_COLS} title="platform-detail" />
      </Panel>
    </div>
  );
}

function AiProducts() {
  const { lines } = getPlatformData();
  const f = useFilters(lines, FULL_FILTERS);
  const { pipe, book } = split(f.filtered);
  const trend = useMemo(
    () =>
      monthlyTrend(
        book.filter((r) => r.year >= 2024),
        { "AI ARR (Bookings)": (r) => (r.isAI ? r.arr : 0), "Non-AI ARR (Bookings)": (r) => (r.isAI ? 0 : r.arr) },
      ),
    [book],
  );
  const total = sum(book, arr);
  const ai = sum(book.filter((r) => r.isAI), arr);
  return (
    <div className="grid gap-4">
      <PageTitle title="AI Products Dashboard" />
      <SlicerBar api={f} />
      <div className="grid gap-4 lg:grid-cols-2">
        <KpiGroup title="Pipeline" items={standardKpis(pipe, "arr")} />
        <KpiGroup title="Bookings" tone="bookings" items={standardKpis(book, "arr")} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel title="AI vs Non-AI Product Trend" subtitle="Monthly bookings, Net ARR">
          <TrendChart data={trend} x="month" series={["AI ARR (Bookings)", "Non-AI ARR (Bookings)"]} height={260} />
        </Panel>
        <div className="grid content-start gap-4">
          <BigStat label="AI product contribution" value={total ? pct(ai / total) : "–"} sub={`${money(ai)} of ${money(total)} booked ARR`} />
          <Panel title="Top AI Products">
            <HBarChart data={groupSum(book.filter((r) => r.isAI), (r) => r.productName.replace("GenAI ", ""), arr)} height={150} labelWidth={120} />
          </Panel>
        </div>
      </div>
      <Panel title="Detailed View (Pipeline + Bookings)">
        <DataTable rows={f.filtered.filter((r) => r.isAI)} columns={DETAIL_COLS} title="ai-products-detail" />
      </Panel>
    </div>
  );
}

const PAGES: DashPage[] = [
  { id: "executive-summary", label: "Executive Summary", render: () => <ExecutiveSummary /> },
  { id: "consolidated-report", label: "Consolidated Report", render: () => <Consolidated /> },
  { id: "ai-products", label: "AI Products", render: () => <AiProducts /> },
];

export default function PlatformDashboard() {
  return <DashboardShell title="Platform Pipeline, Bookings & Churn" pages={PAGES} />;
}
