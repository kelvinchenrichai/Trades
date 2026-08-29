from __future__ import annotations

import logging
import time
from collections import Counter

import pandas as pd

from app.backtest.metrics import calculate_metrics, curves, rolling_ev, yearly_metrics
from app.models import BacktestResult, BacktestRun, Signal, Trade
from app.strategies.base import BaseStrategy

ENGINE_VERSION = "0.1.0"
logger = logging.getLogger("quant.backtest")


class BacktestEngine:
    """Deterministic bar engine. A close-derived signal can only enter a later bar."""

    def execute(self, strategy: BaseStrategy, data: pd.DataFrame, run: BacktestRun) -> BacktestResult:
        started = time.perf_counter()
        logger.info("backtest_start strategy=%s dataset=%s parameters=%s", run.strategy_id, run.dataset_id, run.parameters)
        try:
            signals = strategy.generate_signals(data, run.parameters)
            trades = self._execute_signals(signals, data, run, strategy.definition.max_trades_per_day)
            result = self._result(run, trades)
            logger.info("backtest_end run=%s trades=%d duration_seconds=%.4f", run.run_id, len(trades), time.perf_counter() - started)
            return result
        except Exception:
            logger.exception("backtest_error run=%s", run.run_id)
            raise

    def _execute_signals(self, signals: list[Signal], data: pd.DataFrame, run: BacktestRun, max_per_day: int) -> list[Trade]:
        ordered = data.sort_values("timestamp", kind="stable").reset_index(drop=True)
        counts: Counter = Counter()
        trades: list[Trade] = []
        quantity = run.position_sizing.resolved_quantity(run.costs.point_value)
        for signal in sorted(signals, key=lambda s: s.signal_time):
            day = signal.signal_time.date().isoformat()
            if counts[day] >= max_per_day:
                continue
            entry_candidates = ordered[ordered["timestamp"] > pd.Timestamp(signal.signal_time)]
            exit_candidates = ordered[ordered["timestamp"] >= pd.Timestamp(signal.exit_time)]
            if entry_candidates.empty or exit_candidates.empty:
                continue
            entry = entry_candidates.iloc[0]
            exit_bar = exit_candidates.iloc[0]
            if entry["timestamp"] > exit_bar["timestamp"]:
                continue
            entry_price, exit_price = float(entry["open"]), float(exit_bar["close"])
            sign = 1 if signal.direction == "LONG" else -1
            gross = (exit_price - entry_price) * sign * run.costs.point_value * quantity
            commission = run.costs.commission_per_contract * quantity * 2
            slippage = run.costs.slippage_ticks * run.costs.tick_size * run.costs.point_value * quantity * 2
            net = gross - commission - slippage
            risk = run.position_sizing.risk_amount
            trades.append(Trade(
                trade_id=f"{run.run_id}-T{len(trades)+1:05d}", strategy_id=run.strategy_id, run_id=run.run_id,
                symbol=str(entry["symbol"]), direction=signal.direction, signal_time=signal.signal_time,
                entry_time=entry["timestamp"].to_pydatetime(), entry_price=entry_price,
                exit_time=exit_bar["timestamp"].to_pydatetime(), exit_price=exit_price, quantity=quantity,
                gross_pnl=gross, commission=commission, slippage_cost=slippage, net_pnl=net,
                r_multiple=(net / risk) if risk else None, exit_reason=signal.exit_reason,
            ))
            counts[day] += 1
        return trades

    def _result(self, run: BacktestRun, trades: list[Trade]) -> BacktestResult:
        equity, drawdown = curves(trades)
        long_trades = [trade for trade in trades if trade.direction == "LONG"]
        short_trades = [trade for trade in trades if trade.direction == "SHORT"]
        oos = [trade for trade in trades if run.oos_period.start and run.oos_period.end and run.oos_period.start <= trade.exit_time < run.oos_period.end]
        per_tick = run.costs.tick_size * run.costs.point_value * 2
        cost_sensitivity = {str(ticks): sum(t.gross_pnl - t.commission - ticks * per_tick * t.quantity for t in trades) for ticks in (0, 1, 2, 4)}
        return BacktestResult(
            run_id=run.run_id, provenance=run, metrics=calculate_metrics(trades), trades=trades,
            equity_curve=equity, drawdown_curve=drawdown,
            rolling_20_ev=rolling_ev(trades, 20), rolling_50_ev=rolling_ev(trades, 50), rolling_100_ev=rolling_ev(trades, 100),
            yearly_metrics=yearly_metrics(trades), long_metrics=calculate_metrics(long_trades), short_metrics=calculate_metrics(short_trades),
            cost_sensitivity=cost_sensitivity, oos_metrics=calculate_metrics(oos) if oos else None,
        )

