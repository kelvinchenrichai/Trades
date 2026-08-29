# No-Brain EV Lab

A research-integrity-first quantitative strategy laboratory. The React prototype remains available as an explicitly labelled demo, while the Python service is the only source of research results.

## Data modes

- `VITE_DATA_MODE=mock`: synthetic UI demonstration. Every performance screen is labelled `DEMO / MOCK DATA`.
- `VITE_DATA_MODE=research`: connects to FastAPI and never imports, calls, or falls back to the mock engine. Missing backend data is shown as `NO REAL BACKTEST DATA`.

Copy `.env.example` to `.env.local` and choose the mode before building. This is intentionally not a cosmetic runtime toggle.

## Strategy single source of truth

Formal research definitions live in `backend/app/strategies/registry.py`. All starter definitions are `RESEARCH` with Edge Health `UNKNOWN`. Definitions contain rules and metadata only; `BacktestRun` records experiment provenance; `BacktestResult` contains ledger-derived output.

The canonical NQ default is currently a **parameterized** 09:30–10:00 ET measurement window, 0.25% threshold, next-bar entry, and 11:30 ET exit. These are research defaults—not optimized or validated values. Earlier README claims about 09:35, 0.35%, stops, performance, OOS PASS, LIVE, and HEALTHY were demo claims and are not research truth.

## Run

Frontend:

```bash
npm install
npm run dev
```

Backend (Python 3.11+):

```bash
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"
.venv/Scripts/python -m uvicorn app.main:app --reload
```

On macOS/Linux use `.venv/bin/python`. API endpoints include `/health`, `/strategies`, `/datasets/upload`, `/backtests`, and run-specific result, trade, and metric routes.

## Research boundaries

The engine is deterministic and bar-based. A signal derived from a completed bar enters no earlier than the next bar open. Costs are explicit. All metrics derive from the trade ledger. Timestamps are stored in UTC and session calculations use IANA timezones. There is no broker integration, auto-trading, optimization engine, or claim of profitability.

See [RESEARCH_METHODOLOGY.md](RESEARCH_METHODOLOGY.md) and [DATA_GUIDE.md](DATA_GUIDE.md).
