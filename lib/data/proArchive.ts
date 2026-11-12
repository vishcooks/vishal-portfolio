import { makeAccounts, rng } from "./common";
import { buildLines, type OppLine, type Product } from "./lines";

const P = (
  name: string, code: string, type: string, asset: string, channel: string, unit: number,
  extra: Partial<Product> = {},
): Product => ({ name, code, type, asset, family: "Pro Archive", channel, unit, ...extra });

export const PRO_ARCHIVE_CATALOG: Product[] = [
  P("Pro Archive - Email", "PA-EML", "Archive", "Subscription", "Direct", 96, { weight: 4 }),
  P("Pro Archive - Social Media", "PA-SOC", "Archive", "Subscription", "Direct", 84, { weight: 2.5 }),
  P("Pro Archive - Web & Website", "PA-WEB", "Archive", "Subscription", "Partner", 120, { weight: 1.5 }),
  P("Pro Archive - Collaboration (Teams/Slack)", "PA-COL", "Archive", "Subscription", "Direct", 108, { weight: 3 }),
  P("Mobile Text Capture", "PA-MTC", "Capture", "Subscription", "Reseller", 132, { weight: 2.5 }),
  P("Voice Capture", "PA-VOC", "Capture", "Subscription", "Reseller", 150, { weight: 1.5 }),
  P("Supervision & Review", "PA-SUP", "Supervision", "Add-on", "Direct", 72, { weight: 2.5 }),
  P("Policy Lexicon Packs", "PA-LEX", "Supervision", "Add-on", "Partner", 36, { weight: 1.5 }),
  P("AI Risk Scoring", "PA-AIR", "AI", "Add-on", "Direct", 60, { ai: true, weight: 2.6 }),
  P("AI Assisted Review", "PA-AIA", "AI", "Add-on", "Direct", 54, { ai: true, weight: 2.2 }),
  P("GenAI Conversation Summaries", "PA-AIS", "AI", "Add-on", "Partner", 48, { ai: true, weight: 1.8 }),
  P("Extended Retention Storage", "PA-STO", "Storage & Add-ons", "Usage", "Direct", 18, { weight: 1.8, otfRatio: 0.02 }),
  P("eDiscovery Export", "PA-EDX", "Storage & Add-ons", "Usage", "Partner", 24, { weight: 1, otfRatio: 0.3 }),
  P("Onboarding & Data Import", "PA-ONB", "Storage & Add-ons", "Add-on", "Direct", 30, { weight: 1.2, otfRatio: 1.6 }),
];

export interface PartnerRev {
  month: number;
  partner: string;
  revenue: number;
}

export interface ProArchiveData {
  lines: OppLine[];
  partners: PartnerRev[];
}

let cache: ProArchiveData | null = null;

export function getProArchiveData(): ProArchiveData {
  if (cache) return cache;
  const r = rng(20250417);
  const accounts = makeAccounts(r, 140);
  const aiKeep: Record<number, number> = { 2023: 0, 2024: 0.3, 2025: 0.75 };
  const lines = buildLines(r, accounts, PRO_ARCHIVE_CATALOG, { opps: 950, prefix: "PA" }).filter(
    (l) => !l.isAI || r.next() < (aiKeep[l.year] ?? 1),
  );
  const partnerNames = ["Connector - Teams", "Connector - Zoom", "Connector - Bloomberg", "Connector - Slack", "Carrier - TeleSure"];
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
