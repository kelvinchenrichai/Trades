export type ResearchMode = 'mock' | 'research';
export type ResearchStatus = 'RESEARCH' | 'BACKTEST_PASS' | 'OOS_PASS' | 'PAPER' | 'LIVE' | 'RETIRED';
export type ResearchEdgeHealth = 'UNKNOWN' | 'HEALTHY' | 'WATCH' | 'DECAYING' | 'DISABLED';

export interface ParameterDefinition {
  name: string;
  default: unknown;
  description: string;
}

export interface StrategyDefinition {
  id: string;
  version: string;
  name: string;
  market: 'NQ' | 'GC' | 'CRYPTO';
  category: string;
  hypothesis: string;
  edge_explanation: string;
  signal_rules: string[];
  entry_rules: string[];
  exit_rules: string[];
  parameters: Record<string, ParameterDefinition>;
  data_requirements: string[];
  max_trades_per_day: number;
  complexity_score: number;
  execution_friction_score: number;
  status: ResearchStatus;
  edge_health: ResearchEdgeHealth;
}

export interface BacktestRun {
  run_id: string;
  strategy_id: string;
  strategy_version: string;
  dataset_id: string;
  dataset_hash: string;
  parameters: Record<string, unknown>;
  engine_version: string;
  git_commit: string | null;
  timezone_assumption: string;
  created_at: string;
  forward_locked: boolean;
}

export interface ResearchMetrics {
  total_trades: number;
  win_rate: number | null;
  ev_per_trade: number | null;
  profit_factor: number | null;
  max_drawdown: number;
  net_pnl: number;
}

export interface BacktestResult {
  run_id: string;
  provenance: BacktestRun;
  metrics: ResearchMetrics;
  data_mode: 'RESEARCH';
}

