# Product Requirements Document (PRD)

**MineralInsight – India's Critical Mineral Intelligence Platform**

---

| Field | Detail |
| --- | --- |
| **Version:** | 1.0 |
| **Date:** | Oct 1, 2026 |
| **Author:** | Team MineralInsight |
| **Status:** | MVP — Production Verification |
| **Target Launch:** | MVP (v1.0) |

---

## 1. Product Overview

MineralInsight is a web application designed to help policymakers, industry stakeholders, and researchers monitor and analyse India's critical minerals ecosystem. It brings **EXIM trade data, price forecasting, supply-chain risk scores, and state-wise mineral mapping** — all in one intelligence dashboard, powered by a live REST API and a managed Postgres database.

---

## 2. Problem Statement

India is heavily import-dependent for critical minerals like lithium, copper, and graphite — inputs that power EVs, batteries, electronics, and renewable energy. The underlying data is scattered across DGCI&S, the Ministry of Commerce, and multiple ministry portals, with no unified, real-time view of **what India imports, from where, at what risk, and at what price trend**. Policymakers and industry need a single, easy-to-use intelligence platform to make data-driven supply-chain decisions.

---

## 3. Goals

- Provide a single, intuitive platform for India's critical mineral trade intelligence.
- Deliver real-time EXIM, price, production, and risk insights via a live API.
- Offer AI-assisted risk assessment and price forecasting for focus minerals.
- Visualise state-wise mineral distribution on an interactive India map.
- Ensure data transparency with verifiable, well-sourced datasets.
- Offer a clean, modern, distraction-free dashboard experience.

---

## 4. Target Users

- **Policymakers** – Ministry of Mines, NITI Aayog, Ministry of Commerce analysts
- **Industry stakeholders** – Battery, electronics, and EV supply-chain teams
- **Researchers & analysts** – Think-tanks, TEXMiN Foundation, IIT (ISM) Dhanbad
- **Data teams** – Need exportable, verifiable trade datasets
- **Tech-savvy users** – Desktop-first, but responsive on laptops and tablets

---

## 5. Core Features (MVP)

1. **Authentication** (Signup / Login / JWT-protected routes)
2. **Intelligence Dashboard** (stat cards, focus minerals, trade flow, risk gauges, top partners, India map)
3. **EXIM Analysis** (imports/exports by mineral, country, and financial year)
4. **Price Forecasting** (historical trends + forecast projections per mineral)
5. **Risk Index** (AI-powered risk scores: high / medium / low per mineral)
6. **State Mineral Map** (state-wise production & mineral distribution)
7. **Data Transparency** (sources, methodology, last-updated stamps)

---

## 6. Out of Scope (Post-MVP)

- Live upstream data ingestion pipelines (DGCI&S API sync jobs)
- Scenario planning & ANOVA statistical workspaces (UI exists; live-data wiring pending)
- Multi-language support and mobile applications
- User-generated reports and PDF export

---

> 📌 Related docs: [ARCHITECTURE.md](./ARCHITECTURE.md) · [TASKS.md](./TASKS.md) · [MEMORY.md](./MEMORY.md)
