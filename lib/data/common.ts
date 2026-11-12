export type Forecast = "Closed" | "Commit" | "Best Case" | "Pipeline" | "Omitted";

export const FORECASTS: Forecast[] = ["Closed", "Commit", "Best Case", "Pipeline", "Omitted"];
export const OPEN_FORECASTS: Forecast[] = ["Commit", "Best Case", "Pipeline"];

export const AS_OF = "2026-11-10";
export const AS_OF_LABEL = "Nov 10, 2026 6:00 AM";

export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)];
  const weighted = <T,>(items: readonly (readonly [T, number])[]) => {
    const total = items.reduce((s, [, w]) => s + w, 0);
    let r = next() * total;
    for (const [v, w] of items) if ((r -= w) <= 0) return v;
    return items[items.length - 1][0];
  };
  const logNormal = (median: number, spread = 0.7) => {
    const u = Math.max(next(), 1e-9);
    const v = next();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return median * Math.exp(z * spread);
  };
  return { next, int, pick, weighted, logNormal };
}
export type Rng = ReturnType<typeof rng>;

const PREFIX = [
  "Northwind", "Bluepeak", "Harborline", "Crescent", "Ironbridge", "Summit", "Lakeside", "Meridian", "Cobalt",
  "Granite", "Silverline", "Redwood", "Atlas", "Beacon", "Pinnacle", "Evergreen", "Sterling", "Halcyon",
  "Keystone", "Orion", "Tidewater", "Brightpath", "Copperleaf", "Fairhaven", "Westbrook", "Aurora", "Clearwater",
  "Highmark", "Stonegate", "Larkspur",
];
const SUFFIX = [
  "Capital", "Financial", "Securities", "Wealth", "Partners", "Advisors", "Bank", "Insurance", "Holdings",
  "Asset Mgmt", "Trust", "Credit Union", "Markets", "Health", "Energy",
];
export const INDUSTRIES = [
  "Banking", "Wealth Management", "Insurance", "Broker-Dealer", "Asset Management", "Government", "Healthcare",
  "Energy",
] as const;
const SUFFIX_INDUSTRY: Record<string, (typeof INDUSTRIES)[number]> = {
  Capital: "Asset Management", Financial: "Broker-Dealer", Securities: "Broker-Dealer", Wealth: "Wealth Management",
  Partners: "Wealth Management", Advisors: "Wealth Management", Bank: "Banking", Insurance: "Insurance",
  Holdings: "Banking", "Asset Mgmt": "Asset Management", Trust: "Banking", "Credit Union": "Banking",
  Markets: "Broker-Dealer", Health: "Healthcare", Energy: "Energy",
};

export const REPS = [
  "Avery Chen", "Jordan Patel", "Morgan Reyes", "Riley Okafor", "Casey Novak", "Taylor Brooks", "Quinn Alvarez",
  "Drew Kim", "Sam Whitaker", "Parker Lewis", "Jamie Fischer", "Rowan Iyer",
];
export const SERVICES_AES = ["Elena Ruiz", "Marcus Bell", "Priya Nair", "Owen Hart", "Nadia Kowalski"];
export const CSMS = ["Hannah Cole", "Victor Lam", "Grace Mendez", "Leo Duarte", "Ivy Sato"];
export const BUS = ["Enterprise", "Mid-Market", "Commercial", "Public Sector"] as const;
export const TEAMS: Record<string, string[]> = {
  Enterprise: ["Enterprise East", "Enterprise West", "Strategic"],
  "Mid-Market": ["MM North", "MM South"],
  Commercial: ["Commercial Velocity", "Commercial Growth"],
  "Public Sector": ["SLED", "Federal"],
};
export const OPP_TYPES = [["New Business", 3], ["Upsell", 4], ["Cross-sell", 2], ["Renewal", 3]] as const;
export const PS_STATUS = ["Not Requested", "Requested", "In Review", "Approved", "Scheduled", "Completed"];
export const LEAD_SOURCES = ["Partner Referral", "Inbound Web", "Outbound", "Event", "Customer Expansion"];
export const RESOLD_BY = ["Direct", "CloudVox", "TeleSure", "Unified Comms Co.", "NetVoice Partners"];
export const PARTNER_TYPES = ["None", "Reseller", "Referral", "MSP", "Technology Alliance"];

export interface Account {
  name: string;
  industry: string;
  bu: string;
  team: string;
  owner: string;
  csm: string;
  size: number;
}

export function makeAccounts(r: Rng, n: number): Account[] {
  const seen = new Set<string>();
  const out: Account[] = [];
  while (out.length < n) {
    const p = r.pick(PREFIX);
    const s = r.pick(SUFFIX);
    const name = `${p} ${s}`;
    if (seen.has(name)) continue;
    seen.add(name);
    const bu = r.weighted([["Enterprise", 3], ["Mid-Market", 3], ["Commercial", 2], ["Public Sector", 1]] as const);
    out.push({
      name,
      industry: s === "Bank" && r.next() < 0.2 ? "Government" : SUFFIX_INDUSTRY[s],
      bu,
      team: r.pick(TEAMS[bu]),
      owner: r.pick(REPS),
      csm: r.pick(CSMS),
      size: bu === "Enterprise" ? 3 : bu === "Mid-Market" ? 1.6 : bu === "Public Sector" ? 1.8 : 0.8,
    });
  }
  return out;
}

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function closedDate(r: Rng, fromYear = 2023) {
  const y = r.weighted(
    (
      [
        [2023, 2],
        [2024, 3],
        [2025, 4],
        [2026, 4],
      ] as const
    ).filter(([yy]) => yy >= fromYear),
  );
  const maxM = y === 2026 ? 10 : 12;
  const m = r.weighted(
    Array.from({ length: maxM }, (_, i) => [i + 1, (i + 1) % 3 === 0 ? 2.4 : 1] as const),
  );
  return iso(y, m, r.int(1, 28));
}

export function openDate(r: Rng) {
  const offset = r.int(0, 13);
  const m0 = 10 + offset;
  const y = 2026 + Math.floor(m0 / 12);
  const m = (m0 % 12) + 1;
  return iso(y, m, r.int(1, 28));
}

export function forecastFields(r: Rng): { forecast: Forecast; stage: string; probability: number; closeDate: string } {
  const forecast = r.weighted([["Closed", 62], ["Commit", 9], ["Best Case", 11], ["Pipeline", 15], ["Omitted", 3]] as const);
  switch (forecast) {
    case "Closed":
      return { forecast, stage: "Closed Won", probability: 100, closeDate: closedDate(r) };
    case "Commit":
      return { forecast, stage: "Negotiation", probability: 90, closeDate: openDate(r) };
    case "Best Case":
      return { forecast, stage: r.pick(["Proposal", "Solution Review"]), probability: r.pick([50, 60, 70]), closeDate: openDate(r) };
    case "Pipeline":
      return { forecast, stage: r.pick(["Discovery", "Qualification"]), probability: r.pick([10, 20, 30, 40]), closeDate: openDate(r) };
    default:
      return { forecast, stage: "Qualification", probability: 5, closeDate: openDate(r) };
  }
}

export const yearOf = (d: string) => Number(d.slice(0, 4));
export const monthOf = (d: string) => Number(d.slice(5, 7));
export const quarterOf = (d: string) => `${d.slice(0, 4)} Q${Math.ceil(monthOf(d) / 3)}`;
export const round = (v: number, step = 10) => Math.round(v / step) * step;
