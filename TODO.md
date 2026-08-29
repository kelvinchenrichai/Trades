# No-Brain EV Lab — Development Roadmap & TODO

## ✅ Phase 1: MVP Core UI/UX & Quantitative Framework (Completed)

- [x] Standardize Unified `Strategy` & `Backtest` schema (`src/types/index.ts`)
- [x] Implement 5 reference strategies (NQ Fixed Time, Gold London-NY, Crypto Momentum, Decaying Overnight Bounce, Gold Reversion)
- [x] Implement `QuantApiService` abstraction layer (`src/services/api/mockApi.ts`)
- [x] Implement Walk-Forward simulation engine (`src/services/backtest/engine.ts`)
- [x] Implement Monte Carlo Prop Firm Simulator (`src/services/prop/propSimulator.ts`)
- [x] Implement Session & Timezone Normalizer (`src/services/calendar/sessionCalendar.ts`)
- [x] Build Institutional Recharts Visualizers:
  - [x] Partitioned Equity Curve (`Train`, `Val`, `OOS`, `Forward`)
  - [x] Underwater Drawdown Chart
  - [x] Multi-Window Rolling Edge Trajectory (20, 50, 100 Trades)
  - [x] Edge Decay Comparative Health Chart
  - [x] Parameter Stability Plateau Heatmap (Plateau > Peak)
  - [x] Prop Evaluation Monte Carlo Path Visualizer
- [x] Build All 9 Navigable Platform Pages:
  - [x] Dashboard
  - [x] Strategy Lab
  - [x] Strategy Detail
  - [x] Backtests Runner
  - [x] Tournament Leaderboard (100-Point Scoring Model)
  - [x] Edge Health Surveillance Center
  - [x] Universal Prop Firm Simulator
  - [x] Data Registry & CSV Ingestion Previewer
  - [x] Settings & Codex Hook
- [x] Build Printable Strategy Audit Report Generator Modal
- [x] Create Full Architecture & Codex Handoff Documentation

---

## 🔮 Phase 2: Codex Backend Integration & Real Data (Next Steps)

- [ ] **Python / FastAPI Microservice**:
  - [ ] Implement VectorBT / Backtrader execution engine.
  - [ ] Implement Parquet / ClickHouse historical data repository.
  - [ ] Implement automatic continuous futures roll contract stitcher.
- [ ] **Data Pipeline**:
  - [ ] Ingest Databento / Polygon.io 1-minute historical bars for NQ & GC.
  - [ ] Ingest Binance / Bybit funding rate and orderbook data for Crypto.
- [ ] **Live Execution Bridge**:
  - [ ] Tradovate / Rithmic API integration for automated NQ/GC order dispatch.
  - [ ] Telegram / Discord real-time execution signal webhooks.
  - [ ] Automated daily Edge Health surveillance cron job.
