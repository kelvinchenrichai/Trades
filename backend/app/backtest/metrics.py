from __future__ import annotations

from collections import defaultdict
from datetime import datetime

from app.models import CurvePoint, ResultMetrics, RollingMetric, Trade


def _mean(values: list[float]) -> float | None:
    return sum(values) / len(values) if values else None


def curves(trades: list[Trade]) -> tuple[list[CurvePoint], list[CurvePoint]]:
    equity: list[CurvePoint] = []
    drawdown: list[CurvePoint] = []
    cumulative = peak = 0.0
    for trade in trades:
        cumulative += trade.net_pnl
        peak = max(peak, cumulative)
        equity.append(CurvePoint(timestamp=trade.exit_time, value=cumulative))
        drawdown.append(CurvePoint(timestamp=trade.exit_time, value=cumulative - peak))
    return equity, drawdown


def calculate_metrics(trades: list[Trade]) -> ResultMetrics:
    pnl = [t.net_pnl for t in trades]
    wins = [x for x in pnl if x > 0]
    losses = [x for x in pnl if x < 0]
    equity, drawdown = curves(trades)
    gross_profit, gross_loss = sum(wins), abs(sum(losses))
    daily: dict[str, float] = defaultdict(float)
    weekly: dict[str, float] = defaultdict(float)
    max_streak = streak = 0
    for trade in trades:
        daily[trade.exit_time.date().isoformat()] += trade.net_pnl
        iso = trade.exit_time.isocalendar()
        weekly[f"{iso.year}-{iso.week}"] += trade.net_pnl
        streak = streak + 1 if trade.net_pnl < 0 else 0
        max_streak = max(max_streak, streak)
    long_pnl = [t.net_pnl for t in trades if t.direction == "LONG"]
    short_pnl = [t.net_pnl for t in trades if t.direction == "SHORT"]
    r_values = [t.r_multiple for t in trades if t.r_multiple is not None]
    return ResultMetrics(
        total_trades=len(trades), wins=len(wins), losses=len(losses),
        win_rate=(len(wins) / len(trades) * 100) if trades else None,
        avg_win=_mean(wins), avg_loss=_mean(losses), ev_per_trade=_mean(pnl),
        profit_factor=(gross_profit / gross_loss) if gross_loss else None,
        gross_pnl=sum(t.gross_pnl for t in trades), net_pnl=sum(pnl),
        max_drawdown=abs(min((p.value for p in drawdown), default=0)),
        worst_day=min(daily.values()) if daily else None,
        worst_week=min(weekly.values()) if weekly else None,
        max_consecutive_losses=max_streak, average_r=_mean([float(x) for x in r_values]),
        long_ev=_mean(long_pnl), short_ev=_mean(short_pnl),
    )


def rolling_ev(trades: list[Trade], window: int) -> list[RollingMetric]:
    result: list[RollingMetric] = []
    for index, trade in enumerate(trades, start=1):
        sample = trades[max(0, index - window):index]
        sufficient = len(sample) == window
        result.append(RollingMetric(
            trade_number=index, timestamp=trade.exit_time,
            value=(sum(t.net_pnl for t in sample) / window) if sufficient else None,
            sample_size=len(sample), sufficient_sample=sufficient,
        ))
    return result


def yearly_metrics(trades: list[Trade]) -> dict[str, ResultMetrics]:
    groups: dict[str, list[Trade]] = defaultdict(list)
    for trade in trades:
        groups[str(trade.exit_time.year)].append(trade)
    return {year: calculate_metrics(group) for year, group in groups.items()}
