# No-Brain EV Lab — Architecture & System Design

This document details the architectural boundaries, domain models, and service interfaces of **No-Brain EV Lab**.

---

## 🏛️ System High-Level Topology

```
+-------------------------------------------------------------------------------+
|                             No-Brain EV Lab (UI)                              |
|   React 18 + TypeScript + Tailwind CSS + Recharts + Lucide Icons              |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                         API Abstraction Layer                                 |
|                   `src/services/api/mockApi.ts`                               |
|   (Provides `QuantApiService` Interface matching `src/types/index.ts`)        |
+-------------------------------------------------------------------------------+
            │                                             │
            ▼ (Current MVP)                               ▼ (Future Codex Hook)
+------------------------------------+      +-----------------------------------+
|     In-Memory Mock / Simulator     |      |    External Python/FastAPI Server |
|  - `backtest/engine.ts`            |      |  - VectorBT / Backtrader Engine   |
|  - `prop/propSimulator.ts`         |      |  - ClickHouse / TimescaleDB       |
|  - `calendar/sessionCalendar.ts`   |      |  - Live Execution Gateway         |
+------------------------------------+      +-----------------------------------+
```

---

## 📁 Directory Structure & Responsibilities

```
/src
├── /components          # Reusable UI & Atomic Components
│   ├── /Charts          # Recharts-based Quantitative Visualizers
│   │   ├── EquityChart.tsx          # Equity curve with Train/Val/OOS shading
│   │   ├── DrawdownChart.tsx        # Underwater drawdown chart
│   │   ├── RollingEdgeChart.tsx     # Rolling 20/50/100 EV lines
│   │   ├── EdgeDecayChart.tsx       # Healthy vs Decaying comparative chart
│   │   ├── StabilityHeatmap.tsx     # Parameter stability plateau matrix
│   │   └── PropMonteCarloChart.tsx  # Monte Carlo paths with profit/DD limits
│   ├── DisclaimerBanner.tsx         # Prominent Mock / Demo data callouts
│   ├── MetricCard.tsx               # Statistical KPI display card
│   ├── ReportModal.tsx              # Printable Strategy Audit Report
│   ├── StatusBadge.tsx              # Health, Market & Stage status badges
│   ├── StrategyCard.tsx             # Interactive strategy catalog card
│   ├── Sidebar.tsx                  # Left navigation bar with session clock
│   └── Header.tsx                   # Top control header with timezone switch
│
├── /data                # Raw Strategy Definitions & Static Registries
│   ├── strategies.ts    # Seed quantitative strategies with equity curves
│   ├── datasets.ts      # Continuous futures & crypto dataset metadata
│   └── propTemplates.ts # Preset rules for standard prop evaluations
│
├── /pages               # Route / View Page Modules
│   ├── DashboardPage.tsx     # Overview KPI summary & tournament top ranks
│   ├── StrategyLabPage.tsx   # Pipeline progression & search/filtering
│   ├── StrategyDetailPage.tsx# In-depth breakdown (Rules, Performance, OOS)
│   ├── BacktestsPage.tsx     # Dynamic parameter backtester & stability suite
│   ├── TournamentPage.tsx    # 100-pt multi-factor scoring & comparison
│   ├── EdgeHealthPage.tsx    # Rolling decay surveillance & elimination rules
│   ├── PropSimulatorPage.tsx # Monte Carlo prop challenge evaluator
│   ├── DataPage.tsx          # Dataset registry & CSV upload inspector
│   └── SettingsPage.tsx      # System preferences & backend switcher
│
├── /services            # Core Business Logic & Domain Services
│   ├── /api
│   │   └── mockApi.ts        # Unified API interface bridging UI and engines
│   ├── /backtest
│   │   └── engine.ts         # Walk-forward backtest simulation engine
│   ├── /prop
│   │   └── propSimulator.ts  # Monte Carlo path evaluation engine
│   └── /calendar
│       └── sessionCalendar.ts# CME, COMEX, and UTC session clock normalizer
│
└── /types               # Global Domain TypeScript Types & Interfaces
    └── index.ts         # Strategy, Backtest, Prop & Metric schemas
```

---

## 🧩 Strategy Schema Standardization

Every strategy registered in the platform satisfies the strict `Strategy` interface in `src/types/index.ts`:

```typescript
export interface Strategy {
  id: string;                      // e.g. "NQ-FTM-001"
  name: string;                    // e.g. "NQ Opening Momentum (09:35 ET)"
  market: 'NQ' | 'GC' | 'CRYPTO';
  status: StrategyStage;           // IDEA -> RESEARCH -> BACKTEST_PASS -> OOS_PASS -> PAPER -> LIVE -> DECAYING -> RETIRED
  edgeHealth: EdgeHealthStatus;    // HEALTHY | WATCH | DECAYING | DISABLED
  hypothesis: string;              // Economic reasoning
  edgeExplanation: string;         // Why alpha persists
  entryRules: string[];            // ≤ 3 mechanical conditions
  exitRules: string[];             // Objective stop, target, and time exit
  maxTradesPerDay: number;
  dataRequirements: string[];
  complexityScore: number;         // 1 to 10
  executionFrictionScore: number;  // 1 to 10
  parameters: Record<string, any>;
  parameterSpecs: ParameterSpec[];
  metrics: StrategyPerformanceMetrics;
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  rollingEdge: RollingEdgePoint[];
  yearlyPerformance: YearlyPerformance[];
  oosPartitions: OOSPartition[];
}
```

---

## 🛡️ Out-of-Sample (OOS) Gate Protocol

To prevent curve-fitting and data snooping:
- Data is strictly partitioned chronologically:
  1. **TRAIN (45%)**: Initial parameter discovery.
  2. **VALIDATION (20%)**: Hyperparameter tuning.
  3. **OUT OF SAMPLE (20%)**: Blind quarantine test.
  4. **FORWARD / LIVE (15%)**: Real-time paper/live performance tracking.
- Random cross-validation splits are **strictly prohibited** for time-series financial data.
