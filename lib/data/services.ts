import { CSMS, makeAccounts, rng, round, type Forecast } from "./common";
import { buildLines, type OppLine, type Product } from "./lines";

const S = (
  name: string, code: string, type: string, asset: string, family: string, channel: string, unit: number,
  otfRatio: number, weight = 1,
): Product => ({ name, code, type, asset, family, channel, unit, otfRatio, weight });

export const SERVICES_CATALOG: Product[] = [
  S("Implementation - Standard", "SGS-IMP-STD", "Implementation", "Professional Services", "Archive Services", "Direct", 22, 2.2, 3),
  S("Implementation - Premium", "SGS-IMP-PRM", "Implementation", "Professional Services", "Archive Services", "Direct", 36, 2.4, 1.6),
  S("Connector Configuration", "SGS-CFG-CON", "Configuration", "Professional Services", "Capture Services", "Partner", 18, 2, 2),
  S("API & SSO Integration", "SGS-INT-API", "Integration", "Professional Services", "Supervision Services", "Direct", 26, 2.6, 1.3),
  S("Managed Review Service", "SGS-MRS", "Managed Review", "Managed Services", "Supervision Services", "Direct", 64, 0.05, 2.2),
  S("Managed Admin Service", "SGS-MAS", "Managed Admin", "Managed Services", "Archive Services", "Partner", 42, 0.05, 1.6),
  S("Legacy Archive Migration", "SGS-DM-LEG", "Legacy Migration", "Data Migration", "Archive Services", "Direct", 20, 3, 2.4),
  S("Bulk Ingestion (Historical)", "SGS-DM-ING", "Ingestion", "Data Migration", "Capture Services", "Marketplace", 16, 3.2, 1.4),
  S("Admin Training", "SGS-TRN-ADM", "Admin Training", "Training", "Archive Services", "Direct", 8, 1.8, 1.8),
  S("Reviewer Certification", "SGS-TRN-REV", "End-user Training", "Training", "Supervision Services", "Partner", 6, 2, 1.2),
  S("Advanced Services Package (ASP)", "SGS-ASP", "ASP", "Solutions Delivery", "Archive Services", "Direct", 30, 1.2, 1.8),
  S("Custom Solution Build", "SGS-SD-CUS", "Custom Solution", "Solutions Delivery", "Supervision Services", "Direct", 34, 2.8, 1),
  S("Value Added Maintenance", "SGS-VAM", "VAM", "VAM", "Archive Services", "Direct", 14, 0.1, 1.6),
  S("CR&A Implementation", "SGS-CRA-IMP", "Implementation", "Professional Services", "Call Recording & Analytics", "Partner", 24, 2.2, 1.4),
  S("CR&A Carrier Integration", "SGS-CRA-INT", "Integration", "Professional Services", "Call Recording & Analytics", "Marketplace", 20, 2.4, 1.1),
  S("CR&A Managed Analytics", "SGS-CRA-MAN", "Managed Review", "Managed Services", "Call Recording & Analytics", "Partner", 38, 0.05, 1),
  S("CR&A Recording Migration", "SGS-CRA-DM", "Legacy Migration", "Data Migration", "Call Recording & Analytics", "Direct", 18, 3, 0.9),
  S("CR&A Analyst Training", "SGS-CRA-TRN", "End-user Training", "Training", "Call Recording & Analytics", "Partner", 7, 2, 0.8),
];

export const WO_TYPES = [
  ["dm", "Data Migration WO"],
  ["managed", "Managed Services WO"],
  ["solutions", "Solutions Delivery WO"],
  ["training", "Training WO"],
  ["vam", "VAM WO"],
] as const;
export type WoKey = (typeof WO_TYPES)[number][0];

export interface AspDeal {
  oppId: string;
  oppName: string;
  account: string;
  closeDate: string;
  year: number;
  forecast: Forecast;
  quoteTerm: number;
  tcv: number;
  arr: number;
  wo: Record<WoKey, number>;
  adjustment: number;
  line: OppLine;
}

export interface AspQuoteLine {
  oppId: string;
  oppName: string;
  account: string;
  productName: string;
  quoteType: string;
  quoteName: string;
  endYear: number;
  startEnd: string;
  aspStd: number;
  workOrder: number;
  remaining: number;
  line: OppLine;
}

export interface AttachDeal {
  id: string;
  account: string;
  industry: string;
  businessUnit: string;
  team: string;
  csm: string;
  serviceOwner: string;
  closeDate: string;
  year: number;
  month: number;
  forecast: Forecast;
  productType: string;
  productName: string;
  productFamily: string;
  assetType: string;
  channel: string;
  productArr: number;
  productOtf: number;
  hasServices: boolean;
  servicesArr: number;
  servicesOtf: number;
  users: number;
  quoteTerm: number;
}

export interface ServicesData {
  lines: OppLine[];
  asp: AspDeal[];
  aspLines: AspQuoteLine[];
  attach: AttachDeal[];
}

