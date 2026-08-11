/* =========================================================
   main.js — shared interactions across all pages
   - reveal on scroll
   - count-up hero stats
   - mobile nav toggle
   - project filter chips (projects page)
   - architecture-card staged reveal (home)
   ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* year in footer */
const yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();

/* ---------- mobile nav ---------- */
const toggle = document.querySelector(".nav__toggle");
const links = document.querySelector(".nav__links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

/* ---------- reveal on scroll ---------- */
const revealIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealIO.observe(el));

/* ---------- architecture card staged reveal ---------- */
const arch = document.querySelector(".arch");
if (arch) {
  const archIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { arch.classList.add("is-in"); archIO.unobserve(arch); } }),
    { threshold: 0.25 }
  );
  archIO.observe(arch);
}

/* ---------- count-up hero stats ---------- */
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const dur = reduceMotion ? 0 : 1100;
  const start = performance.now();
  (function tick(now) {
    const p = dur ? Math.min((now - start) / dur, 1) : 1;
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const statIO = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); statIO.unobserve(e.target); } }),
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => statIO.observe(el));

/* ---------- project filters ---------- */
const chips = document.querySelectorAll(".chip");
const projects = document.querySelectorAll("[data-category]");
if (chips.length && projects.length) {
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      projects.forEach((p) => {
        const show = f === "all" || (p.dataset.category || "").split(" ").includes(f);
        p.classList.toggle("is-hidden", !show);
      });
    })
  );
}
