from datetime import datetime, timezone
from pathlib import Path

from app.backtest.engine import BacktestEngine
from app.data.loader import load_ohlcv_csv
from app.models import BacktestRun, CostModel, Market, PositionSizing, TimeRange
from app.strategies import implementations

FIXTURE = Path(__file__).parent / "fixtures" / "golden_nq.csv"


def make_run(**overrides):
    values = dict(
        run_id="BT-GOLDEN", strategy_id="NQ-FTM-001", strategy_version="0.1.0", dataset_id="golden",
        dataset_hash="hash", parameters={"window_start_et": "09:30", "window_end_et": "10:00", "threshold_pct": 0.5, "exit_time_et": "11:30"},
        costs=CostModel(commission_per_contract=2, slippage_ticks=1, tick_size=0.25, point_value=20),
        position_sizing=PositionSizing(mode="FIXED_QUANTITY", quantity=1), timezone_assumption="America/New_York",
        created_at=datetime.now(timezone.utc), engine_version="test", train_period=TimeRange(), validation_period=TimeRange(),
        oos_period=TimeRange(), forward_period=TimeRange(),
    )
    values.update(overrides)
    return BacktestRun(**values)


def test_golden_dataset_long_short_costs_equity_and_times():
    loaded = load_ohlcv_csv(FIXTURE.read_bytes(), dataset_id="golden", market=Market.NQ, timezone="America/New_York")
    result = BacktestEngine().execute(implementations["NQ-FTM-001"], loaded.frame, make_run())
    assert [t.direction for t in result.trades] == ["LONG", "SHORT"]
    assert all(t.entry_time > t.signal_time for t in result.trades)
    assert result.trades[0].entry_price == 101.5
    assert result.trades[0].gross_pnl == 30
    assert result.trades[0].commission == 4
    assert result.trades[0].slippage_cost == 10
    assert result.trades[0].net_pnl == 16
    assert result.metrics.net_pnl == 32
    assert result.equity_curve[-1].value == 32
    assert len({t.trade_id for t in result.trades}) == 2


def test_fixed_risk_position_size():
    loaded = load_ohlcv_csv(FIXTURE.read_bytes(), dataset_id="golden", market=Market.NQ, timezone="America/New_York")
    sizing = PositionSizing(mode="FIXED_RISK", risk_amount=1000, stop_distance=10)
    result = BacktestEngine().execute(implementations["NQ-FTM-001"], loaded.frame, make_run(position_sizing=sizing))
    assert result.trades[0].quantity == 5


def test_no_lookahead_future_mutation_does_not_change_signal_or_entry():
    loaded = load_ohlcv_csv(FIXTURE.read_bytes(), dataset_id="golden", market=Market.NQ, timezone="America/New_York")
    first = BacktestEngine().execute(implementations["NQ-FTM-001"], loaded.frame, make_run())
    mutated = loaded.frame.copy()
    mutated.loc[mutated["timestamp"] >= "2025-01-02T16:30:00Z", "close"] = 10000
    second = BacktestEngine().execute(implementations["NQ-FTM-001"], mutated, make_run())
    assert first.trades[0].direction == second.trades[0].direction
    assert first.trades[0].entry_price == second.trades[0].entry_price

