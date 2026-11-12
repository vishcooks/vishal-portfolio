"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] ${dark ? "text-navy/55" : "text-cream/50"}`}>
      <span className="size-1.5 bg-coral" />
      {children}
    </p>
  );
}