const ATTACH_PRODUCTS = [
  ["Archive", "Pro Archive - Email", "Archive Platform", "Subscription", 0.42],
  ["Archive", "Pro Archive - Collaboration", "Archive Platform", "Subscription", 0.38],
  ["Capture", "Mobile Text Capture", "Capture", "Subscription", 0.33],
  ["Capture", "Voice Capture", "Capture", "Subscription", 0.36],
  ["Supervision", "Supervision & Review", "Supervision", "Add-on", 0.48],
  ["AI", "AI Risk Scoring", "AI & Analytics", "Add-on", 0.29],
  ["Enterprise Archive", "Enterprise Archive Suite", "Archive Platform", "Platform", 0.62],
  ["Conduct", "Conduct Surveillance", "Supervision", "Platform", 0.55],
] as const;

let cache: ServicesData | null = null;

export function getServicesData(): ServicesData {
  if (cache) return cache;
  const r = rng(20240711);
  const accounts = makeAccounts(r, 120);
  const lines = buildLines(r, accounts, SERVICES_CATALOG, { opps: 900, prefix: "SGS", scale: 1.4, linesPerOpp: [1, 2] });

  const asp: AspDeal[] = [];
  const aspLines: AspQuoteLine[] = [];
  for (const l of lines) {
    if (l.productCode !== "SGS-ASP") continue;
    const total = l.tcv;
    const consumed = l.forecast === "Closed" ? Math.min(1, 0.25 + (2026 - l.year) * 0.28 + r.next() * 0.2) : 0;
    const shares = WO_TYPES.map(() => r.next());
    const sum = shares.reduce((a, b) => a + b, 0);
    const wo = Object.fromEntries(
      WO_TYPES.map(([k], i) => [k, round((total * consumed * shares[i]) / sum, 10)]),
    ) as Record<WoKey, number>;
    asp.push({
      oppId: l.oppId, oppName: l.oppName, account: l.account, closeDate: l.closeDate, year: l.year,
      forecast: l.forecast, quoteTerm: l.quoteTerm, tcv: l.tcv, arr: l.arr, wo,
      adjustment: r.next() < 0.2 ? round(-total * 0.05 * r.next(), 10) : 0, line: l,
    });
    if (l.forecast !== "Closed") continue;
    const years = l.quoteTerm / 12;
    const quoteType = l.type === "Renewal" ? "Renewal" : r.next() < 0.2 ? "Amendment" : "New";
    for (let y = 0; y < years; y++) {
      const endYear = l.year + y + 1;
      const std = round(total / years, 10);
      const used = endYear <= 2025 ? 0.75 + r.next() * 0.25 : endYear === 2026 ? 0.3 + r.next() * 0.45 : r.next() * 0.15;
      const workOrder = round(std * used, 10);
      aspLines.push({
        oppId: l.oppId, oppName: l.oppName, account: l.account, productName: r.pick(["Advanced Services Package (ASP)", "ASP - Premier", "ASP - Flex Hours"]),
        quoteType, quoteName: `Q-${l.oppId.slice(4)}-${y + 1}`, endYear,
        startEnd: `${l.closeDate.slice(5)}-${endYear - 1} → ${l.closeDate.slice(5)}-${endYear}`,
        aspStd: std, workOrder, remaining: std - workOrder, line: l,
      });
    }
  }

  const attach: AttachDeal[] = [];
  for (let i = 0; i < 2600; i++) {
    const acc = r.pick(accounts);
    const [type, name, family, asset, baseRate] = r.pick(ATTACH_PRODUCTS);
    const y = r.weighted([[2023, 2], [2024, 3], [2025, 4], [2026, 3.6]] as const);
    const m = r.int(1, y === 2026 ? 10 : 12);
    const channel = r.weighted([["Direct", 5], ["Partner", 2.5], ["Marketplace", 1]] as const);
    const yearLift = (y - 2023) * 0.035 + (m > 9 ? 0.03 : 0);
    const chLift = channel === "Direct" ? 0.05 : channel === "Marketplace" ? -0.08 : -0.02;
    const has = r.next() < baseRate + yearLift + chLift + (acc.bu === "Enterprise" ? 0.08 : 0);
    const productArr = round(r.logNormal(24000 * acc.size, 0.8), 10);
    const productOtf = round(productArr * r.next() * 0.15, 10);
    const svcRatio = has ? 0.08 + r.next() * 0.22 + yearLift : 0;
    attach.push({
      id: `AD-${i}`, account: acc.name, industry: acc.industry, businessUnit: acc.bu, team: acc.team, csm: acc.csm,
      serviceOwner: r.pick(CSMS), closeDate: `${y}-${String(m).padStart(2, "0")}-15`, year: y, month: m,
      forecast: "Closed", productType: type, productName: name, productFamily: family, assetType: asset, channel,
      productArr, productOtf, hasServices: has,
      servicesArr: round(productArr * svcRatio * 0.35, 10), servicesOtf: round(productArr * svcRatio * 0.65, 10),
      users: Math.round(r.logNormal(60 * acc.size, 0.7)), quoteTerm: r.pick([12, 24, 36]),
    });
  }

  cache = { lines, asp, aspLines, attach };
  return cache;
}
