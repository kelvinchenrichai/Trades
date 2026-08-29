# Research methodology

## No look-ahead

A signal may use only completed observations at or before its recorded signal time. The bar engine requires a strictly later bar for entry. Execution assumptions belong to the engine, not the strategy. Tests mutate future bars and assert the earlier signal and entry do not change.

## Chronological evaluation

TRAIN, VALIDATION, OOS and FORWARD are explicit time ranges saved with every run. Random splits are prohibited. OOS should be inspected once after the research decision is frozen. Forward data is not used to change thresholds, exits, stops, modes, or strategy selection. Datasets reaching 2026 are marked forward-locked by default; an explicit override is recorded.

## Costs and execution

Commission per contract, slippage in ticks, tick size, point value and position sizing are run inputs. The Phase 1 market model fills at the next bar open and exits at the first bar at or after the scheduled time. Reported net P&L subtracts round-trip commission and slippage. Zero-cost output is a sensitivity case, not the default truth.

## Metrics

EV, profit factor, win rate, gross/net P&L, drawdown, worst day/week, loss streak, R and directional metrics derive from the ledger. Rolling 20/50/100-trade EV returns `null` and `sufficient_sample=false` until enough real trades exist. Edge Health remains UNKNOWN until a later explicit, sample-aware policy exists.

## Stability over peaks

Phase 1 performs no parameter search. Later analysis should compare neighboring parameter regions, multiple regimes, costs and walk-forward periods. It must not select maximum profit, Sharpe, win rate, or any isolated peak and label it optimal.

## Reproducibility

Every run records strategy version, dataset ID and SHA-256 fingerprint, complete parameters, costs, sizing, timezone, split ranges, engine version, creation timestamp and Git commit when available. A run is reproducible only when all those inputs and the input bytes match.

## Mock versus real

Mock mode is a labelled product demonstration. Research mode talks only to FastAPI. Missing data, invalid data, unsupported strategies and failed runs surface as errors or empty states. Synthetic values never fill research charts, ranking, OOS, Edge Health or Prop results.

