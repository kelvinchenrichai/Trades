from __future__ import annotations

from datetime import datetime, time
from typing import Any
from zoneinfo import ZoneInfo

import pandas as pd

from app.models import Signal
from app.strategies.base import BaseStrategy


def parse_clock(value: str) -> time:
    return datetime.strptime(value, "%H:%M").time()


class NQFixedTimeMomentum(BaseStrategy):
    def generate_signals(self, data: pd.DataFrame, parameters: dict[str, Any]) -> list[Signal]:
        frame = self.prepare(data)
        local = frame["timestamp"].dt.tz_convert("America/New_York")
        frame = frame.assign(_local=local, _day=local.dt.date)
        start = parse_clock(parameters["window_start_et"])
        end = parse_clock(parameters["window_end_et"])
        exit_clock = parse_clock(parameters["exit_time_et"])
        threshold = float(parameters["threshold_pct"]) / 100
        signals: list[Signal] = []
        for day, bars in frame.groupby("_day", sort=True):
            opening = bars[bars["_local"].dt.time == start]
            ending = bars[bars["_local"].dt.time == end]
            if opening.empty or ending.empty:
                continue
            ret = float(ending.iloc[0]["close"] / opening.iloc[0]["open"] - 1)
            direction = "LONG" if ret > threshold else "SHORT" if ret < -threshold else None
            if direction:
                signal_time = ending.iloc[0]["timestamp"].to_pydatetime()
                exit_time = datetime.combine(day, exit_clock, tzinfo=ZoneInfo("America/New_York")).astimezone(signal_time.tzinfo)
                signals.append(Signal(direction=direction, signal_time=signal_time, exit_time=exit_time))
        return signals


class GoldLondonNYHandoff(BaseStrategy):
    def generate_signals(self, data: pd.DataFrame, parameters: dict[str, Any]) -> list[Signal]:
        frame = self.prepare(data)
        local = frame["timestamp"].dt.tz_convert("America/New_York")
        frame = frame.assign(_local=local, _day=local.dt.date)
        start, end = parse_clock(parameters["london_start_et"]), parse_clock(parameters["london_end_et"])
        entry_clock, exit_clock = parse_clock(parameters["ny_entry_et"]), parse_clock(parameters["exit_time_et"])
        threshold = float(parameters["threshold_pct"]) / 100
        reversal = parameters["mode"].upper() == "REVERSAL"
        signals: list[Signal] = []
        for day, bars in frame.groupby("_day", sort=True):
            first = bars[bars["_local"].dt.time == start]
            last = bars[bars["_local"].dt.time == end]
            entry_bar = bars[bars["_local"].dt.time == entry_clock]
            if first.empty or last.empty or entry_bar.empty:
                continue
            ret = float(last.iloc[0]["close"] / first.iloc[0]["open"] - 1)
            direction = "LONG" if ret > threshold else "SHORT" if ret < -threshold else None
            if direction and reversal:
                direction = "SHORT" if direction == "LONG" else "LONG"
            if direction:
                signal_time = entry_bar.iloc[0]["timestamp"].to_pydatetime()
                exit_time = datetime.combine(day, exit_clock, tzinfo=ZoneInfo("America/New_York")).astimezone(signal_time.tzinfo)
                signals.append(Signal(direction=direction, signal_time=signal_time, exit_time=exit_time))
        return signals


class CryptoResidualMomentum(BaseStrategy):
    def generate_signals(self, data: pd.DataFrame, parameters: dict[str, Any]) -> list[Signal]:
        raise NotImplementedError("CR-RM-001 requires the Phase 2 multi-asset portfolio engine; no synthetic result is produced")

