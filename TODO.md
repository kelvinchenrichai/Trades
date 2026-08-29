# Roadmap

## Phase 1 — real quant foundation

- [x] Separate StrategyDefinition, BacktestRun and BacktestResult
- [x] Create FastAPI service and versioned strategy registry
- [x] Add strict mock/research mode boundary and no-fallback empty state
- [x] Set starter research status to RESEARCH / UNKNOWN / NOT ELIGIBLE
- [x] Add unified UTC OHLCV CSV loader, validation and quality report
- [x] Add dataset hash and futures contract/roll metadata
- [x] Add DST-aware session abstraction
- [x] Add deterministic next-bar engine, long/short, costs and sizing
- [x] Add trade ledger, equity, drawdown, metrics, rolling EV and cost sensitivity
- [x] Add configurable chronological split provenance and forward lock
- [x] Integrate NQ and GC interfaces; define crypto portfolio interface
- [x] Add golden, data, DST, look-ahead, engine and metric tests
- [x] Update research and data documentation

## Deliberately not Phase 1

- [ ] Durable Parquet/DuckDB dataset and result repository
- [ ] Exchange holiday/early-close provider and full overnight session rules
- [ ] Continuous futures roll construction and adjustment calculations
- [ ] Stop/target/intrabar fill models
- [ ] Survivorship-safe crypto universe and multi-asset portfolio accounting
- [ ] Full research UI for upload, run configuration and provenance charts
- [ ] Ledger-based Prop simulation and eligible OOS Tournament
- [ ] Walk-forward orchestration and parameter-stability tooling (without peak selection)
- [ ] Performance profiling and vectorized/parallel research

No broker, private API, automatic trading or strategy optimizer is planned until research integrity is independently verified.
