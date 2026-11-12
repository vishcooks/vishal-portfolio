"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EXPERIENCE } from "@/lib/site";

export function Experience() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const h = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <ol ref={ref} className="relative">
      <div aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10 md:left-[calc(12rem+7px)]">
        <motion.div className="w-px bg-coral" style={{ height: h }} />
      </div>
      {EXPERIENCE.map((e, i) => (
        <motion.li
          key={e.role}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="relative grid gap-2 pb-12 pl-8 md:grid-cols-[12rem_1fr] md:gap-10 md:pl-0"
        >
          <div className="font-mono text-xs text-cream/45 md:pt-1.5 md:text-right md:pr-8">
            {e.when}
            <span className="block text-cream/30">{e.org}</span>
          </div>
          <span aria-hidden className={`absolute left-0 top-1.5 size-[15px] rounded-full border-2 md:left-[12rem] ${i === 0 ? "border-coral bg-coral/30" : "border-white/25 bg-navy-900"}`} />
          <div className="md:pl-10">
            <h3 className="font-display text-2xl font-light tracking-tight">
              {e.role} <span className="text-cream/40">· {e.org}</span>
            </h3>
            <ul className="mt-3 space-y-2">
              {e.points.map((p) => (
                <li key={p} className="max-w-2xl text-[15px] leading-relaxed text-cream/65">{p}</li>
              ))}
            </ul>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
