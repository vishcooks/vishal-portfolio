export const SITE = {
  name: "Vishal Mahendra",
  role: "Analytics Engineer · GenAI",
  email: "vishal.mahendra001@gmail.com",
  linkedin: "https://www.linkedin.com/in/vishal-mahendra",
  github: "https://github.com/vishcooks",
  description:
    "Analytics Engineer building dbt + Snowflake models and GenAI-powered BI — the single source of truth for $300M+ ARR planning, forecasting and product analytics.",
};

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects/", label: "Work" },
  { href: "/about/", label: "About" },
  { href: "/resume/", label: "Résumé" },
];

export interface Dashboard {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  problem: string;
  build: string[];
  impact: { value: string; label: string }[];
  stack: string[];
  pages: string[];
}

export const DASHBOARDS: Dashboard[] = [
  {
    slug: "platform-revenue",
    title: "Platform Pipeline, Bookings & Churn",
    kicker: "Revenue analytics · AI product adoption",
    summary:
      "One governed BI model that tells sales, finance and product leadership where platform revenue is coming from — booked, in-flight, and AI-driven.",
    problem:
      "Pipeline, bookings and AI-add-on performance lived in separate CRM exports and spreadsheets, so every exec review started with a reconciliation exercise instead of a decision.",
    build: [
      "Star-schema semantic model over CRM opportunity + product-valuation lines with a shared Teams / BU key.",
      "Single Net ARR, OTF and TCV measure set reused across pipeline and bookings so the numbers tie out everywhere.",
      "AI vs non-AI product classification with a contribution % measure to track GenAI traction month over month.",
      "Partner-revenue trend, industry mix and top-customer probability views for the exec summary.",
    ],
    impact: [
      { value: "3", label: "report pages" },
      { value: "1", label: "measure layer for ARR / OTF / TCV" },
      { value: "10", label: "cross-filtering slicers" },
    ],
    stack: ["Power BI", "DAX", "Power Query (M)", "Snowflake", "Salesforce", "Star schema"],
    pages: ["Executive Summary", "Consolidated Report", "AI Products"],
  },
  {
    slug: "services-bookings",
    title: "Services Bookings & Pipeline",
    kicker: "Services GTM · Forecasting · Attach rate",
    summary:
      "The services org's operating dashboard: weighted forecast, attach rate, prepaid draw-down and the analytics line — ten pages on one semantic model.",
    problem:
      "Services leadership couldn't answer simple questions — what will we book this quarter, how often do product deals attach services, how much prepaid delivery is left — without days of manual work.",
    build: [
      "Weighted bookings forecast (Closed 100% · Commit 90% · Best Case 55%) by asset and product type.",
      "Service attach-rate engine in both unit and bookings-$ flavours, with a field-parameter style Net ARR / OTF / ARR+OTF selector.",
      "Prepaid package & work-order draw-down tracking with year-over-year consumption splits from quote lines.",
      "Product → services mapping hierarchy so every SKU rolls up to the right asset type and channel.",
    ],
    impact: [
      { value: "10", label: "report pages" },
      { value: "4 yrs", label: "of attach-rate trend" },
      { value: "1", label: "weighted forecast number for leadership" },
    ],
    stack: ["Power BI", "DAX", "Field parameters", "Snowflake", "Salesforce CPQ", "Semantic layer"],
    pages: [
      "Executive Summary",
      "Consolidated Report",
      "Opportunity Details",
      "Weighted Forecast",
      "Prepaid Services & Work Orders",
      "YoY Prepaid Breakup",
      "Service Attach Rate · Unit",
      "Service Attach Rate · Bookings $",
      "Analytics Suite",
      "Product Services Mapping",
    ],
  },
];

