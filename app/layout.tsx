import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { SITE } from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const display = Inter_Tight({ subsets: ["latin"], weight: ["200", "300", "400", "500"], variable: "--font-display-face" });

export const metadata: Metadata = {
  title: { default: `${SITE.name} — Analytics Engineer`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: `${SITE.name} — Analytics Engineer`, description: SITE.description, type: "website" },
};

export const viewport: Viewport = { themeColor: "#14213D" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${display.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-coral focus:px-4 focus:py-2 focus:text-navy">
          Skip to content
        </a>
        <Providers>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
