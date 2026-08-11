"""
Customer VOC & GTM Command Center
---------------------------------
A public, in-browser rebuild of the shape of the Snowflake work I do:

  bronze (raw)  ->  silver (cleaned / typed / risk-scored)  ->  gold (marts)

Runs entirely on DuckDB against seeded synthetic data — fast, free, no external
calls — and surfaces the four things revenue & product leaders ask for:

  1. Revenue & pipeline (bookings, coverage, win rate)
  2. Product adoption & Voice-of-Customer signals
  3. Accounts at churn risk (health-scored)
  4. An auto-generated "insight narrative" (the Cortex-style answer)

Built by Vishal Mahendra · github.com/vishcooks
"""

import numpy as np
import pandas as pd
import duckdb
import altair as alt
import streamlit as st

st.set_page_config(page_title="Customer VOC & GTM Command Center", layout="wide", page_icon="◆")

ACCENT = "#4f46e5"
INK = "#101322"
MUTED = "#6b7180"
RISK_COLORS = {"High": "#ef4444", "Medium": "#f59e0b", "Healthy": "#22c55e"}

st.markdown(
    f"""
    <style>
      .stApp {{ background:#ffffff; }}
      h1,h2,h3,h4 {{ font-family:'Space Grotesk',sans-serif !important; letter-spacing:-.01em; color:{INK}; }}
      [data-testid="stMetricValue"] {{ font-family:'Space Grotesk',sans-serif; color:{ACCENT}; }}
      [data-testid="stMetricLabel"] {{ color:{MUTED}; text-transform:uppercase; letter-spacing:.05em; font-size:.72rem; }}
      .insight {{ background:rgba(79,70,229,.07); border:1px solid rgba(79,70,229,.25);
                 border-left:4px solid {ACCENT}; border-radius:12px; padding:16px 18px; margin:.4rem 0 1rem; color:{INK}; }}
      .insight b {{ color:{ACCENT}; }}
      code, pre {{ font-family:'JetBrains Mono',monospace !important; }}
    </style>
    """,
    unsafe_allow_html=True,
)


# =========================================================
# BRONZE — seeded synthetic raw feeds (deterministic)
# =========================================================
@st.cache_data
def gen_opportunities(n: int = 4000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    segs = ["Enterprise", "Commercial", "SMB"]
    seg = rng.choice(segs, n, p=[0.28, 0.42, 0.30])
    base = {"Enterprise": 145000, "Commercial": 48000, "SMB": 12000}
    amount = np.clip(np.array([rng.normal(base[s], base[s] * 0.35) for s in seg]).round(-2), 1500, None)
    stages = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]
    stage = rng.choice(stages, n, p=[0.16, 0.18, 0.18, 0.12, 0.20, 0.16])
    quarters = pd.period_range("2024Q1", "2025Q4", freq="Q").astype(str)
    return pd.DataFrame({
        "opp_id": [f"OPP-{i:05d}" for i in range(n)],
        "segment": seg,
        "region": rng.choice(["AMER", "EMEA", "APAC"], n),
        "stage": stage,
        "amount": amount,
        "created_qtr": rng.choice(quarters, n),
        "source_raw": rng.choice([" inbound", "OUTBOUND ", "Partner", "partner ", " EVENT"], n),
    })


@st.cache_data
def gen_accounts(n: int = 200, seed: int = 7) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    segs = rng.choice(["Enterprise", "Commercial", "SMB"], n, p=[0.30, 0.40, 0.30])
    base_arr = {"Enterprise": 185000, "Commercial": 54000, "SMB": 14000}
    arr = np.clip(np.array([rng.normal(base_arr[s], base_arr[s] * 0.40) for s in segs]).round(-2), 3000, None)
    adoption = np.clip(rng.normal(62, 22, n), 3, 99).round(0)
    health = np.clip(adoption * 0.6 + rng.normal(30, 14, n), 2, 99).round(0)
    last_activity = np.clip(rng.exponential(9, n).round(0), 0, 90).astype(int)
    themes = rng.choice(
        ["Onboarding", "Performance", "Pricing", "Support", "Feature gaps", "Reliability"],
        n, p=[0.20, 0.18, 0.16, 0.16, 0.16, 0.14],
    )
    sentiment = np.clip(rng.normal(health / 100.0, 0.16, n), 0.02, 0.99).round(2)
    return pd.DataFrame({
        "account": [f"Acct-{i:03d}" for i in range(n)],
        "segment": segs,
        "region": rng.choice(["AMER", "EMEA", "APAC"], n),
        "arr": arr,
        "adoption_pct": adoption,
        "health_score": health,
        "last_activity_days": last_activity,
        "voc_theme": themes,
        "sentiment": sentiment,
    })