export const CASE_STUDIES = [
  {
    cat: "GenAI · Product",
    title: "Customer VOC & Product Adoption",
    body: "GenAI-powered Streamlit apps on Snowflake using Cortex Analyst over a Bronze/Silver/Gold model — real-time account health, adoption and churn-risk for revenue & product leadership.",
    tags: ["Snowflake Cortex", "Streamlit", "Medallion", "Gainsight"],
    metrics: [["40%", "faster exec cycles"], ["Real-time", "account health"]],
  },
  {
    cat: "Analytics Engineering",
    title: "GTM Single Source of Truth",
    body: "dbt staging & mart models on Snowflake powering Pipeline & Bookings, Predictive Churn and Forecasting — adopted by the CFO as the source of truth for $300M+ ARR planning.",
    tags: ["dbt", "Snowflake", "Semantic layer", "Salesforce"],
    metrics: [["$300M+", "ARR powered"], ["75%", "less manual prep"]],
  },
  {
    cat: "GenAI · Churn",
    title: "ChurnGuard — LLM churn-risk scoring",
    body: "Batch inference on AWS Bedrock over cleaned support-case and billing signals to score at-risk accounts and generate plain-English risk explanations for CSMs.",
    tags: ["AWS Bedrock", "Python", "SQL", "Prompt design"],
    metrics: [["Batch", "LLM inference"], ["Explainable", "risk drivers"]],
  },
  {
    cat: "Data Engineering",
    title: "PySpark + Delta Lake ELT",
    body: "ELT pipeline that migrated 15M+ historical records with automated schema evolution, backed by a Python reconciliation suite doing cell-level validation.",
    tags: ["PySpark", "Delta Lake", "Python", "Data quality"],
    metrics: [["15M+", "records migrated"], ["100%", "data accuracy"]],
  },
  {
    cat: "Data Engineering",
    title: "Microsoft Fabric Dataflow Gen2",
    body: "Replaced rigid monthly data models with daily Fabric Dataflow Gen2 jobs, consolidating three legacy pipelines and improving freshness downstream.",
    tags: ["Microsoft Fabric", "Dataflow Gen2", "ELT"],
    metrics: [["3→1", "pipelines"], ["30%", "less delivery lag"]],
  },
  {
    cat: "AI-Augmented Delivery",
    title: "MCP-connected, agent-assisted delivery",
    body: "Power BI semantic-model and dbt/Snowflake changes shipped through MCP-connected AI-agent workflows under governance guardrails — faster, without lowering review standards.",
    tags: ["MCP", "Claude Code", "Devin", "Atlassian Rovo"],
    metrics: [["Governed", "guardrails held"], ["Faster", "delivery cycles"]],
  },
] as const;

export const SKILLS: Record<string, string[]> = {
  "Transformation & Modeling": ["dbt", "SQL", "Snowflake", "Medallion", "Star schema", "Semantic layers"],
  "ELT & Pipelines": ["PySpark", "Delta Lake", "Python", "AWS S3 / Glue / Athena", "Microsoft Fabric", "Airflow"],
  "AI / ML & GenAI": ["Snowflake Cortex", "AWS Bedrock", "SageMaker", "scikit-learn", "spaCy / NLP", "Streamlit"],
  "BI & Visualization": ["Power BI (DAX, M)", "Tableau", "QuickSight", "Gainsight", "Salesforce CRM"],
  "AI-Augmented Delivery": ["MCP", "Claude Code", "Devin", "Atlassian Rovo", "GitHub Copilot"],
  "Engineering Practice": ["Git", "CI/CD", "Jira", "Agile", "Documentation-first"],
};

export const EXPERIENCE = [
  {
    org: "Enterprise SaaS company",
    role: "Analytics Engineer",
    when: "Jan 2025 — Present",
    where: "Bengaluru",
    points: [
      "dbt staging & mart models on Snowflake for Pipeline & Bookings, Predictive Churn and Forecasting — the CFO's single source of truth for $300M+ ARR planning; manual report prep down 75%.",
      "GenAI Predictive Churn & Product Adoption apps in Streamlit on Snowflake (Cortex Analyst, Bronze/Silver/Gold) — exec analysis cycles down 40%.",
      "PySpark + Delta Lake ELT migrating 15M+ records with schema evolution and cell-level reconciliation for 100% accuracy.",
      "Star-schema Power BI models for Win/Loss, Attach Rate/Whitespace and Partner — analyst turnaround down 40% across 3 teams.",
    ],
  },
  {
    org: "Enterprise SaaS company",
    role: "Associate Agile Analyst",
    when: "Nov 2023 — Dec 2024",
    where: "Bengaluru",
    points: [
      "GenAI/NLP root-cause classifier on AWS Bedrock & SageMaker auto-flagging Jira issues — tech-debt resolution 25% faster.",
      "Jira health and DORA metrics dashboards that lifted on-time delivery by 30%.",
    ],
  },
  {
    org: "Enterprise SaaS company",
    role: "Trainee Analyst",
    when: "Nov 2022 — Oct 2023",
    where: "Bengaluru",
    points: ["Owned 25+ production BI dashboards and automated their back-end pipelines — manual refresh overhead down 90%."],
  },
  {
    org: "Ed-tech company",
    role: "Academic & Operations Specialist",
    when: "Nov 2021 — Oct 2022",
    where: "Bengaluru",
    points: ["Scheduling dashboards tracking 500+ weekly sessions — conflicts down 35%."],
  },
];

export const CERTS = [
  ["Snowflake SnowPro Core", "2026"],
  ["Snowflake Platform Certification", "2026"],
  ["Microsoft Power BI Data Analyst Associate (PL-300)", "2025"],
  ["Foundations of BI & Agile Project Management — Google", "2023"],
];

export const EDUCATION = [
  ["AI/ML Certificate Program — UC Berkeley Executive Education", "In progress · 2027"],
  ["B.Tech, Aerospace Engineering — SRM Institute of Science & Technology", "2021"],
];
