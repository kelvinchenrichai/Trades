# No-Brain EV Lab — Codex Handoff & Backend Transition Guide

> **Note for Codex / Secondary AI Agents**:
> This document specifies how to connect real Python / Rust backtest engines, live market data feeds, and persistence databases without rewriting the React frontend.

---

## 🎯 Current Implementation State

1. **Frontend**: Complete, fully styled with Tailwind CSS, responsive, and operational.
2. **Data Layer**: 5 starter strategies pre-configured in `src/data/strategies.ts`.
3. **API Bridge**: `src/services/api/mockApi.ts` exports `QuantApiService`.
4. **UI Isolation**: None of the UI components directly touch raw files; all requests route through `QuantApiService`.

---

## 🔌 Connecting a Real Python / FastAPI Backend

To replace the mock statistical generator with a real backend:

### Step 1: Implement the REST API Endpoints in FastAPI / Flask

Create the following HTTP endpoints matching the JSON contracts in `src/types/index.ts`:

- `GET /api/v1/strategies`
  - Returns `Strategy[]`
- `GET /api/v1/strategies/{id}`
  - Returns `Strategy`
- `POST /api/v1/backtest/run`
  - Request body: `BacktestRunConfig`
  - Response: `BacktestResult`
- `POST /api/v1/prop/simulate`
  - Request body: `{ strategyId, rules, riskPerTradeUSD, numSimulations }`
  - Response: `PropSimulationResult`
- `GET /api/v1/datasets`
  - Returns `MarketDataset[]`

### Step 2: Update `src/services/api/mockApi.ts`

Modify `QuantApiService` to fetch from `backendUrl` (configured in Settings) when `useMockApi === false`:

```typescript
// Example replacement pattern for QuantApiService.getStrategies()
async getStrategies(): Promise<Strategy[]> {
  if (isLiveApiEnabled()) {
    const res = await fetch(`${getBackendUrl()}/strategies`);
    return await res.json();
  }
  return [...SEED_STRATEGIES];
}
```

---

## 📈 Suggested Real-World Engine Stack

1. **Backtesting Kernel**:
   - Python `VectorBT` / `VectorBT PRO` or `NautilusTrader` for ultra-fast event-driven and array-based backtesting.
2. **Historical Data Storage**:
   - `ClickHouse`, `DuckDB`, or `QuestDB` for millisecond-latency tick/1-minute OHLCV retrieval.
3. **Continuous Futures Stitching**:
   - Standard Volume-Roll or Open-Interest Roll with Pananama backward-ratio price adjustment to remove expiration gap artifacts.
4. **Prop Firm Simulation**:
   - Monte Carlo trade resampling using block-bootstrap (preserving autocorrelation and drawdown clustering) rather than pure i.i.d. shuffling.

---

## ⚠️ Non-Negotiable Invariants

1. **Zero Subjective Rules**: Do NOT introduce manual judgment parameters (e.g., "enter when price feels weak").
2. **Keep the $\le 3$ Entry Conditions Limit**: Resist adding secondary indicators to improve in-sample Sharpe ratio at the cost of over-parameterization.
3. **Plateau > Peak**: Keep the parameter neighborhood scanner active to reject isolated performance spikes.
