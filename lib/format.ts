export const money = (v: number, digits = 1) => {
  const a = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (a >= 1e9) return `${s}$${(a / 1e9).toFixed(digits)}B`;
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(digits)}M`;
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(digits === 1 ? 0 : digits)}K`;
  return `${s}$${a.toFixed(0)}`;
};

export const moneyFull = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const num = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });

export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;

export const date = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
