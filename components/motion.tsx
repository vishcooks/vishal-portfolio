"use client";

import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export function KineticHeadline({ lines, className = "", delay = 0 }: { lines: { text: string; className?: string }[]; className?: string; delay?: number }) {
  let i = 0;
  return (
    <h1 className={className}>
      {lines.map((l, li) => (
        <span key={li} className={`block ${l.className ?? ""}`}>
          {l.text.split(" ").map((w, wi) => {
            const d = delay + i++ * 0.07;
            return (
              <span key={wi} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "105%", rotate: 4 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ duration: 0.95, delay: d, ease }}
                >
                  {w}
                  {wi < l.text.split(" ").length - 1 ? "\u00A0" : ""}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

export function CountUp({ to, prefix = "", suffix = "", decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease, onUpdate: setV });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function PointerGlow() {
  const x = useMotionValue(0.55);
  const y = useMotionValue(0.45);
  const sx = useSpring(x, { stiffness: 40, damping: 18 });
  const sy = useSpring(y, { stiffness: 40, damping: 18 });
  const left = useTransform(sx, (v) => `${v * 100}%`);
  const top = useTransform(sy, (v) => `${v * 100}%`);
  useEffect(() => {
    const on = (e: PointerEvent) => {
      x.set(e.clientX / window.innerWidth);
      y.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [x, y]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute size-[42vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/45 blur-[90px] mix-blend-screen"
      style={{ left, top }}
    />
  );
}

export function Magnetic({ children, strength = 0.25 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className="inline-block"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
