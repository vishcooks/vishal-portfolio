import type { Metadata } from "next";
import { Download, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Résumé" };

export default function Resume() {
  return (
    <>
      <PageHero eyebrow="Résumé" title="The full résumé, inline.">
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/resume.pdf" download className="inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-navy hover:bg-coral-600">
            <Download className="size-4" /> Download PDF
          </a>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm">
            Open in new tab <ExternalLink className="size-4" />
          </a>
        </div>
      </PageHero>
      <section className="mx-auto max-w-5xl px-5 pb-24 md:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-cream shadow-2xl shadow-black/40">
          <object data="/resume.pdf#view=FitH" type="application/pdf" className="h-[85vh] w-full">
            <p className="p-10 text-center text-navy">
              Your browser can&apos;t display the PDF inline. <a href="/resume.pdf" className="text-coral underline">Open résumé ↗</a>
            </p>
          </object>
        </div>
      </section>
    </>
  );
}
