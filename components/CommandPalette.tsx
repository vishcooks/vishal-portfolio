"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Copy, Download, FileText, Home, ExternalLink, Search, User, Briefcase } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DASHBOARDS, SITE } from "@/lib/site";

interface Item {
  id: string;
  label: string;
  group: string;
  icon: typeof Home;
  run: () => void;
  hint?: string;
}

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const usePalette = () => useContext(Ctx);

const slug = (s: string) =>
  ({
    "Service Attach Rate · Unit": "attach-unit",
    "Service Attach Rate · Bookings $": "attach-bookings",
    "Analytics Suite": "analytics-suite",
    "Prepaid Services & Work Orders": "prepaid-work-orders",
    "YoY Prepaid Breakup": "yoy-prepaid",
    "AI Products": "ai-products",
  })[s] ?? s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [toast, setToast] = useState("");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  const go = useCallback((href: string) => {
    setOpen(false);
    const [path, hash] = href.split("#");
    if (hash && window.location.pathname === path) {
      window.location.hash = hash;
      document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
    } else router.push(href);
  }, [router]);

  const items = useMemo<Item[]>(
    () => [
      { id: "home", label: "Home", group: "Pages", icon: Home, run: () => go("/") },
      { id: "work", label: "Work & case studies", group: "Pages", icon: Briefcase, run: () => go("/projects/") },
      { id: "about", label: "About", group: "Pages", icon: User, run: () => go("/about/") },
      { id: "resume", label: "Résumé", group: "Pages", icon: FileText, run: () => go("/resume/") },
      ...DASHBOARDS.flatMap((d) =>
        d.pages.map((p) => ({
          id: `${d.slug}-${p}`,
          label: p,
          hint: d.title,
          group: "Dashboard pages",
          icon: BarChart3,
          run: () => go(`/projects/${d.slug}/#${slug(p)}`),
        })),
      ),
      {
        id: "email", label: "Copy email address", hint: SITE.email, group: "Contact", icon: Copy,
        run: () => {
          navigator.clipboard?.writeText(SITE.email);
          setOpen(false);
          setToast("Email copied");
        },
      },
      { id: "li", label: "Open LinkedIn", group: "Contact", icon: ExternalLink, run: () => window.open(SITE.linkedin, "_blank", "noopener") },
      { id: "gh", label: "Open GitHub", group: "Contact", icon: ExternalLink, run: () => window.open(SITE.github, "_blank", "noopener") },
      { id: "pdf", label: "Download résumé (PDF)", group: "Contact", icon: Download, run: () => window.open("/resume.pdf", "_blank", "noopener") },
    ],
    [go],
  );

  const shown = items.filter((i) => `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQ("");
      setIdx(0);
      setTimeout(() => input.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(shown.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") shown[idx]?.run();
  };

  let lastGroup = "";
  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-navy-900/60 px-4 pt-[14vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command menu"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-navy-800/95 shadow-2xl shadow-black/60"
            >
              <label className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5">
                <Search className="size-4 text-cream/40" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setIdx(0); }}
                  onKeyDown={onKey}
                  placeholder="Jump to a page, a dashboard tab, or contact…"
                  className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-cream/35"
                  aria-label="Search commands"
                />
                <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-cream/40">ESC</kbd>
              </label>
              <ul className="scrollbar-thin max-h-[52vh] overflow-y-auto p-2" role="listbox">
                {shown.map((it, i) => {
                  const header = it.group !== lastGroup ? (lastGroup = it.group) : null;
                  return (
                    <li key={it.id} role="option" aria-selected={i === idx}>
                      {header && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/35">{header}</p>}
                      <button
                        onMouseEnter={() => setIdx(i)}
                        onClick={it.run}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${i === idx ? "bg-cream text-navy" : "text-cream/80"}`}
                      >
                        <it.icon className={`size-4 shrink-0 ${i === idx ? "text-coral-600" : "text-cream/45"}`} />
                        <span className="truncate">{it.label}</span>
                        {it.hint && <span className={`ml-auto truncate text-xs ${i === idx ? "text-navy/55" : "text-cream/35"}`}>{it.hint}</span>}
                        {i === idx && <ArrowRight className="size-3.5 shrink-0" />}
                      </button>
                    </li>
                  );
                })}
                {!shown.length && <li className="px-3 py-8 text-center text-sm text-cream/40">Nothing matches “{q}”</li>}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            role="status"
            className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-cream px-4 py-2 text-sm text-navy shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
