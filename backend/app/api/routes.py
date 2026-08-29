from __future__ import annotations

import subprocess
from datetime import datetime, timezone
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.backtest import ENGINE_VERSION, BacktestEngine
from app.data.loader import load_ohlcv_csv
from app.data.repository import datasets
from app.models import BacktestRequest, BacktestResult, BacktestRun, ContractType, Market, TimeRange
from app.strategies import STRATEGIES, implementations

router = APIRouter()
runs: dict[str, BacktestResult] = {}


def _git_commit() -> str | None:
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"], text=True, timeout=2).strip()
    except (OSError, subprocess.SubprocessError):
        return None


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "mode": "RESEARCH", "engineVersion": ENGINE_VERSION}


@router.get("/strategies")
def list_strategies():
    return list(STRATEGIES.values())


@router.get("/strategies/{strategy_id}")
def get_strategy(strategy_id: str):
    if strategy_id not in STRATEGIES:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return STRATEGIES[strategy_id]


@router.get("/datasets")
def list_datasets():
    return [item.report.dataset for item in datasets.list()]


@router.post("/datasets/upload")
async def upload_dataset(
    file: Annotated[UploadFile, File()], dataset_id: Annotated[str, Form()], market: Annotated[Market, Form()],
    timezone_name: Annotated[str, Form(alias="timezone")], contract_type: Annotated[ContractType, Form()] = ContractType.INDIVIDUAL,
    contract_symbol: Annotated[str | None, Form()] = None, roll_method: Annotated[str | None, Form()] = None,
    adjustment_method: Annotated[str | None, Form()] = None,
):
    raw = await file.read()
    try:
        loaded = load_ohlcv_csv(raw, dataset_id=dataset_id, market=market, timezone=timezone_name,
                                contract_type=contract_type, contract_symbol=contract_symbol,
                                roll_method=roll_method, adjustment_method=adjustment_method)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    if loaded.report.valid:
        datasets.put(loaded)
    return loaded.report


@router.post("/backtests", response_model=BacktestResult, status_code=status.HTTP_201_CREATED)
def create_backtest(request: BacktestRequest):
    definition = STRATEGIES.get(request.strategy_id)
    loaded = datasets.get(request.dataset_id)
    if definition is None:
        raise HTTPException(status_code=404, detail="Strategy not found")
    if loaded is None or loaded.report.dataset is None:
        raise HTTPException(status_code=404, detail="Validated dataset not found; research mode never substitutes mock data")
    if definition.market != loaded.report.dataset.market:
        raise HTTPException(status_code=422, detail="Dataset market does not match strategy market")
    parameters = {key: spec.default for key, spec in definition.parameters.items()}
    unknown = set(request.parameters) - set(parameters)
    if unknown:
        raise HTTPException(status_code=422, detail=f"Unknown strategy parameters: {sorted(unknown)}")
    parameters.update(request.parameters)
    forward_period = request.forward_period
    contains_2026 = loaded.report.dataset.data_end.year >= 2026
    if contains_2026 and not request.allow_forward_override and forward_period.start is None:
        forward_period = TimeRange(
            start=datetime(2026, 1, 1, tzinfo=timezone.utc),
            end=loaded.report.dataset.data_end,
        )
    run_id = f"BT-{uuid4().hex[:12].upper()}"
    run = BacktestRun(
        run_id=run_id, strategy_id=definition.id, strategy_version=definition.version,
        dataset_id=loaded.report.dataset.dataset_id, dataset_hash=loaded.report.dataset.dataset_hash,
        parameters=parameters, costs=request.costs, position_sizing=request.position_sizing,
        timezone_assumption=loaded.report.dataset.timezone, train_period=request.train_period,
        validation_period=request.validation_period, oos_period=request.oos_period, forward_period=forward_period,
        forward_locked=contains_2026 and not request.allow_forward_override,
        created_at=datetime.now(timezone.utc), engine_version=ENGINE_VERSION, git_commit=_git_commit(),
    )
    try:
        result = BacktestEngine().execute(implementations[definition.id], loaded.frame, run)
    except NotImplementedError as exc:
        raise HTTPException(status_code=501, detail=str(exc)) from exc
    runs[run_id] = result
    return result


def _run(run_id: str) -> BacktestResult:
    if run_id not in runs:
        raise HTTPException(status_code=404, detail="Backtest run not found")
    return runs[run_id]


@router.get("/backtests/{run_id}", response_model=BacktestResult)
def get_backtest(run_id: str):
    return _run(run_id)


@router.get("/backtests/{run_id}/trades")
def get_trades(run_id: str):
    return _run(run_id).trades


@router.get("/backtests/{run_id}/metrics")
def get_metrics(run_id: str):
    result = _run(run_id)
    return {"runId": run_id, "metrics": result.metrics, "rolling20EV": result.rolling_20_ev,
            "rolling50EV": result.rolling_50_ev, "rolling100EV": result.rolling_100_ev,
            "oosMetrics": result.oos_metrics, "provenance": result.provenance}

