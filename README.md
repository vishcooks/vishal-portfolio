# vishal-portfolio

Personal portfolio site for **Vishal Mahendra — Analytics Engineer**.
Multi-page, hand-built (no build step), with an embedded **live Streamlit dashboard**.

- **Live site:** [vishal-portfolio.vishbuilds.workers.dev](https://vishal-portfolio.vishbuilds.workers.dev/) (Cloudflare)
- **Design:** light · minimalist · single indigo accent · Swiss grid · subtle motion
- **Live demo:** `streamlit_app/` — Customer VOC & GTM command center on a DuckDB medallion model (bronze → silver → gold), embedded on Home & Projects
- **Pages:** Home · Projects · About · Shiro · Résumé

## Structure
```
index.html                 # Home (hero + architecture card + selected work)
projects.html              # Projects (filters + featured live demo + cards)
about.html                 # About (bio + skills + certs + education)
shiro.html                 # Shiro (pet page; drop assets/img/shiro.jpg)
resume.html                # Résumé (embedded PDF)
assets/css/styles.css      # design system
assets/js/main.js          # reveal, count-up, mobile nav, project filters
assets/img/favicon.svg
assets/resume.pdf          # résumé PDF
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
