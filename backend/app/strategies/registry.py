from __future__ import annotations

from app.models import Market, ParameterDefinition, StrategyDefinition
from app.strategies.fixed_time import CryptoResidualMomentum, GoldLondonNYHandoff, NQFixedTimeMomentum


STRATEGIES = {
    "NQ-FTM-001": StrategyDefinition(
        id="NQ-FTM-001", version="0.1.0", name="NQ Fixed-Time Momentum", market=Market.NQ,
        category="FIXED_TIME_MOMENTUM",
        hypothesis="The 09:30–10:00 ET return may predict continuation until a fixed exit time.",
        edge_explanation="A mechanical opening-flow hypothesis; not yet validated.",
        signal_rules=["Compute return from window_start_et open through window_end_et close", "LONG above +threshold; SHORT below -threshold; otherwise FLAT"],
        entry_rules=["Signal is final only when the window-end bar closes", "Market entry occurs on the next available bar open"],
        exit_rules=["Exit at the first available bar at or after exit_time_et"],
        parameters={
            "window_start_et": ParameterDefinition(name="Window start ET", default="09:30"),
            "window_end_et": ParameterDefinition(name="Window end ET", default="10:00"),
            "threshold_pct": ParameterDefinition(name="Threshold percent", default=0.25),
            "exit_time_et": ParameterDefinition(name="Exit time ET", default="11:30"),
        }, data_requirements=["NQ 1-minute OHLCV", "Timezone-aware timestamps", "Contract metadata"],
        max_trades_per_day=1, complexity_score=2, execution_friction_score=1,
    ),
    "GC-LNY-001": StrategyDefinition(
        id="GC-LNY-001", version="0.1.0", name="Gold London to New York Handoff", market=Market.GC,
        category="SESSION_HANDOFF",
        hypothesis="London movement may continue or reverse after New York participation begins.",
        edge_explanation="Momentum and reversal remain separate unvalidated research modes.",
        signal_rules=["Measure London-window return", "Apply MOMENTUM or REVERSAL mode above an absolute threshold"],
        entry_rules=["Generate signal at configured NY entry bar close", "Enter on next available bar open"],
        exit_rules=["Exit at configured ET time"],
        parameters={
            "mode": ParameterDefinition(name="Mode", default="REVERSAL"),
            "london_start_et": ParameterDefinition(name="London window start ET", default="03:00"),
            "london_end_et": ParameterDefinition(name="London window end ET", default="08:00"),
            "ny_entry_et": ParameterDefinition(name="NY signal time ET", default="08:20"),
            "exit_time_et": ParameterDefinition(name="Exit time ET", default="13:30"),
            "threshold_pct": ParameterDefinition(name="Threshold percent", default=0.30),
        }, data_requirements=["GC 1-minute OHLCV", "Timezone-aware timestamps", "Contract metadata"],
        max_trades_per_day=1, complexity_score=3, execution_friction_score=2,
    ),
    "CR-RM-001": StrategyDefinition(
        id="CR-RM-001", version="0.1.0", name="Crypto Residual Momentum", market=Market.CRYPTO,
        category="RESIDUAL_MOMENTUM",
        hypothesis="Coin return unexplained by beta-adjusted BTC return may persist cross-sectionally.",
        edge_explanation="Portfolio hypothesis only; Phase 1 intentionally does not claim results.",
        signal_rules=["Residual return = coin return - beta × BTC return", "Rank an eligible point-in-time universe"],
        entry_rules=["Long top N and short bottom N at configured rebalance time"],
        exit_rules=["Exit after configured holding period"],
        parameters={
            "beta_window_days": ParameterDefinition(name="Beta window days", default=30),
            "return_window_hours": ParameterDefinition(name="Return window hours", default=24),
            "universe_size": ParameterDefinition(name="Universe size", default=30),
            "top_n": ParameterDefinition(name="Top/bottom N", default=3),
            "holding_period_hours": ParameterDefinition(name="Holding period hours", default=24),
            "rebalance_time_utc": ParameterDefinition(name="Rebalance time UTC", default="00:00"),
        }, data_requirements=["Point-in-time multi-asset OHLCV", "BTC benchmark", "Survivorship-safe universe"],
        max_trades_per_day=1, complexity_score=5, execution_friction_score=5,
    ),
}

implementations = {
    "NQ-FTM-001": NQFixedTimeMomentum(),
    "GC-LNY-001": GoldLondonNYHandoff(),
    "CR-RM-001": CryptoResidualMomentum(),
}
for strategy_id, implementation in implementations.items():
    implementation.definition = STRATEGIES[strategy_id]

