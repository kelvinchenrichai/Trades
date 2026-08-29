# Data guide

## Common CSV contract

Required columns:

```csv
timestamp,open,high,low,close,volume,symbol
2025-01-02 09:30:00,21100.00,21104.25,21098.50,21102.75,812,NQH25
```

Use ISO-8601 timestamps. Prefer an explicit offset (`2025-01-02T14:30:00Z`). If timestamps are naive, supply their IANA timezone at upload. Bars must be ascending and unique by symbol/timestamp. The loader reports missing/invalid OHLCV, inconsistent highs/lows, negative volume, duplicates, ordering problems and suspicious gaps; it does not silently repair them.

## NQ

- Resolution: 1-minute OHLCV for the 09:30–exit-time hypothesis; include enough pre/post bars for next-bar fills.
- Time: UTC preferred; otherwise `America/New_York` with DST-aware local timestamps.
- Contracts: preferably individual contracts with `contractSymbol` (for example NQH25), expiry and roll context. If continuous, state `contractType`, `rollMethod` and `adjustmentMethod`.
- History: multiple regimes, ideally 8–10+ years through 2025. Preserve 2026 as untouched forward data.
- Also provide: tick size, point value, realistic round-turn commission and candidate slippage assumptions.

## GC (Gold)

- Resolution: 1-minute OHLCV covering at least 03:00–13:30 ET plus next-bar fills.
- Time/contracts: same UTC and individual-contract preference as NQ; identify COMEX contract symbols and roll handling.
- History: ideally 8–10+ years through 2025 across volatility and macro regimes; hold 2026 forward.
- Validate vendor treatment of Globex maintenance breaks, holidays and early closes.

## Crypto

- Resolution: consistent hourly or finer OHLCV for BTC plus every candidate asset; daily data alone cannot test intraday rebalance assumptions.
- Time: UTC with a precise bar-close convention.
- Universe: point-in-time membership, listings/delistings and no survivorship filtering. Supply exchange, spot/perpetual type, quote currency, fees, funding and contract multipliers where applicable.
- History: several bull, bear and sideways regimes. All assets must align without forward-filled fake tradability.
- The Phase 1 backend records the strategy definition but intentionally cannot run this portfolio yet.

## What to provide next

1. Raw CSVs plus vendor/source description and license constraints.
2. Symbol/contract dictionary and continuous-series construction notes.
3. Timestamp timezone and whether each timestamp is bar open or bar close.
4. Expected session calendar, holidays, early closes and missing-bar policy.
5. Tick/point value, commission and slippage assumptions.
6. Intended TRAIN/VALIDATION/OOS dates, leaving 2026 untouched unless explicitly overridden.