OPPS = gen_opportunities()
ACCTS = gen_accounts()

con = duckdb.connect(":memory:")
con.register("bronze_opportunities", OPPS)
con.register("bronze_accounts", ACCTS)

SILVER_OPPS_SQL = """
-- SILVER: clean, standardize and type the raw opportunity feed
CREATE OR REPLACE TABLE silver_opportunities AS
SELECT
    opp_id, segment, region, stage,
    CAST(amount AS DOUBLE)                              AS amount_usd,
    created_qtr,
    upper(substr(trim(source_raw), 1, 1))
      || lower(substr(trim(source_raw), 2))             AS lead_source,
    stage = 'Closed Won'                                AS is_won,
    stage IN ('Closed Won','Closed Lost')               AS is_closed,
    stage NOT IN ('Closed Won','Closed Lost')           AS is_open
FROM bronze_opportunities;
"""

SILVER_ACCTS_SQL = """
-- SILVER: type accounts and derive a churn-risk tier from health
CREATE OR REPLACE TABLE silver_accounts AS
SELECT
    account, segment, region,
    CAST(arr AS DOUBLE) AS arr_usd,
    adoption_pct, health_score, last_activity_days, voc_theme, sentiment,
    CASE WHEN health_score < 40 THEN 'High'
         WHEN health_score < 65 THEN 'Medium'
         ELSE 'Healthy' END AS risk_tier
FROM bronze_accounts;
"""

GOLD_VOC_SQL = """
-- GOLD: Voice-of-Customer theme mart (volume + sentiment + $ exposure)
SELECT voc_theme AS theme,
       COUNT(*)                       AS accounts,
       ROUND(AVG(sentiment), 2)       AS avg_sentiment,
       SUM(arr_usd)                   AS arr_usd
FROM silver_accounts
GROUP BY 1 ORDER BY accounts DESC;
"""

con.execute(SILVER_OPPS_SQL)
con.execute(SILVER_ACCTS_SQL)


# =========================================================
# UI
# =========================================================
st.title("Customer VOC & GTM Command Center")
st.caption("Analytics-engineering demo · DuckDB medallion model (bronze → silver → gold) · synthetic data · by Vishal Mahendra")

with st.sidebar:
    st.header("Filters")
    seg_sel = st.multiselect("Segment", ["Enterprise", "Commercial", "SMB"], default=["Enterprise", "Commercial", "SMB"])
    reg_sel = st.multiselect("Region", ["AMER", "EMEA", "APAC"], default=["AMER", "EMEA", "APAC"])
    st.markdown("---")
    st.markdown("**Model layers**")
    st.code("bronze → silver → gold", language="text")
    st.caption("Two raw feeds (opportunities, accounts) cleaned in SILVER and served as GOLD marts. SQL in the last tab.")

seg = seg_sel or ["Enterprise", "Commercial", "SMB"]
reg = reg_sel or ["AMER", "EMEA", "APAC"]
seg_in = ",".join("'" + s + "'" for s in seg)
reg_in = ",".join("'" + r + "'" for r in reg)
where = f"WHERE segment IN ({seg_in}) AND region IN ({reg_in})"

# ---- KPI aggregates ----
rev = con.execute(f"""
    SELECT
      SUM(CASE WHEN is_won  THEN amount_usd END) AS bookings,
      SUM(CASE WHEN is_open THEN amount_usd END) AS pipeline,
      ROUND(100.0*COUNT(*) FILTER (WHERE is_won)
            /NULLIF(COUNT(*) FILTER (WHERE is_closed),0),1) AS win_rate
    FROM silver_opportunities {where}
""").fetchone()

