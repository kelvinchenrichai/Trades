# Codex handoff

## Phase 1 state

The frontend is preserved in demo mode and has a separate research-mode shell. The FastAPI backend is the research authority. Do not reconnect research screens to `src/data/strategies.ts` or `src/services/backtest/engine.ts`; both are demo-only.

Start backend from `backend/` and set:

```text
VITE_DATA_MODE=research
VITE_RESEARCH_API_URL=http://localhost:8000
```

Upload a validated dataset with `POST /datasets/upload`, then submit its ID to `POST /backtests`. There is no fallback if either resource is absent.

## Invariants to preserve

1. Definitions never contain performance.
2. Results are derived from the trade ledger.
3. Close-derived signals enter on a strictly later bar.
4. UTC storage and IANA session zones are mandatory.
5. Chronological splits only; 2026 defaults to forward-locked.
6. Costs, versions and fingerprints stay in run provenance.
7. `CR-RM-001` returns `501 NOT IMPLEMENTED` until a survivorship-safe multi-asset engine exists.

## Known Phase 1 limits

- Datasets and results are in memory and disappear on restart.
- Exchange holiday, early-close, overnight-session, and continuous-roll execution rules are modelled but not fully implemented.
- The engine supports a single position per signal and bar-based market orders; stops, targets and portfolio accounting are not implemented.
- Research UI shows authoritative definitions and empty-state integrity; full upload/run/result workflow integration remains next work.
- Prop Simulator and Tournament remain demo-only and cannot promote research strategies.
