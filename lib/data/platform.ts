import { makeAccounts, rng } from "./common";
import { buildLines, type OppLine, type Product } from "./lines";

const P = (
  name: string, code: string, type: string, asset: string, channel: string, unit: number,
  extra: Partial<Product> = {},
): Product => ({ name, code, type, asset, family: "Platform", channel, unit, ...extra });

export const PLATFORM_CATALOG: Product[] = [
  P("Core Platform — Records", "PLT-REC", "Platform", "Subscription", "Direct", 96, { weight: 4 }),
  P("Core Platform — Social Feeds", "PLT-SOC", "Platform", "Subscription", "Direct", 84, { weight: 2.5 }),
  P("Core Platform — Web Content", "PLT-WEB", "Platform", "Subscription", "Partner", 120, { weight: 1.5 }),
  P("Core Platform — Collaboration", "PLT-COL", "Platform", "Subscription", "Direct", 108, { weight: 3 }),
  P("Integration — Messaging", "INT-MSG", "Integrations", "Subscription", "Reseller", 132, { weight: 2.5 }),
  P("Integration — Voice", "INT-VOC", "Integrations", "Subscription", "Reseller", 150, { weight: 1.5 }),
  P("Workflow & Review", "WRK-REV", "Workflow", "Add-on", "Direct", 72, { weight: 2.5 }),
  P("Policy Templates", "WRK-POL", "Workflow", "Add-on", "Partner", 36, { weight: 1.5 }),
  P("AI Risk Scoring", "AI-RIS", "AI", "Add-on", "Direct", 60, { ai: true, weight: 2.6 }),
  P("AI Assisted Review", "AI-REV", "AI", "Add-on", "Direct", 54, { ai: true, weight: 2.2 }),
  P("AI Conversation Summaries", "AI-SUM", "AI", "Add-on", "Partner", 48, { ai: true, weight: 1.8 }),
  P("Extended Retention Storage", "STO-EXT", "Storage & Add-ons", "Usage", "Direct", 18, { weight: 1.8, otfRatio: 0.02 }),
  P("Export & Reporting", "EXP-RPT", "Storage & Add-ons", "Usage", "Partner", 24, { weight: 1, otfRatio: 0.3 }),
  P("Onboarding & Data Import", "ONB-IMP", "Storage & Add-ons", "Add-on", "Direct", 30, { weight: 1.2, otfRatio: 1.6 }),
];

export interface PartnerRev {
  month: number;
  partner: string;
  revenue: number;
}

export interface PlatformData {
  lines: OppLine[];
  partners: PartnerRev[];
}

let cache: PlatformData | null = null;

export function getPlatformData(): PlatformData {
  if (cache) return cache;
  const r = rng(20250417);
  const accounts = makeAccounts(r, 140);
  const aiKeep: Record<number, number> = { 2023: 0, 2024: 0.3, 2025: 0.75 };
  const lines = buildLines(r, accounts, PLATFORM_CATALOG, { opps: 950, prefix: "PLT" }).filter(
    (l) => !l.isAI || r.next() < (aiKeep[l.year] ?? 1),
  );
  const partnerNames = ["Marketplace Provider", "Systems Integrator", "Reseller Network", "Technology Alliance", "Referral Partner"];
  const partners: PartnerRev[] = [];
  partnerNames.forEach((p, i) => {
    let base = 38000 + i * 9000 + r.next() * 8000;
    for (let m = 1; m <= 12; m++) {
      base *= 1 + (r.next() - 0.38) * 0.12;
      partners.push({ month: m, partner: p, revenue: Math.round(base) });
    }
  });
  cache = { lines, partners };
  return cache;
}
