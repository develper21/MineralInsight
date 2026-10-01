# 🎨 Design System

**MineralInsight – Dark. Data-Driven. Intelligent.**

This document defines the visual design system, UI components, and user experience patterns of MineralInsight. The goal is a modern, terminal-inspired intelligence dashboard with a consistent, accessible interface. Theme inspiration: **Bloomberg Terminal × NASA Mission Control**.

---

## 1. Design Principles

| 👥 | 🌿 | 📚 |
| :---: | :---: | :---: |
| **User-Centered** | **Minimal & Clean** | **Consistent** |
| Simple and intuitive for policymakers, analysts and researchers. | Reduce clutter and let the data be the hero of every screen. | Follow a unified design system — every colour and font comes from a token. |

---

## 2. Color Palette

### 2.1 Base & Primary Colors

Primary colors used across the application (dark intelligence theme is the default):

| Swatch | Name | Hex | Usage |
| --- | --- | --- | --- |
| 🟦 | **Primary** (Electric Cyan) | `#06D0F9` | Main brand color — data highlights, active nav, buttons, glows |
| 🔷 | **Accent** | `#05A7C7` | Bright hover highlights, gradient endpoints |
| 🔲 | **Secondary** (Slate Blue) | `#1D283A` | Secondary actions, badges, surfaces |
| ⬛ | **Background** (Deep Navy) | `#080C16` | App background (gradient hero) |
| ⬜ | **Card** | `#0B111E` | Glass-card surfaces |
| ▫️ | **Border** | `#222F44` | Card and input borders |
| ⚪ | **Foreground** (Text) | `#F1F5F9` | Primary text on dark surfaces |
| 🔘 | **Muted Text** | `#7588A3` | Labels, captions, secondary text |

### 2.2 Mineral Colors

Signature colors for the three focus minerals (used in cards, charts and glows):

| Swatch | Mineral | Hex | Usage |
| --- | --- | --- | --- |
| 🟧 | **Copper (Cu)** | `#EE9D2B` | Copper cards, gradients, glow shadows |
| 🟦 | **Lithium (Li)** | `#1AB3FF` | Lithium cards, battery/EV visuals |
| ⬜ | **Graphite (C)** | `#676F7E` | Graphite cards, neutral accents |

### 2.3 Status & Signal Colors

| Swatch | Token | Hex | Usage |
| --- | --- | --- | --- |
| 🟢 | **Success / Export / Risk-Low** | `#24C26D` | Success messages, export flows, low risk |
| 🟠 | **Warning / Risk-Medium** | `#F5600A` | Caution states, medium risk |
| 🔴 | **Error / Import / Risk-High** | `#EF4343` | Error messages, import flows, high risk |

> ℹ️ Hex values are the converted forms of the HSL tokens defined in `frontend/src/index.css` (e.g. `--primary: 190 95% 50%`). Always consume colours via Tailwind tokens (`text-copper`, `bg-risk-high`, `text-primary`) — never hardcode hex in components.

### 2.4 Chart Palette

| Token | Hex | Default Use |
| --- | --- | --- |
| `--chart-1` | `#06D0F9` | Primary series (trade flow, prices) |
| `--chart-2` | `#EE9D2B` | Copper series |
| `--chart-3` | `#24C26D` | Positive series (exports) |
| `--chart-4` | `#1AB3FF` | Lithium / secondary series |
| `--chart-5` | `#8152E0` | Forecast / projection series |

---

## 3. Typography

We use **Inter** as the primary font for a clean, highly readable interface, and **Space Grotesk** as the display font for headings and big metric numbers.

| | | |
| :---: | --- | --- |
| **Aa** | **Inter** — Primary Font | Clean, modern and highly readable. Used for body text, tables and UI labels. |
| **Aa** | **Space Grotesk** — Display Font | Technical, terminal-style character. Used for headings, metric values and table headers. |

### Type Scale

| Token | Size | Usage |
| --- | --- | --- |
| `h1` | 36–48px · bold | Page titles (display font) |
| `h2` | 30px · semibold | Section titles |
| `h3` | 24px · semibold | Card titles |
| `.metric-value` | 30px · bold | Stat card numbers |
| Body | 14–16px · regular | Paragraphs, table cells |
| `.metric-label` | 12px · uppercase · tracking-wide | Labels above metrics |
| Caption | 12px · muted | Footnotes, source stamps |

---

## 4. UI Components

Standard components to be used throughout the application (all built on shadcn/ui primitives):

### 4.1 Buttons

| Variant | Style | Usage |
| --- | --- | --- |
| **Primary** | Cyan fill, dark text, glow on hover | Main actions (Login, Run Analysis) |
| **Secondary** | Slate-blue fill | Supporting actions |
| **Destructive** | Red fill | Delete / irreversible actions |
| **Ghost / Outline** | Transparent, cyan border on hover | Toolbar and table actions |

### 4.2 Cards & Surfaces

| Class | Description |
| --- | --- |
| `.glass-card` | Frosted glass surface: gradient fill, `backdrop-blur-xl`, soft border, glow pseudo-element |
| `.stat-card` | Glass card + lift-on-hover (translateY −2px, cyan glow) for KPI tiles |
| `.chart-container` | Glass card wrapper for Recharts visualisations |
| `.data-table` | Terminal-style table: uppercase Space Grotesk headers, row hover tint |
| `.glow-border` | Inset cyan outline for highlighted panels |

### 4.3 Badges & Indicators

| Element | Token | Example |
| --- | --- | --- |
| Risk High | `text-risk-high` | 🔴 Risk score ≥ 70 |
| Risk Medium | `text-risk-medium` | 🟠 Risk score 40–69 |
| Risk Low | `text-risk-low` | 🟢 Risk score < 40 |
| Import | `text-import` (red) | Import flow lines & bars |
| Export | `text-export` (green) | Export flow lines & bars |
| Live indicator | `.pulse-live` | Pulsing green dot for fresh data |

### 4.4 Motion

| Animation | Timing | Usage |
| --- | --- | --- |
| `fade-in-up` | 0.6s ease-out | Page/section entrance |
| `scale-in` | 0.4s ease-out | Dialogs & popovers |
| `glow-pulse` | 2s infinite | Hero glow effect |
| `pulse-glow` | 2s infinite | Live-data dot |
| `float` | 6s infinite | Decorative hero elements |

---

> 📌 Related docs: [PRD.md](./PRD.md) · [RULES.md](./RULES.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
