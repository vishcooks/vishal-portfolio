"use client";

import { Check, ChevronDown, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface FilterDef<T> {
  key: keyof T & string;
  label: string;
  sort?: "desc";
}

export type FilterState = Record<string, string[]>;

export function useFilters<T>(rows: T[], defs: FilterDef<T>[], initial: FilterState = {}) {
  const [state, setState] = useState<FilterState>(initial);

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        defs.every((d) => {
          const sel = state[d.key];
          return !sel?.length || sel.includes(String(r[d.key]));
        }),
      ),
    [rows, defs, state],
  );

  const options = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const d of defs) {
      const others = rows.filter((r) =>
        defs.every((o) => o.key === d.key || !state[o.key]?.length || state[o.key].includes(String(r[o.key]))),
      );
      const vals = Array.from(new Set(others.map((r) => String(r[d.key]))));
      vals.sort((a, b) => (d.sort === "desc" ? b.localeCompare(a, undefined, { numeric: true }) : a.localeCompare(b, undefined, { numeric: true })));
      out[d.key] = vals;
    }
    return out;
  }, [rows, defs, state]);

  return {
    filtered,
    state,
    options,
    defs,
    set: (key: string, vals: string[]) => setState((s) => ({ ...s, [key]: vals })),
    reset: () => setState(initial),
  };
}

export type FiltersApi<T> = ReturnType<typeof useFilters<T>>;

export function SlicerBar<T>({ api, className = "" }: { api: FiltersApi<T>; className?: string }) {
  const active = Object.values(api.state).some((v) => v.length);
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {api.defs.map((d) => (
        <Slicer
          key={d.key}
          label={d.label}
          options={api.options[d.key] ?? []}
          value={api.state[d.key] ?? []}
          onChange={(v) => api.set(d.key, v)}
        />
      ))}
      <button
        onClick={api.reset}
        disabled={!active}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-cream/60 transition hover:text-coral disabled:opacity-30"
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}

function Slicer({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [open]);

  const shown = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  const summary = value.length === 0 ? "All" : value.length === 1 ? value[0] : `${value.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`group inline-flex max-w-[15rem] items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
          value.length
            ? "border-coral/60 bg-coral/10 text-cream"
            : "border-white/10 bg-white/[0.03] text-cream/70 hover:border-white/25"
        }`}
      >
        <span className="text-cream/45">{label}</span>
        <span className="truncate font-medium">{summary}</span>
        {value.length ? (
          <X
            className="size-3.5 shrink-0 text-cream/50 hover:text-coral"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
          />
        ) : (
          <ChevronDown className={`size-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-64 rounded-2xl border border-white/10 bg-navy-800/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {options.length > 7 && (
            <label className="mb-1 flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-1.5">
              <Search className="size-3.5 text-cream/40" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-xs text-cream outline-none placeholder:text-cream/30"
              />
            </label>
          )}
          <ul className="scrollbar-thin max-h-64 overflow-y-auto">
            {shown.map((o) => {
              const on = value.includes(o);
              return (
                <li key={o}>
                  <button
                    onClick={() => toggle(o)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-cream/80 hover:bg-white/5"
                  >
                    <span
                      className={`grid size-4 shrink-0 place-items-center rounded border ${
                        on ? "border-coral bg-coral text-navy" : "border-white/20"
                      }`}
                    >
                      {on && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="truncate">{o}</span>
                  </button>
                </li>
              );
            })}
            {!shown.length && <li className="px-2 py-3 text-center text-xs text-cream/40">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
