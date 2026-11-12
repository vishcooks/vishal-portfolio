# Vishal Mahendra — Portfolio

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Recharts.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all routes prerendered as static)
npm start          # serve the production build
```

## Deploy (Vercel)

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: Next.js. No env vars needed.

## Structure

- `app/` — routes: `/`, `/projects/`, `/projects/pro-archive/`, `/projects/services-bookings/`, `/about/`, `/resume/`
- `dashboards/` — the two interactive dashboards (one component per published Power BI page)
- `components/dash/` — dashboard engine: slicers (`filters.tsx`), charts, pivot & detail tables, shell/tabs
- `lib/data/` — seeded synthetic data generators (deterministic; no real customer/company figures)
- `lib/site.ts` — all copy: projects, experience, skills, certifications

## Dashboards

Only **published** pages from the source `.pbip` reports are rebuilt; pages marked `HiddenInViewMode`
(duplicates, backups, WIP copies) are excluded.

- Pro Archive Pipeline, Bookings & Churn — Executive Summary, Consolidated Report, AI SKUs
- Services Bookings & Pipeline — Executive Summary, Consolidated Report, Opportunity Details, Weighted Forecast,
  ASP & Work Orders, YoY ASP Breakup, Service Attach Rate (Unit), Service Attach Rate (Bookings $), CR&A,
  Product Services Mapping

Deep-link to a tab with a hash, e.g. `/projects/services-bookings/#weighted-forecast`. Press `Ctrl/⌘ + K` anywhere for the command menu.
