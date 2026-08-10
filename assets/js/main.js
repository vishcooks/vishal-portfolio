/* =========================================================
   main.js — live data + interactions
   - Live open data: USGS earthquakes (no API key, CORS enabled)
   - ECharts: magnitude histogram + hourly timeline
   - Count-up KPIs, reveal-on-scroll, active-nav
   ========================================================= */

const USGS_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
const ACCENT = "#6ee7a8";
const INK_3 = "#6d6d68";
const LINE = "rgba(255,255,255,0.09)";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- utilities ---------- */
const $ = (id) => document.getElementById(id);
const fmt = (n) => new Intl.NumberFormat("en-US").format(n);

/* Fallback sample so the page never looks broken if the API is unreachable */
function sampleQuakes() {
  const now = Date.now();
  const feats = [];
  for (let i = 0; i < 180; i++) {
    const mag = Math.max(0.4, +(Math.random() * 5 + Math.random()).toFixed(1));
    feats.push({ properties: { mag, time: now - Math.random() * 864e5, place: "sample region" } });
  }
  return { features: feats, _sample: true };
}

/* ---------- data → derived model ---------- */
function transform(geo) {
  const quakes = geo.features
    .map((f) => ({ mag: f.properties.mag, time: f.properties.time }))
    .filter((q) => typeof q.mag === "number");

  const count = quakes.length;
  const mags = quakes.map((q) => q.mag);
  const max = count ? Math.max(...mags) : 0;
  const avg = count ? mags.reduce((a, b) => a + b, 0) / count : 0;
  const strong = quakes.filter((q) => q.mag >= 4.5).length;

  // magnitude histogram buckets
  const buckets = ["<1", "1–2", "2–3", "3–4", "4–5", "5+"];
  const hist = [0, 0, 0, 0, 0, 0];
  mags.forEach((m) => {
    if (m < 1) hist[0]++;
    else if (m < 2) hist[1]++;
    else if (m < 3) hist[2]++;
    else if (m < 4) hist[3]++;
    else if (m < 5) hist[4]++;
    else hist[5]++;
  });

  // hourly timeline (last 24h)
  const now = Date.now();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const perHour = new Array(24).fill(0);
  quakes.forEach((q) => {
    const hAgo = Math.floor((now - q.time) / 36e5);
    if (hAgo >= 0 && hAgo < 24) perHour[23 - hAgo]++;
  });
  const hourLabels = hours.map((h) => (h % 6 === 0 ? `-${23 - h}h` : ""));

  return { count, max, avg, strong, buckets, hist, perHour, hourLabels, sample: !!geo._sample };
}

/* ---------- render ---------- */
let histChart, timeChart, sparkChart;

function baseGrid(extra = {}) {
  return { left: 8, right: 12, top: 18, bottom: 22, containLabel: true, ...extra };
}
function axisStyle() {
  return {
    axisLine: { lineStyle: { color: LINE } },
    axisTick: { show: false },
    axisLabel: { color: INK_3, fontFamily: "JetBrains Mono", fontSize: 10 },
    splitLine: { lineStyle: { color: LINE } },
  };
}

function renderConsole(m) {
  $("q-count").textContent = fmt(m.count);
  $("q-max").textContent = m.max.toFixed(1);
  $("q-avg").textContent = m.avg.toFixed(2);
  $("q-updated").textContent = m.sample ? "sample data (offline)" : "updated " + new Date().toLocaleTimeString();

  if (!window.echarts) return;
  const el = $("spark");
  sparkChart = sparkChart || echarts.init(el, null, { renderer: "svg" });
  sparkChart.setOption({
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: { type: "category", show: false, data: m.perHour.map((_, i) => i) },
    yAxis: { type: "value", show: false },
    tooltip: { trigger: "axis", backgroundColor: "#141417", borderColor: LINE, textStyle: { color: "#ededea", fontFamily: "JetBrains Mono", fontSize: 11 } },
    series: [{
      type: "line", data: m.perHour, smooth: true, symbol: "none",
      lineStyle: { color: ACCENT, width: 2 },
      areaStyle: { color: "rgba(110,231,168,0.14)" },
    }],
  });
}

function renderDashboard(m) {
  $("d-count").textContent = fmt(m.count);
  $("d-max").textContent = m.max.toFixed(1);
  $("d-avg").textContent = m.avg.toFixed(2);
  $("d-strong").textContent = fmt(m.strong);

  if (!window.echarts) return;

  histChart = histChart || echarts.init($("chart-hist"), null, { renderer: "svg" });
  histChart.setOption({
    grid: baseGrid(),
    tooltip: { trigger: "axis", backgroundColor: "#141417", borderColor: LINE, textStyle: { color: "#ededea", fontFamily: "JetBrains Mono", fontSize: 11 } },
    xAxis: { type: "category", data: m.buckets, ...axisStyle(), splitLine: { show: false } },
    yAxis: { type: "value", ...axisStyle() },
    series: [{
      type: "bar", data: m.hist, barWidth: "58%",
      itemStyle: { color: ACCENT, borderRadius: [4, 4, 0, 0] },
    }],
  });

  timeChart = timeChart || echarts.init($("chart-timeline"), null, { renderer: "svg" });
  timeChart.setOption({
    grid: baseGrid(),
    tooltip: { trigger: "axis", backgroundColor: "#141417", borderColor: LINE, textStyle: { color: "#ededea", fontFamily: "JetBrains Mono", fontSize: 11 } },
    xAxis: { type: "category", data: m.hourLabels, ...axisStyle(), splitLine: { show: false } },
    yAxis: { type: "value", ...axisStyle() },
    series: [{
      type: "line", data: m.perHour, smooth: true, symbol: "none",
      lineStyle: { color: ACCENT, width: 2 },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [
        { offset: 0, color: "rgba(110,231,168,0.28)" }, { offset: 1, color: "rgba(110,231,168,0)" }] } },
    }],
  });
}

async function loadData() {
  let geo;
  try {
    const res = await fetch(USGS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("bad status");
    geo = await res.json();
    if (!geo.features || !geo.features.length) throw new Error("empty");
  } catch (e) {
    geo = sampleQuakes();
  }
  const m = transform(geo);
  renderConsole(m);
  renderDashboard(m);
}

/* ---------- count-up KPIs ---------- */
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const dur = reduceMotion ? 0 : 1100;
  const start = performance.now();
  function tick(now) {
    const p = dur ? Math.min((now - start) / dur, 1) : 1;
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- observers: reveal + kpis + resize ---------- */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => revealIO.observe(el));

const kpiIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { countUp(e.target); kpiIO.unobserve(e.target); }
  });
}, { threshold: 0.6 });
document.querySelectorAll(".kpi__num").forEach((el) => kpiIO.observe(el));

/* ---------- active nav ---------- */
const navLinks = [...document.querySelectorAll(".nav__links a")];
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);
const navIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach((s) => navIO.observe(s));

window.addEventListener("resize", () => {
  [histChart, timeChart, sparkChart].forEach((c) => c && c.resize());
});

/* ---------- boot ---------- */
window.addEventListener("load", () => {
  loadData();
  setInterval(loadData, 60000); // refresh every 60s
});
