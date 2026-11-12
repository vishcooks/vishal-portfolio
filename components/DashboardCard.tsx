import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Dashboard } from "@/lib/site";

export function DashboardCard({ d, index }: { d: Dashboard; index: number }) {
  return (
    <Link
      href={`/projects/${d.slug}/`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-navy text-cream shadow-xl shadow-navy/20 transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/30"
    >
      <div className="relative h-56 overflow-hidden">
        <Preview variant={index} />
        <span className="absolute left-4 top-4 rounded-full bg-navy-900/60 px-3 py-1 text-[11px] text-cream/80 backdrop-blur">
          Interactive · {d.pages.length} pages
        </span>
        <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-coral text-navy transition group-hover:rotate-45">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="text-[11px] uppercase tracking-[0.2em] text-coral">{d.kicker}</p>
        <h3 className="mt-2 font-display text-2xl font-light leading-tight tracking-tight md:text-[28px]">{d.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-cream/65">{d.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {d.pages.map((p) => (
            <li key={p} className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-cream/60">{p}</li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-6 text-xs text-cream/45">
          {d.stack.slice(0, 4).map((s) => <span key={s}>{s}</span>)}
        </div>
      </div>
    </Link>
  );
}

function Preview({ variant }: { variant: number }) {
  const bars = variant === 0 ? [40, 62, 48, 75, 58, 88, 70, 95] : [55, 45, 70, 60, 82, 66, 90, 78];
  return (
    <div className="grain absolute inset-0 bg-gradient-to-br from-[#2A3F6B] via-navy to-navy-900">
      <div className="blob -right-10 -top-10 h-48 w-48 bg-coral opacity-50" />
      <div className="absolute inset-x-6 bottom-6 top-16 grid grid-cols-[1.4fr_1fr] gap-3">
        <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm">
          <div className="flex gap-2">
            {["Net ARR", "OTF", "TCV"].map((k, i) => (
              <div key={k} className="flex-1 rounded-lg bg-navy-900/40 px-2 py-1.5">
                <div className="text-[8px] uppercase tracking-wider text-cream/45">{k}</div>
                <div className={`text-[11px] font-medium ${i === 0 ? "text-coral" : "text-cream"}`}>${[4.8, 0.6, 9.1][i]}M</div>
              </div>
            ))}
          </div>
          <div className="mt-auto flex h-16 items-end gap-1.5 pt-2">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm transition-all duration-700 group-hover:opacity-100" style={{ height: `${h}%`, background: i === bars.length - 1 ? "#FF6B58" : "rgba(143,178,227,0.55)" }} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid flex-1 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <svg viewBox="0 0 42 42" className="size-16 -rotate-90">
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="rgba(244,237,224,0.12)" strokeWidth="5" />
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="#FF6B58" strokeWidth="5" strokeDasharray={variant === 0 ? "62 38" : "47 53"} />
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="#E8B87D" strokeWidth="5" strokeDasharray="20 80" strokeDashoffset={variant === 0 ? -62 : -47} />
            </svg>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-2.5">
            <div className="h-1.5 w-3/4 rounded bg-cream/20" />
            <div className="mt-1.5 h-1.5 w-1/2 rounded bg-cream/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
