# Deploy runbook

Everything here is **free**. Order: (1) push to GitHub → (2) deploy site to Cloudflare Pages →
(3) deploy Streamlit dashboard → (4) embed it → (5) optional custom domain → (6) GitHub profile.

Estimated time: ~30–40 min the first time.

---

## 0. Prerequisites
- A **personal** GitHub account (use personal, not your work identity).
- Git installed. Check: `git --version`.
- Your résumé PDF copied to `assets/resume.pdf`.

> ⚠️ This folder lives outside your work OneDrive on purpose. Push it to your **personal** GitHub.

---

## 1. Push to GitHub
```powershell
cd C:\Users\vishal.mahendra\vishal-portfolio
git init
git add .
git commit -m "Portfolio: one-page site + live dashboard + Streamlit demo"
git branch -M main
# create an empty repo named `vishal-portfolio` on github.com first, then:
git remote add origin https://github.com/vishcooks/vishal-portfolio.git
git push -u origin main
```

---

## 2. Deploy the site → Cloudflare Pages (recommended)
1. Go to **dash.cloudflare.com** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub and pick `vishal-portfolio`.
3. Build settings (it's static — no build step):
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`  (repo root — `index.html` is at the root)
4. **Save and Deploy.** You'll get `https://vishal-portfolio.pages.dev` in ~30s.
5. Every `git push` auto-redeploys.

### Alternative: GitHub Pages (simplest)
Repo → **Settings → Pages → Source: Deploy from a branch → `main` / `/root`**.
Live at `https://vishcooks.github.io/vishal-portfolio/`.
*(Cloudflare is preferred: unlimited bandwidth, faster CDN, cleaner custom-domain setup.)*

---

## 3. Deploy the Streamlit dashboard → Streamlit Community Cloud (free)
1. Make sure `streamlit_app/` is in the pushed repo (it is).
2. Go to **share.streamlit.io** → sign in with GitHub → **Create app**.
3. Settings:
   - **Repository:** `vishcooks/vishal-portfolio`
   - **Branch:** `main`
   - **Main file path:** `streamlit_app/app.py`
4. **Deploy.** You'll get a URL like `https://vishal-gtm.streamlit.app`.

---

## 4. Embed the dashboard in the portfolio
1. Open `index.html`, find the block with `id="embed-slot"` (Section 04 — Live Dashboard).
2. Replace the placeholder `<div class="embed__placeholder">…</div>` with:
   ```html
   <iframe src="https://YOUR-APP.streamlit.app/?embed=true"
           title="GTM Pipeline & Bookings — SQL demo"
           loading="lazy"></iframe>
   ```
   Keep the `?embed=true` — it hides Streamlit's chrome for a clean embed.
3. `git add index.html && git commit -m "Embed Streamlit dashboard" && git push` → Cloudflare redeploys.

> Note: free Streamlit apps sleep after inactivity and show a "wake up" button on first load.
> The **native ECharts dashboard is always instant** — the Streamlit embed is the deeper, interactive layer.

### Optional embeds
- **Tableau Public:** publish a viz, then use the **Share → Embed Code** `<iframe>` in the same slot.
- **Evidence.dev:** if you build an Evidence site, deploy it static to Cloudflare Pages and link/embed it.

---

## 5. Custom domain (optional, ~$10/yr)
1. Buy a domain (Cloudflare Registrar / Namecheap). Good options: `vishalmahendra.dev`, `vishal.build`.
2. Cloudflare Pages → your project → **Custom domains → Set up a domain** → follow DNS steps (automatic if bought via Cloudflare).
3. HTTPS is automatic. Update the URL in `github-profile/README.md` and your résumé/LinkedIn.

---

## 6. GitHub profile README (the real portfolio for technical roles)
1. Create a **new** repo named **exactly** your username: `vishcooks`. Make it **public**, add a README.
2. Copy `github-profile/README.md` into it as `README.md`. Update the live-site URL.
3. On your profile → **Customize your pins** → pin your **6 best** repos (see the table in that README).
4. Each pinned repo needs: a README, an architecture diagram (see `projects/.../README.md` for the Mermaid pattern), a screenshot, one honest result, and a live link.

---

## Checklist
- [ ] `assets/resume.pdf` added
- [ ] Placeholders in `CONTENT.md` replaced
- [ ] Pushed to personal GitHub
- [ ] Cloudflare Pages live
- [ ] Streamlit app live + embedded (`?embed=true`)
- [ ] Custom domain (optional)
- [ ] Profile README repo + 6 pinned repos
- [ ] Same name / headline / top projects across résumé ↔ LinkedIn ↔ portfolio
