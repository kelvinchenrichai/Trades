# Architecture

## Boundaries

```text
React UI
  ├─ mock mode ─────> mockApi + synthetic demo engines (labelled, isolated)
  └─ research mode ─> researchApi HTTP adapter
                              │
FastAPI                       ▼
  API -> validated dataset repository -> strategy signals -> backtest engine
                                                        -> trade ledger
                                                        -> metrics/results
```

Research mode cannot call `mockApi`; the module has a mode guard in addition to the top-level UI split.

## Domain separation

- `StrategyDefinition`: versioned hypothesis, deterministic rules, parameters, requirements, complexity, friction, status.
- `BacktestRun`: strategy/dataset fingerprints, costs, sizing, timezone, chronological split periods, engine/Git versions and timestamp.
- `BacktestResult`: immutable ledger-derived trades, metrics, equity/drawdown, rolling EV, yearly/directional/cost/OOS metrics.

Performance is never stored on a definition.

## Backend modules

- `app/data`: CSV loader, SHA-256 fingerprint, validation report, dataset repository.
- `app/services/calendar.py`: IANA timezone and DST-aware session abstraction for NQ, GC, and 24/7 crypto.
- `app/strategies`: base interface and versioned registry. NQ and GC have bar implementations; crypto has a deliberate portfolio-engine boundary.
- `app/backtest`: next-bar execution, costs, sizing, ledger and metric derivation.
- `app/api`: transport contracts. UI code is independent of Python implementation details.

The in-memory repositories are Phase 1 foundations, not durable production storage. Interfaces permit later Parquet/DuckDB/Polars implementations.

## Execution invariant

Strategies calculate each signal only from rows at or before `signal_time`. The engine independently requires `entry timestamp > signal timestamp`. Golden and future-mutation tests enforce this boundary.

## Futures and time

Internal timestamps are UTC. ET logic uses `America/New_York`, never a fixed UTC offset. Dataset metadata distinguishes individual, continuous and back-adjusted continuous contracts and reserves roll/adjustment methods. Holiday/early-close calendars are an extension point and are not claimed complete.
