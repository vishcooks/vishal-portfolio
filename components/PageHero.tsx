import type { ReactNode } from "react";
import { Backdrop } from "./Backdrop";
import { Eyebrow } from "./Reveal";

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden pt-16">
      <Backdrop intensity={0.65} />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 md:px-8 md:pb-20 md:pt-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,5.5vw,4.75rem)] font-light leading-[1.02] tracking-[-0.03em]">{title}</h1>
        {children}
      </div>
    </section>
  );
}
