"""
GTM Pipeline & Bookings — SQL / Analytics-Engineering demo
----------------------------------------------------------
Showcases the analytics-engineering workflow end to end, in-browser:

  bronze (raw)  ->  silver (cleaned/typed)  ->  gold (business marts)

Everything runs on DuckDB against a self-contained, seeded synthetic dataset,
so the app is fast, free, and never depends on an external API. The SQL for
each layer is shown in the app to make the modeling skill visible.

Deploy free on Streamlit Community Cloud (see ../DEPLOY.md), then embed in the
portfolio via  https://<app>.streamlit.app/?embed=true
"""

import numpy as np
import pandas as pd
import duckdb
import altair as alt
import streamlit as st

st.set_page_config(page_title="GTM Pipeline & Bookings — SQL demo", layout="wide", page_icon="◆")

ACCENT = "#6ee7a8"
INK = "#ededea"
MUTED = "#8a8a86"

# ---- minimal dark styling to match the portfolio ----
st.markdown(
    f"""
    <style>
      .stApp {{ background:#0a0a0b; color:{INK}; }}
      section[data-testid="stSidebar"] {{ background:#101012; }}
      h1,h2,h3,h4 {{ font-family:'Space Grotesk',sans-serif; letter-spacing:-.01em; }}
      code, pre {{ font-family:'JetBrains Mono',monospace !important; }}
      [data-testid="stMetricValue"] {{ font-family:'Space Grotesk',sans-serif; color:{ACCENT}; }}
      [data-testid="stMetricLabel"] {{ color:{MUTED}; text-transform:uppercase; letter-spacing:.06em; font-size:.72rem; }}
      hr {{ border-color:rgba(255,255,255,.08); }}
    </style>
    """,
    unsafe_allow_html=True,
)


# =========================================================
# BRONZE — seeded synthetic raw opportunities (deterministic)
# =========================================================
@st.cache_data
def generate_raw(n: int = 4000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    segments = ["Enterprise", "Commercial", "SMB"]
    regions = ["AMER", "EMEA", "APAC"]
    stages = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]
    quarters = pd.period_range("2024Q1", "2025Q4", freq="Q").astype(str)

    seg = rng.choice(segments, n, p=[0.28, 0.42, 0.30])
    base = {"Enterprise": 145000, "Commercial": 48000, "SMB": 12000}
    amount = np.array([rng.normal(base[s], base[s] * 0.35) for s in seg]).round(-2)
    amount = np.clip(amount, 1500, None)
    stage = rng.choice(stages, n, p=[0.16, 0.18, 0.18, 0.12, 0.20, 0.16])

    return pd.DataFrame(
        {
            "opp_id": [f"OPP-{i:05d}" for i in range(n)],
            "segment": seg,
            "region": rng.choice(regions, n),
            "stage": stage,
            "amount": amount,
            "created_qtr": rng.choice(quarters, n),
            # deliberately messy: mixed case + whitespace to clean in silver
            "source_raw": rng.choice([" inbound", "OUTBOUND ", "Partner", "partner ", " EVENT"], n),
        }
    )


RAW = generate_raw()

# One DuckDB connection; register the raw frame as the bronze table.
con = duckdb.connect(database=":memory:")
con.register("bronze_opportunities", RAW)

SILVER_SQL = """
-- SILVER: clean, standardize and type the raw feed
CREATE OR REPLACE TABLE silver_opportunities AS
SELECT
    opp_id,
    segment,
    region,
    stage,
    CAST(amount AS DOUBLE)                              AS amount_usd,
    created_qtr,
    upper(substr(trim(source_raw), 1, 1))
      || lower(substr(trim(source_raw), 2))             AS lead_source,
    stage IN ('Closed Won')                             AS is_won,
    stage IN ('Closed Won','Closed Lost')               AS is_closed,
    stage NOT IN ('Closed Won','Closed Lost')           AS is_open
FROM bronze_opportunities;
"""

GOLD_BOOKINGS_SQL = """
-- GOLD: bookings & win-rate mart by quarter x segment
CREATE OR REPLACE TABLE gold_bookings AS
SELECT
    created_qtr                                             AS quarter,
    segment,
    SUM(CASE WHEN is_won  THEN amount_usd END)              AS bookings_usd,
    SUM(CASE WHEN is_open THEN amount_usd END)              AS open_pipeline_usd,
    COUNT(*) FILTER (WHERE is_won)                          AS won_deals,
    COUNT(*) FILTER (WHERE is_closed)                       AS closed_deals,
    ROUND(100.0 * COUNT(*) FILTER (WHERE is_won)
          / NULLIF(COUNT(*) FILTER (WHERE is_closed),0), 1) AS win_rate_pct
FROM silver_opportunities
GROUP BY 1, 2
ORDER BY 1, 2;
"""

GOLD_FUNNEL_SQL = """
-- GOLD: open-pipeline funnel by stage
SELECT stage,
       SUM(amount_usd) AS pipeline_usd,
       COUNT(*)        AS deals
FROM silver_opportunities
WHERE is_open
GROUP BY stage
ORDER BY pipeline_usd DESC;
"""

con.execute(SILVER_SQL)
con.execute(GOLD_BOOKINGS_SQL)


