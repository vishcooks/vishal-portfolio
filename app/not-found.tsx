import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden pt-16">
      <Backdrop intensity={0.6} />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-coral">404 · row not found</p>
        <h1 className="mt-4 font-display text-5xl font-light tracking-tight md:text-7xl">This join returned nothing.</h1>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-navy hover:bg-coral-600">
          Back to home
        </Link>
      </div>
    </section>
  );
}
