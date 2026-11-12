"use client";

import { AnimatePresence, motion } from "motion/react";
import { Database, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { AS_OF_LABEL } from "@/lib/data/common";

export interface DashPage {
  id: string;
  label: string;
  render: () => ReactNode;
}

export function DashboardShell({ title, pages }: { title: string; pages: DashPage[] }) {
  const [active, setActive] = useState(pages[0].id);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (pages.some((p) => p.id === h)) setActive(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [pages]);

  const select = (id: string) => {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
  };

  const page = pages.find((p) => p.id === active) ?? pages[0];

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-navy-800/80 shadow-2xl shadow-black/40">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.07] bg-navy-900/60 px-4 py-3 md:px-6">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-coral/80" />
          <span className="size-2.5 rounded-full bg-sand/70" />
          <span className="size-2.5 rounded-full bg-teal/70" />
        </div>
        <p className="truncate text-xs text-cream/60">{title}</p>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-cream/45">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1">
            <Database className="size-3" /> Synthetic data
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 sm:inline-flex">
            <RefreshCw className="size-3" /> Last refresh (ET) {AS_OF_LABEL}
          </span>
        </div>
      </div>
      <nav className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-white/[0.07] px-3 py-2 md:px-5" aria-label="Report pages">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => select(p.id)}
            className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition ${
              p.id === page.id ? "text-navy" : "text-cream/60 hover:text-cream"
            }`}
          >
            {p.id === page.id && (
              <motion.span layoutId={`tab-${title}`} className="absolute inset-0 rounded-full bg-cream" transition={{ type: "spring", bounce: 0.18, duration: 0.45 }} />
            )}
            <span className="relative">{p.label}</span>
          </button>
        ))}
      </nav>
      <AnimatePresence mode="wait">
        <motion.div
          key={page.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="p-4 md:p-6"
        >
          {page.render()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