# =========================================================
# UI
# =========================================================
st.title("GTM Pipeline & Bookings")
st.caption(
    "Analytics-engineering demo · DuckDB medallion model (bronze → silver → gold) · "
    "synthetic data. Built by Vishal Mahendra."
)

with st.sidebar:
    st.header("Filters")
    seg_sel = st.multiselect("Segment", sorted(RAW["segment"].unique()), default=sorted(RAW["segment"].unique()))
    reg_sel = st.multiselect("Region", sorted(RAW["region"].unique()), default=sorted(RAW["region"].unique()))
    st.markdown("---")
    st.markdown("**Model layers**")
    st.code("bronze → silver → gold", language="text")
    st.caption("SQL for each layer is shown under *Model & SQL* below.")

seg_list = seg_sel or sorted(RAW["segment"].unique())
reg_list = reg_sel or sorted(RAW["region"].unique())

filt = f"""
WITH f AS (
  SELECT * FROM silver_opportunities
  WHERE segment IN ({",".join("'"+s+"'" for s in seg_list)})
    AND region  IN ({",".join("'"+r+"'" for r in reg_list)})
)
"""

kpis = con.execute(
    filt + """
    SELECT
      SUM(CASE WHEN is_won  THEN amount_usd END) AS bookings,
      SUM(CASE WHEN is_open THEN amount_usd END) AS pipeline,
      ROUND(100.0*COUNT(*) FILTER (WHERE is_won)
            /NULLIF(COUNT(*) FILTER (WHERE is_closed),0),1) AS win_rate,
      COUNT(*) FILTER (WHERE is_won) AS won
    FROM f
    """
).fetchone()

c1, c2, c3, c4 = st.columns(4)
c1.metric("Bookings (won)", f"${kpis[0]/1e6:,.1f}M")
c2.metric("Open pipeline", f"${kpis[1]/1e6:,.1f}M")
c3.metric("Win rate", f"{kpis[2]:.1f}%")
c4.metric("Won deals", f"{kpis[3]:,}")

st.markdown("---")

left, right = st.columns(2)

with left:
    st.subheader("Bookings by quarter")
    bookings_q = con.execute(
        filt + """
        SELECT created_qtr AS quarter,
               SUM(CASE WHEN is_won THEN amount_usd END)/1e6 AS bookings_m
        FROM f GROUP BY 1 ORDER BY 1
        """
    ).df()
    chart = (
        alt.Chart(bookings_q)
        .mark_bar(color=ACCENT, cornerRadiusTopLeft=3, cornerRadiusTopRight=3)
        .encode(
            x=alt.X("quarter:N", title=None, axis=alt.Axis(labelColor=MUTED)),
            y=alt.Y("bookings_m:Q", title="USD (M)", axis=alt.Axis(labelColor=MUTED, gridColor="rgba(255,255,255,.06)")),
            tooltip=["quarter", alt.Tooltip("bookings_m:Q", format=".2f", title="Bookings (M)")],
        )
        .properties(height=300, background="#0a0a0b")
    )
    st.altair_chart(chart, use_container_width=True)

with right:
    st.subheader("Open pipeline by stage")
    funnel = con.execute(filt + GOLD_FUNNEL_SQL.replace("silver_opportunities", "f")).df()
    fchart = (
        alt.Chart(funnel)
        .mark_bar(color=ACCENT)
        .encode(
            y=alt.Y("stage:N", sort="-x", title=None, axis=alt.Axis(labelColor=MUTED)),
            x=alt.X("pipeline_usd:Q", title="Pipeline (USD)", axis=alt.Axis(labelColor=MUTED, gridColor="rgba(255,255,255,.06)")),
            tooltip=["stage", alt.Tooltip("pipeline_usd:Q", format="$,.0f"), "deals"],
        )
        .properties(height=300, background="#0a0a0b")
    )
    st.altair_chart(fchart, use_container_width=True)

st.subheader("Win rate by segment × quarter")
gold = con.execute("SELECT * FROM gold_bookings WHERE segment IN ({})".format(
    ",".join("'"+s+"'" for s in seg_list))).df()
heat = (
    alt.Chart(gold)
    .mark_rect()
    .encode(
        x=alt.X("quarter:N", title=None, axis=alt.Axis(labelColor=MUTED)),
        y=alt.Y("segment:N", title=None, axis=alt.Axis(labelColor=MUTED)),
        color=alt.Color("win_rate_pct:Q", scale=alt.Scale(scheme="greens"), title="Win %"),
        tooltip=["quarter", "segment", "win_rate_pct", alt.Tooltip("bookings_usd:Q", format="$,.0f")],
    )
    .properties(height=200, background="#0a0a0b")
)
st.altair_chart(heat, use_container_width=True)

with st.expander("Model & SQL — the medallion transformations behind this dashboard"):
    st.markdown("**Silver** — clean & type the raw feed")
    st.code(SILVER_SQL, language="sql")
    st.markdown("**Gold** — bookings & win-rate mart")
    st.code(GOLD_BOOKINGS_SQL, language="sql")
    st.markdown("**Gold** — open-pipeline funnel")
    st.code(GOLD_FUNNEL_SQL, language="sql")
    st.markdown("**Bronze sample** (raw, pre-clean)")
    st.dataframe(RAW.head(8), use_container_width=True)
