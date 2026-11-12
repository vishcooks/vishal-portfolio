"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { money, pct } from "@/lib/format";

export const PALETTE = ["#FF6B58", "#8FB2E3", "#E8B87D", "#5EC4B6", "#A99BE0", "#F4EDE0", "#FF9F8F", "#5B7DB8", "#C9D6A3"];

const axis = { stroke: "rgba(244,237,224,0.35)", fontSize: 11, tickLine: false, axisLine: false } as const;
const grid = <CartesianGrid stroke="rgba(244,237,224,0.06)" vertical={false} />;

type Fmt = (v: number) => string;

function Empty({ height }: { height: number }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-white/10 text-xs text-cream/35" style={{ height }}>
      No data for the current filters
    </div>
  );
}
const hasValues = (data: Record<string, string | number>[], keys: string[]) =>
  data.some((d) => keys.some((k) => Number(d[k]) !== 0 && d[k] != null));

function Tip({
  active, payload, label, fmt,
}: { active?: boolean; payload?: { name?: string; value?: number; color?: string; payload?: { fill?: string } }[]; label?: string; fmt: Fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-navy-800/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label !== undefined && <p className="mb-1 text-cream/50">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-cream">
          <span className="size-2 rounded-full" style={{ background: p.color ?? p.payload?.fill }} />
          <span className="text-cream/70">{p.name}</span>
          <span className="ml-auto pl-3 font-medium tabular-nums">{fmt(Number(p.value ?? 0))}</span>
        </p>
      ))}
    </div>
  );
}

const legend = (
  <Legend
    iconType="circle"
    iconSize={7}
    wrapperStyle={{ fontSize: 11, color: "rgba(244,237,224,0.65)", paddingTop: 6 }}
  />
);

