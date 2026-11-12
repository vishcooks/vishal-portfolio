import {
  type Account, type Forecast, type Rng, forecastFields, LEAD_SOURCES, OPP_TYPES, PARTNER_TYPES, PS_STATUS,
  RESOLD_BY, SERVICES_AES, quarterOf, round, yearOf, monthOf,
} from "./common";

export interface Product {
  name: string;
  code: string;
  type: string;
  asset: string;
  family: string;
  channel: string;
  unit: number;
  ai?: boolean;
  otfRatio?: number;
  weight?: number;
}

export interface OppLine {
  id: string;
  oppId: string;
  oppName: string;
  account: string;
  industry: string;
  businessUnit: string;
  team: string;
  owner: string;
  servicesAE: string;
  csm: string;
  type: string;
  closeDate: string;
  year: number;
  month: number;
  quarter: string;
  forecast: Forecast;
  stage: string;
  probability: number;
  productName: string;
  productCode: string;
  productType: string;
  productFamily: string;
  assetType: string;
  channel: string;
  isAI: boolean;
  quoteTerm: number;
  netQty: number;
  commitQty: number;
  listUnitPrice: number;
  arr: number;
  otf: number;
  arrOtf: number;
  tcv: number;
  psStatus: string;
  requiredBy: string;
  leadSource: string;
  resoldBy: string;
  partnerType: string;
  link: string;
}

export function buildLines(
  r: Rng,
  accounts: Account[],
  catalog: Product[],
  opts: { opps: number; prefix: string; scale?: number; linesPerOpp?: [number, number] },
): OppLine[] {
  const out: OppLine[] = [];
  const weighted = catalog.map((p) => [p, p.weight ?? 1] as const);
  for (let i = 0; i < opts.opps; i++) {
    const acc = r.pick(accounts);
    const f = forecastFields(r);
    const type = r.weighted(OPP_TYPES);
    const term = r.weighted([[12, 4], [24, 2], [36, 3]] as const);
    const oppId = `${opts.prefix}-${String(10000 + i)}`;
    const nLines = r.int(...(opts.linesPerOpp ?? [1, 3]));
    const used = new Set<string>();
    const leadSource = r.pick(LEAD_SOURCES);
    const resoldBy = r.weighted(RESOLD_BY.map((v, k) => [v, k === 0 ? 5 : 1.4] as const));
    const partnerType = resoldBy === "Direct" ? r.weighted([["None", 6], ["Referral", 1]] as const) : r.pick(PARTNER_TYPES.slice(1));
    const ps = f.forecast === "Closed" ? r.pick(PS_STATUS.slice(3)) : r.pick(PS_STATUS.slice(0, 4));
    for (let l = 0; l < nLines; l++) {
      const p = r.weighted(weighted);
      if (used.has(p.code)) continue;
      used.add(p.code);
      const qty = Math.max(1, Math.round(r.logNormal(40 * acc.size, 0.9)));
      const unit = round(p.unit * (0.85 + r.next() * 0.3), 1);
      const expansionSign = type === "Renewal" && r.next() < 0.12 ? -1 : 1;
      const arr = round(qty * unit * (opts.scale ?? 1) * expansionSign, 10);
      const otf = round(Math.abs(arr) * (p.otfRatio ?? 0.1) * (0.5 + r.next()), 10);
      const reqOffset = r.int(14, 120);
      const req = new Date(f.closeDate + "T00:00:00");
      req.setDate(req.getDate() + reqOffset);
      out.push({
        id: `${oppId}-${l}`,
        oppId,
        oppName: `${acc.name} - ${type} - ${p.type}`,
        account: acc.name,
        industry: acc.industry,
        businessUnit: acc.bu,
        team: acc.team,
        owner: acc.owner,
        servicesAE: SERVICES_AES[(acc.name.length + i) % SERVICES_AES.length],
        csm: acc.csm,
        type,
        ...f,
        year: yearOf(f.closeDate),
        month: monthOf(f.closeDate),
        quarter: quarterOf(f.closeDate),
        productName: p.name,
        productCode: p.code,
        productType: p.type,
        productFamily: p.family,
        assetType: p.asset,
        channel: p.channel,
        isAI: !!p.ai,
        quoteTerm: term,
        netQty: qty * expansionSign,
        commitQty: Math.round(qty * (0.7 + r.next() * 0.3)),
        listUnitPrice: unit,
        arr,
        otf,
        arrOtf: arr + otf,
        tcv: arr * (term / 12) + otf,
        psStatus: ps,
        requiredBy: req.toISOString().slice(0, 10),
        leadSource,
        resoldBy,
        partnerType,
        link: `#${oppId}`,
      });
    }
  }
  return out;
}

export const isBooking = (l: { forecast: Forecast }) => l.forecast === "Closed";
export const isPipeline = (l: { forecast: Forecast }) =>
  l.forecast === "Commit" || l.forecast === "Best Case" || l.forecast === "Pipeline";
