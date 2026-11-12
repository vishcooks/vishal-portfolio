import { CSMS, makeAccounts, rng, round, type Forecast } from "./common";
import { buildLines, type OppLine, type Product } from "./lines";

const S = (
  name: string, code: string, type: string, asset: string, family: string, channel: string, unit: number,
  otfRatio: number, weight = 1,
): Product => ({ name, code, type, asset, family, channel, unit, otfRatio, weight });

export const SERVICES_CATALOG: Product[] = [
  S("Implementation — Standard", "PS-IMP-STD", "Implementation", "Professional Services", "Implementation", "Direct", 22, 2.2, 3),
  S("Implementation — Premium", "PS-IMP-PRM", "Implementation", "Professional Services", "Implementation", "Direct", 36, 2.4, 1.6),
  S("Connector Configuration", "PS-CFG-CON", "Configuration", "Professional Services", "Integrations", "Partner", 18, 2, 2),
  S("API & SSO Integration", "PS-INT-API", "Integration", "Professional Services", "Implementation", "Direct", 26, 2.6, 1.3),
  S("Managed Review Service", "PS-MRS", "Managed Review", "Managed Services", "Managed Services", "Direct", 64, 0.05, 2.2),
  S("Managed Admin Service", "PS-MAS", "Managed Admin", "Managed Services", "Managed Services", "Partner", 42, 0.05, 1.6),
  S("Legacy System Migration", "PS-MIG-LEG", "Legacy Migration", "Data Migration", "Migration", "Direct", 20, 3, 2.4),
  S("Bulk Data Ingestion (Historical)", "PS-MIG-ING", "Ingestion", "Data Migration", "Migration", "Marketplace", 16, 3.2, 1.4),
  S("Admin Training", "PS-TRN-ADM", "Admin Training", "Training", "Training", "Direct", 8, 1.8, 1.8),
  S("Reviewer Certification", "PS-TRN-REV", "End-user Training", "Training", "Training", "Partner", 6, 2, 1.2),
  S("Prepaid Services Package", "PS-PSP", "Prepaid", "Solutions Delivery", "Delivery", "Direct", 30, 1.2, 1.8),
  S("Custom Solution Build", "PS-CUS", "Custom Solution", "Solutions Delivery", "Delivery", "Direct", 34, 2.8, 1),
  S("Premium Support Retainer", "PS-SPT", "Premium Support", "Premium Support", "Managed Services", "Direct", 14, 0.1, 1.6),
  S("Analytics Implementation", "PS-ANA-IMP", "Implementation", "Professional Services", "Analytics", "Partner", 24, 2.2, 1.4),
  S("Analytics Source Integration", "PS-ANA-INT", "Integration", "Professional Services", "Analytics", "Marketplace", 20, 2.4, 1.1),
  S("Managed Analytics", "PS-ANA-MAN", "Managed Review", "Managed Services", "Analytics", "Partner", 38, 0.05, 1),
  S("Analytics Data Migration", "PS-ANA-MIG", "Legacy Migration", "Data Migration", "Analytics", "Direct", 18, 3, 0.9),
  S("Analyst Training", "PS-ANA-TRN", "End-user Training", "Training", "Analytics", "Partner", 7, 2, 0.8),
];

export const WO_TYPES = [
  ["migration", "Migration WO"],
  ["managed", "Managed Services WO"],
  ["delivery", "Delivery WO"],
  ["training", "Training WO"],
  ["support", "Support WO"],
] as const;
export type WoKey = (typeof WO_TYPES)[number][0];

export interface PrepaidDeal {
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

export interface PrepaidQuoteLine {
  oppId: string;
  oppName: string;
  account: string;
  productName: string;
  quoteType: string;
  quoteName: string;
  endYear: number;
  startEnd: string;
  prepaidStd: number;
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
  prepaid: PrepaidDeal[];
  prepaidLines: PrepaidQuoteLine[];
  attach: AttachDeal[];
}

const ATTACH_PRODUCTS = [
  ["Core Platform", "Core Platform — Records", "Core Platform", "Subscription", 0.42],
  ["Core Platform", "Core Platform — Collaboration", "Core Platform", "Subscription", 0.38],
  ["Integrations", "Integration — Messaging", "Integrations", "Subscription", 0.33],
  ["Integrations", "Integration — Voice", "Integrations", "Subscription", 0.36],
  ["Workflow", "Workflow & Review", "Workflow", "Add-on", 0.48],
  ["AI", "AI Risk Scoring", "AI & Analytics", "Add-on", 0.29],
  ["Enterprise", "Enterprise Platform Suite", "Core Platform", "Platform", 0.62],
  ["Governance", "Governance & Risk Suite", "Workflow", "Platform", 0.55],
] as const;

let cache: ServicesData | null = null;

export function getServicesData(): ServicesData {
  if (cache) return cache;
  const r = rng(20240711);
  const accounts = makeAccounts(r, 120);
  const lines = buildLines(r, accounts, SERVICES_CATALOG, { opps: 900, prefix: "PS", scale: 1.4, linesPerOpp: [1, 2] });

  const prepaid: PrepaidDeal[] = [];
  const prepaidLines: PrepaidQuoteLine[] = [];
  for (const l of lines) {
    if (l.productCode !== "PS-PSP") continue;
    const total = l.tcv;
    const consumed = l.forecast === "Closed" ? Math.min(1, 0.25 + (2026 - l.year) * 0.28 + r.next() * 0.2) : 0;
    const shares = WO_TYPES.map(() => r.next());
    const sum = shares.reduce((a, b) => a + b, 0);
    const wo = Object.fromEntries(
      WO_TYPES.map(([k], i) => [k, round((total * consumed * shares[i]) / sum, 10)]),
    ) as Record<WoKey, number>;
    prepaid.push({
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
      prepaidLines.push({
        oppId: l.oppId, oppName: l.oppName, account: l.account, productName: r.pick(["Prepaid Services Package", "Prepaid Services — Premium", "Prepaid Services — Flex Hours"]),
        quoteType, quoteName: `Q-${l.oppId.slice(4)}-${y + 1}`, endYear,
        startEnd: `${l.closeDate.slice(5)}-${endYear - 1} → ${l.closeDate.slice(5)}-${endYear}`,
        prepaidStd: std, workOrder, remaining: std - workOrder, line: l,
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

  cache = { lines, prepaid, prepaidLines, attach };
  return cache;
}
