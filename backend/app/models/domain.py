from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Market(str, Enum):
    NQ = "NQ"
    GC = "GC"
    CRYPTO = "CRYPTO"


class StrategyStatus(str, Enum):
    RESEARCH = "RESEARCH"
    BACKTEST_PASS = "BACKTEST_PASS"
    OOS_PASS = "OOS_PASS"
    PAPER = "PAPER"
    LIVE = "LIVE"
    RETIRED = "RETIRED"


class EdgeHealth(str, Enum):
    UNKNOWN = "UNKNOWN"
    HEALTHY = "HEALTHY"
    WATCH = "WATCH"
    DECAYING = "DECAYING"
    DISABLED = "DISABLED"


class ContractType(str, Enum):
    INDIVIDUAL = "INDIVIDUAL"
    CONTINUOUS = "CONTINUOUS"
    BACK_ADJUSTED_CONTINUOUS = "BACK_ADJUSTED_CONTINUOUS"


class ParameterDefinition(BaseModel):
    name: str
    default: Any
    description: str = ""


class StrategyDefinition(BaseModel):
    id: str
    version: str
    name: str
    market: Market
    category: str
    hypothesis: str
    edge_explanation: str
    signal_rules: list[str]
    entry_rules: list[str]
    exit_rules: list[str]
    parameters: dict[str, ParameterDefinition]
    data_requirements: list[str]
    max_trades_per_day: int = Field(ge=1)
    complexity_score: int = Field(ge=1, le=10)
    execution_friction_score: int = Field(ge=1, le=10)
    status: StrategyStatus = StrategyStatus.RESEARCH
    edge_health: EdgeHealth = EdgeHealth.UNKNOWN


class DatasetMetadata(BaseModel):
    dataset_id: str
    dataset_hash: str
    symbol: str
    market: Market
    timezone: str
    rows: int
    data_start: datetime
    data_end: datetime
    contract_type: ContractType = ContractType.INDIVIDUAL
    contract_symbol: str | None = None
    roll_method: str | None = None
    adjustment_method: str | None = None


class TimeRange(BaseModel):
    start: datetime | None = None
    end: datetime | None = None

    @model_validator(mode="after")
    def ordered(self) -> "TimeRange":
        if self.start and self.end and self.start >= self.end:
            raise ValueError("period start must be before end")
        return self


class CostModel(BaseModel):
    commission_per_contract: float = Field(default=0, ge=0)
    slippage_ticks: float = Field(default=0, ge=0)
    tick_size: float = Field(gt=0)
    point_value: float = Field(gt=0)


class PositionSizing(BaseModel):
    mode: Literal["FIXED_QUANTITY", "FIXED_RISK"] = "FIXED_QUANTITY"
    quantity: float = Field(default=1, gt=0)
    risk_amount: float | None = Field(default=None, gt=0)
    stop_distance: float | None = Field(default=None, gt=0)

    def resolved_quantity(self, point_value: float) -> float:
        if self.mode == "FIXED_QUANTITY":
            return self.quantity
        assert self.risk_amount is not None and self.stop_distance is not None
        return max(1, int(self.risk_amount / (self.stop_distance * point_value)))


class BacktestRun(BaseModel):
    run_id: str
    strategy_id: str
    strategy_version: str
    dataset_id: str
    dataset_hash: str
    parameters: dict[str, Any]
    costs: CostModel
    position_sizing: PositionSizing
    timezone_assumption: str
    train_period: TimeRange = Field(default_factory=TimeRange)
    validation_period: TimeRange = Field(default_factory=TimeRange)
    oos_period: TimeRange = Field(default_factory=TimeRange)
    forward_period: TimeRange = Field(default_factory=TimeRange)
    forward_locked: bool = True
    created_at: datetime
    engine_version: str
    git_commit: str | None = None


class BacktestRequest(BaseModel):
    strategy_id: str
    dataset_id: str
    parameters: dict[str, Any] = Field(default_factory=dict)
    costs: CostModel
    position_sizing: PositionSizing = Field(default_factory=PositionSizing)
    train_period: TimeRange = Field(default_factory=TimeRange)
    validation_period: TimeRange = Field(default_factory=TimeRange)
    oos_period: TimeRange = Field(default_factory=TimeRange)
    forward_period: TimeRange = Field(default_factory=TimeRange)
    allow_forward_override: bool = False


class Signal(BaseModel):
    direction: Literal["LONG", "SHORT"]
    signal_time: datetime
    exit_time: datetime
    exit_reason: str = "TIME_EXIT"


class Trade(BaseModel):
    trade_id: str
    strategy_id: str
    run_id: str
    symbol: str
    direction: Literal["LONG", "SHORT"]
    signal_time: datetime
    entry_time: datetime
    entry_price: float
    exit_time: datetime
    exit_price: float
    quantity: float
    gross_pnl: float
    commission: float
    slippage_cost: float
    net_pnl: float
    r_multiple: float | None = None
    exit_reason: str


class RollingMetric(BaseModel):
    trade_number: int
    timestamp: datetime
    value: float | None
    sample_size: int
    sufficient_sample: bool


class ResultMetrics(BaseModel):
    total_trades: int
    wins: int
    losses: int
    win_rate: float | None
    avg_win: float | None
    avg_loss: float | None
    ev_per_trade: float | None
    profit_factor: float | None
    gross_pnl: float
    net_pnl: float
    max_drawdown: float
    worst_day: float | None
    worst_week: float | None
    max_consecutive_losses: int
    average_r: float | None
    long_ev: float | None
    short_ev: float | None


class CurvePoint(BaseModel):
    timestamp: datetime
    value: float


class BacktestResult(BaseModel):
    model_config = ConfigDict(use_enum_values=True)
    run_id: str
    provenance: BacktestRun
    metrics: ResultMetrics
    trades: list[Trade]
    equity_curve: list[CurvePoint]
    drawdown_curve: list[CurvePoint]
    rolling_20_ev: list[RollingMetric]
    rolling_50_ev: list[RollingMetric]
    rolling_100_ev: list[RollingMetric]
    yearly_metrics: dict[str, ResultMetrics]
    long_metrics: ResultMetrics
    short_metrics: ResultMetrics
    cost_sensitivity: dict[str, float] = Field(default_factory=dict)
    oos_metrics: ResultMetrics | None = None
    data_mode: Literal["RESEARCH"] = "RESEARCH"


class DataQualityIssue(BaseModel):
    code: str
    severity: Literal["ERROR", "WARNING"]
    message: str
    rows: list[int] = Field(default_factory=list)


class DataQualityReport(BaseModel):
    valid: bool
    row_count: int
    issues: list[DataQualityIssue]
    dataset: DatasetMetadata | None = None

