"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronRight as Caret, Download, Search } from "lucide-react";
import { Fragment, type ReactNode, useMemo, useState } from "react";

export interface Column<T> {
  key: string;
  label: string;
  value: (r: T) => string | number;
  fmt?: (v: never) => ReactNode;
  num?: boolean;
  total?: boolean;
}

export function DataTable<T>({
  rows, columns, pageSize = 8, title = "export", dense = false,
}: { rows: T[]; columns: Column<T>[]; pageSize?: number; title?: string; dense?: boolean }) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    let d = rows;
    if (q) {
      const s = q.toLowerCase();
      d = d.filter((r) => columns.some((c) => !c.num && String(c.value(r)).toLowerCase().includes(s)));
    }
    if (sort) {
      const c = columns.find((c) => c.key === sort.key)!;
      d = [...d].sort((a, b) => {
        const va = c.value(a);
        const vb = c.value(b);
        return (typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))) * sort.dir;
      });
    }
    return d;
  }, [rows, columns, sort, q]);

  const pages = Math.max(1, Math.ceil(data.length / pageSize));
  const p = Math.min(page, pages - 1);
  const slice = data.slice(p * pageSize, p * pageSize + pageSize);
  const hasTotals = columns.some((c) => c.total);

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [columns.map((c) => esc(c.label)).join(","), ...data.map((r) => columns.map((c) => esc(c.value(r))).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${title.replace(/\W+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cell = dense ? "px-2.5 py-1.5" : "px-3 py-2";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
          <Search className="size-3.5 text-cream/40" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search rows…"
            className="w-40 bg-transparent text-xs text-cream outline-none placeholder:text-cream/30"
          />
        </label>
        <span className="text-[11px] text-cream/40">{data.length.toLocaleString()} rows</span>
        <button onClick={exportCsv} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-cream/55 hover:text-coral">
          <Download className="size-3.5" /> CSV
        </button>
      </div>
      <div className="scrollbar-thin overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full min-w-max text-left text-[11.5px]">
          <thead className="bg-white/[0.04] text-cream/55">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`${cell} whitespace-nowrap font-medium ${c.num ? "text-right" : ""}`}>
                  <button
                    className="inline-flex items-center gap-1 hover:text-cream"
                    onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: -1 }))}
                  >
                    {c.label}
                    {sort?.key === c.key && (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={i} className="border-t border-white/[0.04] text-cream/80 hover:bg-white/[0.03]">
                {columns.map((c) => {
                  const v = c.value(r);
                  return (
                    <td key={c.key} className={`${cell} whitespace-nowrap ${c.num ? "text-right tabular-nums" : ""}`}>
                      {c.fmt ? c.fmt(v as never) : v}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!slice.length && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-cream/40">No rows match the current filters</td>
              </tr>
            )}
          </tbody>
          {hasTotals && (
            <tfoot className="border-t border-white/10 bg-white/[0.04] font-medium text-cream">
              <tr>
                {columns.map((c, i) => {
                  const t = c.total ? data.reduce((s, r) => s + Number(c.value(r)), 0) : null;
                  return (
                    <td key={c.key} className={`${cell} whitespace-nowrap ${c.num ? "text-right tabular-nums" : ""}`}>
                      {i === 0 ? "Total" : t !== null ? (c.fmt ? c.fmt(t as never) : t) : ""}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-[11px] text-cream/50">
          <button disabled={p === 0} onClick={() => setPage(p - 1)} className="rounded-full p-1 hover:text-coral disabled:opacity-30" aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </button>
          <span className="tabular-nums">
            {p + 1} / {pages}
          </span>
          <button disabled={p >= pages - 1} onClick={() => setPage(p + 1)} className="rounded-full p-1 hover:text-coral disabled:opacity-30" aria-label="Next page">
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export interface Measure<T> {
  label: string;
  value: (r: T) => number;
  fmt: (v: number) => string;
}

export function Pivot<T>({
  rows, levels, cols, measures, maxHeight = 320, colOrder,
}: {
  rows: T[];
  levels: { label: string; key: (r: T) => string; byLabel?: boolean }[];
  cols?: (r: T) => string;
  colOrder?: string[];
  measures: Measure<T>[];
  maxHeight?: number;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const colKeys = useMemo(() => {
    if (!cols) return [];
    const ks = Array.from(new Set(rows.map(cols)));
    return colOrder ? colOrder.filter((k) => ks.includes(k)) : ks.sort();
  }, [rows, cols, colOrder]);

  const headers = cols ? [...colKeys, "Total"] : measures.map((m) => m.label);

  const values = (rs: T[]) =>
    cols
      ? [...colKeys.map((k) => rs.filter((r) => cols(r) === k).reduce((s, r) => s + measures[0].value(r), 0)), rs.reduce((s, r) => s + measures[0].value(r), 0)]
      : measures.map((m) => rs.reduce((s, r) => s + m.value(r), 0));
  const fmtAt = (i: number) => (cols ? measures[0].fmt : measures[i].fmt);

  const tree = useMemo(() => {
    type Node = { id: string; label: string; depth: number; rows: T[]; children: Node[] };
    const build = (rs: T[], depth: number, prefix: string): Node[] => {
      if (depth >= levels.length) return [];
      const m = new Map<string, T[]>();
      for (const r of rs) {
        const k = levels[depth].key(r);
        if (!m.has(k)) m.set(k, []);
        m.get(k)!.push(r);
      }
      const total = (n: { rows: T[] }) => n.rows.reduce((s, r) => s + measures[0].value(r), 0);
      return Array.from(m, ([label, g]) => ({ id: `${prefix}/${label}`, label, depth, rows: g, children: build(g, depth + 1, `${prefix}/${label}`) })).sort(
        (a, b) => (levels[depth].byLabel ? a.label.localeCompare(b.label, undefined, { numeric: true }) : total(b) - total(a)),
      );
    };
    return build(rows, 0, "");
  }, [rows, levels, measures]);

  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  type N = (typeof tree)[number];
  const renderNode = (n: N): ReactNode => {
    const isOpen = open.has(n.id);
    const vs = values(n.rows);
    return (
      <Fragment key={n.id}>
        <tr className={`border-t border-white/[0.04] hover:bg-white/[0.03] ${n.depth === 0 ? "text-cream/90" : "text-cream/65"}`}>
          <td className="whitespace-nowrap px-3 py-1.5" style={{ paddingLeft: 12 + n.depth * 16 }}>
            {n.children.length ? (
              <button onClick={() => toggle(n.id)} className="inline-flex items-center gap-1 hover:text-coral">
                <Caret className={`size-3 transition ${isOpen ? "rotate-90" : ""}`} />
                {n.label}
              </button>
            ) : (
              <span className="pl-4">{n.label}</span>
            )}
          </td>
          {vs.map((v, i) => (
            <td key={i} className={`whitespace-nowrap px-3 py-1.5 text-right tabular-nums ${cols && i === vs.length - 1 ? "font-medium text-cream" : ""}`}>
              {v ? fmtAt(i)(v) : <span className="text-cream/20">–</span>}
            </td>
          ))}
        </tr>
        {isOpen && n.children.map(renderNode)}
      </Fragment>
    );
  };

  const totals = values(rows);
  return (
    <div className="scrollbar-thin overflow-auto rounded-xl border border-white/[0.06]" style={{ maxHeight }}>
      <table className="w-full min-w-max text-left text-[11.5px]">
        <thead className="sticky top-0 z-10 bg-navy-800 text-cream/55">
          <tr>
            <th className="px-3 py-2 font-medium">{levels.map((l) => l.label).join(" › ")}</th>
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2 text-right font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{tree.map(renderNode)}</tbody>
        <tfoot className="sticky bottom-0 bg-navy-800 font-medium text-cream">
          <tr className="border-t border-white/10">
            <td className="px-3 py-2">Total</td>
            {totals.map((v, i) => (
              <td key={i} className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{fmtAt(i)(v)}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