acc = con.execute(f"""
    SELECT
      SUM(arr_usd) AS total_arr,
      SUM(CASE WHEN risk_tier='High' THEN arr_usd END) AS at_risk_arr,
      COUNT(*) FILTER (WHERE risk_tier='High') AS at_risk_accounts,
      ROUND(AVG(adoption_pct),0) AS avg_adoption
    FROM silver_accounts {where}
""").fetchone()

total_arr = acc[0] or 0
at_risk_arr = acc[1] or 0
at_risk_n = acc[2] or 0
risk_pct = round(100.0 * at_risk_arr / total_arr, 1) if total_arr else 0

# ---- AI insight narrative (the Cortex-style answer) ----
worst = con.execute(f"""
    SELECT segment, SUM(arr_usd) s FROM silver_accounts {where} AND risk_tier='High'
    GROUP BY 1 ORDER BY s DESC LIMIT 1
""").fetchone()
theme = con.execute(f"""
    SELECT voc_theme, COUNT(*) c FROM silver_accounts {where} AND risk_tier='High'
    GROUP BY 1 ORDER BY c DESC LIMIT 1
""").fetchone()
worst_seg = worst[0] if worst else "—"
top_theme = theme[0] if theme else "—"
st.markdown(
    f"""<div class="insight">⚡ <b>Insight:</b> {at_risk_n} accounts — <b>${at_risk_arr/1e6:,.1f}M ({risk_pct}% of ARR)</b> —
    are flagged <b>high churn-risk</b>, concentrated in <b>{worst_seg}</b> and most associated with the
    Voice-of-Customer theme <b>“{top_theme}”</b>. Recommend prioritizing the highest-ARR at-risk accounts in the
    <i>Accounts at Risk</i> tab.</div>""",
    unsafe_allow_html=True,
)

c1, c2, c3, c4 = st.columns(4)
c1.metric("Bookings (won)", f"${(rev[0] or 0)/1e6:,.1f}M")
c2.metric("Open pipeline", f"${(rev[1] or 0)/1e6:,.1f}M")
c3.metric("Win rate", f"{rev[2] or 0:.1f}%")
c4.metric("ARR at risk", f"${at_risk_arr/1e6:,.1f}M", f"-{risk_pct}%")

tab_rev, tab_voc, tab_risk, tab_sql = st.tabs(
    ["Revenue & Pipeline", "Adoption & VOC", "Accounts at Risk", "Model & SQL"]
)

with tab_rev:
    left, right = st.columns(2)
    with left:
        st.subheader("Bookings by quarter")
        bq = con.execute(f"""
            SELECT created_qtr AS quarter, SUM(CASE WHEN is_won THEN amount_usd END)/1e6 AS bookings_m
            FROM silver_opportunities {where} GROUP BY 1 ORDER BY 1
        """).df()
        st.altair_chart(
            alt.Chart(bq).mark_bar(color=ACCENT, cornerRadiusTopLeft=3, cornerRadiusTopRight=3).encode(
                x=alt.X("quarter:N", title=None, axis=alt.Axis(labelColor=MUTED)),
                y=alt.Y("bookings_m:Q", title="USD (M)", axis=alt.Axis(labelColor=MUTED)),
                tooltip=["quarter", alt.Tooltip("bookings_m:Q", format=".2f", title="Bookings (M)")],
            ).properties(height=300), use_container_width=True)
    with right:
        st.subheader("Open pipeline by stage")
        fn = con.execute(f"""
            SELECT stage, SUM(amount_usd) AS pipeline_usd, COUNT(*) AS deals
            FROM silver_opportunities {where} AND is_open GROUP BY 1 ORDER BY pipeline_usd DESC
        """).df()
        st.altair_chart(
            alt.Chart(fn).mark_bar(color=ACCENT).encode(
                y=alt.Y("stage:N", sort="-x", title=None, axis=alt.Axis(labelColor=MUTED)),
                x=alt.X("pipeline_usd:Q", title="Pipeline (USD)", axis=alt.Axis(labelColor=MUTED)),
                tooltip=["stage", alt.Tooltip("pipeline_usd:Q", format="$,.0f"), "deals"],
            ).properties(height=300), use_container_width=True)

