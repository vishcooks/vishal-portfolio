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

- `app/` — routes: `/`, `/projects/`, `/projects/platform-revenue/`, `/projects/services-bookings/`, `/about/`, `/resume/`
- `dashboards/` — the two interactive dashboards (one component per report page)
- `components/dash/` — dashboard engine: slicers (`filters.tsx`), charts, pivot & detail tables, shell/tabs
- `lib/data/` — seeded synthetic data generators (deterministic; no real customer/company figures)
- `lib/site.ts` — all copy: projects, experience, skills, certifications

## Dashboards

Every page is rendered on **fully synthetic, deterministic data** — no real customer, product or company
information is used anywhere in the site.

- Platform Pipeline, Bookings & Churn — Executive Summary, Consolidated Report, AI Products
- Services Bookings & Pipeline — Executive Summary, Consolidated Report, Opportunity Details, Weighted Forecast,
  Prepaid Services & Work Orders, YoY Prepaid Breakup, Service Attach Rate (Unit), Service Attach Rate (Bookings $),
  Analytics Suite, Product Services Mapping

Deep-link to a tab with a hash, e.g. `/projects/services-bookings/#weighted-forecast`. Press `Ctrl/⌘ + K` anywhere for the command menu.