export function TrendChart({
  data, x, series, fmt = (v) => money(v), height = 240, area = false,
}: { data: Record<string, string | number>[]; x: string; series: string[]; fmt?: Fmt; height?: number; area?: boolean }) {
  const Chart = area ? AreaChart : LineChart;
  if (!hasValues(data, series)) return <Empty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s} id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {grid}
        <XAxis dataKey={x} {...axis} minTickGap={16} />
        <YAxis {...axis} tickFormatter={(v) => fmt(Number(v))} width={56} />
        <Tooltip content={<Tip fmt={fmt} />} cursor={{ stroke: "rgba(244,237,224,0.15)" }} />
        {series.length > 1 && legend}
        {series.map((s, i) =>
          area ? (
            <Area key={s} animationDuration={800} type="monotone" dataKey={s} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} fill={`url(#g-${i})`} />
          ) : (
            <Line key={s} animationDuration={800} type="monotone" dataKey={s} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />
          ),
        )}
      </Chart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data, fmt = (v) => money(v), height = 220,
}: { data: { name: string; value: number }[]; fmt?: Fmt; height?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const shown = data.filter((d) => d.value > 0);
  if (!shown.length) return <Empty height={height} />;
  return (
    <div className="flex items-center gap-4" style={{ height }}>
      <div className="relative h-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie animationDuration={700} data={shown} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none">
              {shown.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<Tip fmt={fmt} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-lg font-light text-cream">{fmt(total)}</p>
            <p className="text-[10px] uppercase tracking-widest text-cream/40">total</p>
          </div>
        </div>
      </div>
      <ul className="scrollbar-thin max-h-full w-[46%] space-y-1.5 overflow-y-auto pr-1 text-[11px]">
        {shown.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="truncate text-cream/70" title={d.name}>{d.name}</span>
            <span className="ml-auto tabular-nums text-cream/50">{total ? pct(d.value / total, 0) : "–"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBarChart({
  data, fmt = (v) => money(v), height, color = PALETTE[0], series, labelWidth = 150,
}: {
  data: Record<string, string | number>[];
  fmt?: Fmt;
  height?: number;
  color?: string;
  series?: string[];
  labelWidth?: number;
}) {
  const keys = series ?? ["value"];
  const h = height ?? Math.max(140, data.length * 30 + 30);
  if (!hasValues(data, keys)) return <Empty height={height ?? 160} />;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid stroke="rgba(244,237,224,0.06)" horizontal={false} />
        <XAxis type="number" {...axis} tickFormatter={(v) => fmt(Number(v))} />
        <YAxis type="category" dataKey="name" {...axis} width={labelWidth} tick={{ fill: "rgba(244,237,224,0.65)", fontSize: 11 }} interval={0} />
        <Tooltip content={<Tip fmt={fmt} />} cursor={{ fill: "rgba(244,237,224,0.04)" }} />
        {keys.length > 1 && legend}
        {keys.map((k, i) => (
          <Bar animationDuration={700}
            key={k}
            dataKey={k}
            name={k === "value" ? "Value" : k}
            stackId={keys.length > 1 ? "s" : undefined}
            fill={keys.length > 1 ? PALETTE[i % PALETTE.length] : color}
            radius={keys.length > 1 ? (i === keys.length - 1 ? [0, 6, 6, 0] : 0) : [0, 6, 6, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ColumnChart({
  data, series, fmt = (v) => money(v), height = 240, stacked = false,
}: { data: Record<string, string | number>[]; series: string[]; fmt?: Fmt; height?: number; stacked?: boolean }) {
  if (!hasValues(data, series)) return <Empty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
        {grid}
        <XAxis dataKey="name" {...axis} interval={0} tick={{ fill: "rgba(244,237,224,0.55)", fontSize: 10.5 }} />
        <YAxis {...axis} tickFormatter={(v) => fmt(Number(v))} width={56} />
        <Tooltip content={<Tip fmt={fmt} />} cursor={{ fill: "rgba(244,237,224,0.04)" }} />
        {series.length > 1 && legend}
        {series.map((s, i) => (
          <Bar animationDuration={700} key={s} dataKey={s} stackId={stacked ? "s" : undefined} fill={PALETTE[i % PALETTE.length]} radius={stacked && i < series.length - 1 ? 0 : [6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ComboChart({
  data, bar, line, height = 260, barFmt = (v) => money(v), lineFmt = (v) => pct(v),
}: {
  data: Record<string, string | number>[];
  bar: string;
  line: string;
  height?: number;
  barFmt?: Fmt;
  lineFmt?: Fmt;
}) {
  if (!hasValues(data, [bar])) return <Empty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        {grid}
        <XAxis dataKey="name" {...axis} interval={0} tick={{ fill: "rgba(244,237,224,0.55)", fontSize: 10.5 }} />
        <YAxis yAxisId="l" {...axis} tickFormatter={(v) => barFmt(Number(v))} width={56} />
        <YAxis yAxisId="r" orientation="right" {...axis} tickFormatter={(v) => lineFmt(Number(v))} width={44} />
        <Tooltip
          content={({ active, payload, label }) => (
            <Tip
              active={active}
              label={label as string}
              payload={payload as never}
              fmt={(v) => (v <= 1.5 ? lineFmt(v) : barFmt(v))}
            />
          )}
          cursor={{ fill: "rgba(244,237,224,0.04)" }}
        />
        {legend}
        <Bar animationDuration={700} yAxisId="l" dataKey={bar} fill={PALETTE[1]} radius={[6, 6, 0, 0]} barSize={34} />
        <Line yAxisId="r" dataKey={line} stroke={PALETTE[0]} strokeWidth={2.5} dot={{ r: 3.5, fill: PALETTE[0] }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function FunnelBars({ data, fmt = (v) => money(v) }: { data: { name: string; value: number }[]; fmt?: Fmt }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex flex-col items-center gap-1.5 py-1">
      {data.map((d, i) => (
        <div key={d.name} className="flex w-full items-center gap-3">
          <span className="w-20 shrink-0 text-right text-[11px] text-cream/55">{d.name}</span>
          <div className="flex flex-1 justify-center">
            <div
              className="flex h-8 items-center justify-center rounded-lg text-[11px] font-medium text-navy transition-all duration-500"
              style={{ width: `${Math.max(12, (d.value / max) * 100)}%`, background: PALETTE[i % PALETTE.length] }}
            >
              {fmt(d.value)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BigStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/20 via-coral/5 to-transparent p-4">
      <p className="text-[10.5px] uppercase tracking-[0.16em] text-cream/55">{label}</p>
      <p className="mt-1 font-display text-4xl font-light tabular-nums text-cream">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-cream/45">{sub}</p>}
    </div>
  );
}
