from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

import pandas as pd

from app.models import Signal, StrategyDefinition


class BaseStrategy(ABC):
    definition: StrategyDefinition

    def prepare(self, data: pd.DataFrame) -> pd.DataFrame:
        required = {"timestamp", "open", "high", "low", "close", "volume", "symbol"}
        missing = required - set(data.columns)
        if missing:
            raise ValueError(f"Strategy data missing columns: {sorted(missing)}")
        return data.copy(deep=False)

    @abstractmethod
    def generate_signals(self, data: pd.DataFrame, parameters: dict[str, Any]) -> list[Signal]:
        """Return signals based only on bars at or before signal_time."""

