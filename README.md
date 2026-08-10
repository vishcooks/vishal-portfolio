# vishal-portfolio

Personal portfolio site for **Vishal Mahendra — Analytics Engineer**.
One-page, hand-built (no build step), with a **live open-data dashboard** rendered in-page.

- **Live site:** `https://<your-project>.pages.dev` (Cloudflare Pages)
- **Design:** near-black canvas · single mint accent · Swiss grid · console/terminal restraint
- **Live data:** USGS earthquake feed (no API key) → ECharts, refreshed every 60s
- **SQL/BI demo:** `streamlit_app/` — DuckDB medallion model (bronze → silver → gold)

## Structure
```
index.html                 # the whole site
assets/css/styles.css      # design system
assets/js/main.js          # live data + ECharts + interactions
assets/img/favicon.svg
assets/resume.pdf          # <-- drop your résumé PDF here
streamlit_app/             # embeddable SQL/BI dashboard
github-profile/README.md   # profile README template
projects/                  # per-project case-study READMEs
DEPLOY.md                  # full deploy runbook
CONTENT.md                 # placeholders to replace + copy notes
```

## Run locally
```powershell
# static site
py -m http.server 5173
# then open http://localhost:5173

# streamlit dashboard (optional)
cd streamlit_app
py -m pip install -r requirements.txt
py -m streamlit run app.py
```

## Deploy
See **[DEPLOY.md](DEPLOY.md)** — GitHub → Cloudflare Pages, Streamlit Community Cloud, custom domain, embeds.
