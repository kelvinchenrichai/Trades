from datetime import datetime, timedelta, timezone

from app.backtest.metrics import calculate_metrics, rolling_ev
from app.models import Trade


def trade(index: int, pnl: float, direction: str = "LONG") -> Trade:
    moment = datetime(2025, 1, 1, tzinfo=timezone.utc) + timedelta(days=index)
    return Trade(trade_id=str(index), strategy_id="S", run_id="R", symbol="X", direction=direction,
                 signal_time=moment, entry_time=moment, entry_price=100, exit_time=moment,
                 exit_price=101, quantity=1, gross_pnl=pnl, commission=0, slippage_cost=0,
                 net_pnl=pnl, r_multiple=pnl, exit_reason="TEST")


def test_metrics_ev_pf_drawdown_and_consecutive_losses():
    metrics = calculate_metrics([trade(1, 10), trade(2, -5), trade(3, -5), trade(4, 20, "SHORT")])
    assert metrics.total_trades == 4
    assert metrics.win_rate == 50
    assert metrics.ev_per_trade == 5
    assert metrics.profit_factor == 3
    assert metrics.max_drawdown == 10
    assert metrics.max_consecutive_losses == 2
    assert metrics.long_ev == 0
    assert metrics.short_ev == 20


def test_rolling_ev_reports_insufficient_sample_without_fake_values():
    values = rolling_ev([trade(i, 1) for i in range(19)], 20)
    assert values[-1].value is None
    assert not values[-1].sufficient_sample
    complete = rolling_ev([trade(i, 1) for i in range(20)], 20)
    assert complete[-1].value == 1
    assert complete[-1].sufficient_sample

