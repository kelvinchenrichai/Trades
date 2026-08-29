# No-Brain EV Lab

> **A Quantitative Strategy Research, Backtesting, Elimination & Edge Health Monitoring Platform**
> 
> *Core Philosophy: Simple > Complex · Objective > Subjective · Plateau > Peak · OOS > In-Sample · Low Drawdown > Maximum Profit*

---

## 🚀 Overview

**No-Brain EV Lab** is an institutional quantitative trading strategy research platform designed to identify, backtest, benchmark, and monitor mechanical trading strategies with positive statistical expectancy (+EV).

Unlike traditional retail indicators or subjective discretionary charts, this lab treats trading strategies as industrial production lines:
1. **100% Objective & Mechanical**: Strictly $\le 3$ entry conditions, 0 subjective discretion, 100% executable by computer code.
2. **Strict Walk-Forward Integrity**: Pure chronological partition (Train $\rightarrow$ Validation $\rightarrow$ Out-of-Sample $\rightarrow$ Live Forward) with zero lookahead bias or random shuffle.
3. **Plateau > Peak Philosophy**: Parameter stability across neighboring values takes priority over isolated curve-fit spikes (Overfit Detection).
4. **Surveillance & Edge Health**: Continuous rolling window tracking (20, 50, 100 trades) to actively demote or retire strategies undergoing alpha decay.
5. **Prop Firm Challenge Compatibility**: Built-in Monte Carlo evaluation path simulator with trailing and intraday drawdown violation modeling.

---

## 📊 Core Research Strategies (Pre-loaded)

1. **NQ-FTM-001 — NQ Fixed-Time Opening Momentum (09:35 ET)**
   - *Market:* Nasdaq-100 Futures (NQ)
   - *Hypothesis:* Institutional opening order flow imbalance creates strong 15-minute directional momentum.
   - *Rules:* Check 09:30-09:35 5m bar $\Delta\%$. If $> +0.35\%$, Buy at 09:35:00. Fixed Stop: 1.0R, Fixed Target: 1.5R. Max hold: 60 min.
   - *Metrics:* EV: `+0.18R/trade`, PF: `1.46`, Max DD: `6.5R`, Stage: `LIVE`, Edge: `HEALTHY`.

2. **GC-LNY-001 — Gold London-to-NY Session Breakout Handoff**
   - *Market:* Gold Futures (GC)
   - *Hypothesis:* London/European fixed price discovery breaks out when NY institutional cash opens.
   - *Rules:* Calculate 03:00-08:00 ET Range. Enter on clean breakout at 08:30 ET. Target: 1.8R, Stop: 1.0R.
   - *Metrics:* EV: `+0.16R/trade`, PF: `1.41`, Max DD: `7.2R`, Stage: `PAPER`, Edge: `HEALTHY`.

3. **CRYPTO-RM-001 — Crypto Top-20 Cross-Sectional Residual Momentum**
   - *Market:* Crypto Perpetual Contracts
   - *Hypothesis:* Altcoins lagging BTC daily beta catch up with persistent 24h drift.
   - *Rules:* Rebalance daily at 00:00 UTC. Long top 3 residual momentum coins, hedge with BTC perp beta.
   - *Metrics:* EV: `+0.22R/trade`, PF: `1.52`, Max DD: `9.4R`, Stage: `OOS_PASS`, Edge: `HEALTHY`.

4. **NQ-OMB-001 — NQ Overnight Mean-Reversion Bounce (Decaying Example)**
   - *Market:* NQ Futures
   - *Status:* `DECAYING` (Rolling 50 EV has collapsed from +0.30R to -0.04R).
   - *Purpose:* Serves as a reference model for Edge Degradation and automated strategy elimination.

5. **GC-T1-REV — Gold London Morning Mean Reversion**
   - *Market:* Gold Futures (GC)
   - *Status:* `RESEARCH` (Under active parameter stability verification).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18+, TypeScript, Vite, Tailwind CSS
- **Visualization**: Recharts (Custom partitioned equity curves, underwater drawdowns, rolling EV decay lines, parameter heatmaps, Monte Carlo paths)
- **Icons**: Lucide React
- **API Abstraction Layer**: `src/services/api/mockApi.ts` implements unified TypeScript interfaces for seamless swapping to Python/FastAPI backends.
- **Simulation Engines**:
  - `src/services/backtest/engine.ts`: Walk-forward backtest simulation & parameter plateau scanner.
  - `src/services/prop/propSimulator.ts`: Monte Carlo multi-path drawdown evaluator.
  - `src/services/calendar/sessionCalendar.ts`: Institutional timezone normalizer (ET, UTC, Exchange).

---

## 🏃 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (Port 3000)
npm run dev

# 3. Build production bundle
npm run build
```

---

## 📑 Strategy Audit Report Generator

Clicking **"Generate Report"** on any strategy page generates a formal, printable PDF-ready audit report with:
- Hypothesis & Objective Entry/Exit conditions
- R-Multiple performance & worst-period metrics
- Walk-forward OOS partition verification
- Multi-factor tournament ranking
- System verdict (`PASS`, `WATCH`, or `FAIL`)

---

## ⚖️ Disclaimer

**DEMO / MOCK DATA NOTICE**: This application is currently running with an in-browser statistical simulation engine for quantitative UI/UX and algorithmic research validation. Backtest and Monte Carlo outputs are mock representations designed for system architecture demonstration and are **not** real financial trading results.