with tab_voc:
    left, right = st.columns([1.3, 1])
    with left:
        st.subheader("Adoption vs. account health")
        sc = con.execute(f"SELECT * FROM silver_accounts {where}").df()
        st.altair_chart(
            alt.Chart(sc).mark_circle(opacity=0.75).encode(
                x=alt.X("adoption_pct:Q", title="Feature adoption (%)", axis=alt.Axis(labelColor=MUTED)),
                y=alt.Y("health_score:Q", title="Health score", axis=alt.Axis(labelColor=MUTED)),
                size=alt.Size("arr:Q", title="ARR", legend=None, scale=alt.Scale(range=[30, 900])),
                color=alt.Color("risk_tier:N", title="Risk",
                                scale=alt.Scale(domain=list(RISK_COLORS), range=list(RISK_COLORS.values()))),
                tooltip=["account", "segment", alt.Tooltip("arr:Q", format="$,.0f"),
                         "adoption_pct", "health_score", "voc_theme"],
            ).properties(height=340), use_container_width=True)
    with right:
        st.subheader("Voice-of-Customer themes")
        voc = con.execute(f"""
            SELECT voc_theme AS theme, COUNT(*) AS accounts,
                   ROUND(AVG(sentiment), 2) AS avg_sentiment, SUM(arr_usd) AS arr_usd
            FROM silver_accounts {where}
            GROUP BY 1 ORDER BY accounts DESC
        """).df()
        st.altair_chart(
            alt.Chart(voc).mark_bar().encode(
                y=alt.Y("theme:N", sort="-x", title=None, axis=alt.Axis(labelColor=MUTED)),
                x=alt.X("accounts:Q", title="Accounts", axis=alt.Axis(labelColor=MUTED)),
                color=alt.Color("avg_sentiment:Q", title="Sentiment",
                                scale=alt.Scale(scheme="redyellowgreen", domain=[0, 1])),
                tooltip=["theme", "accounts", "avg_sentiment", alt.Tooltip("arr_usd:Q", format="$,.0f")],
            ).properties(height=340), use_container_width=True)

with tab_risk:
    st.subheader("Top accounts at churn risk — by ARR exposure")
    risk = con.execute(f"""
        SELECT account, segment, region,
               arr_usd AS arr, adoption_pct, health_score,
               last_activity_days, voc_theme, risk_tier
        FROM silver_accounts {where} AND risk_tier IN ('High','Medium')
        ORDER BY (risk_tier='High') DESC, arr_usd DESC
        LIMIT 25
    """).df()
    st.dataframe(
        risk,
        use_container_width=True, hide_index=True,
        column_config={
            "arr": st.column_config.NumberColumn("ARR", format="$%d"),
            "adoption_pct": st.column_config.ProgressColumn("Adoption %", min_value=0, max_value=100, format="%d"),
            "health_score": st.column_config.ProgressColumn("Health", min_value=0, max_value=100, format="%d"),
            "last_activity_days": "Days since activity",
            "voc_theme": "Top VOC theme",
            "risk_tier": "Risk",
        },
    )
    st.caption("Sorted High-risk first, then by ARR — the queue a CS/revenue team would work top-down.")

with tab_sql:
    st.subheader("The medallion transformations behind this app")
    st.markdown("**Silver** — opportunities (clean, type, `initcap`-free title-casing)")
    st.code(SILVER_OPPS_SQL, language="sql")
    st.markdown("**Silver** — accounts (derive churn-risk tier from health)")
    st.code(SILVER_ACCTS_SQL, language="sql")
    st.markdown("**Gold** — Voice-of-Customer theme mart")
    st.code(GOLD_VOC_SQL, language="sql")
    st.markdown("**Bronze sample** — raw accounts feed")
    st.dataframe(ACCTS.head(8), use_container_width=True, hide_index=True)
