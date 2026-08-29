/**
 * No-Brain EV Lab — Core Domain Types & Schemas
 * Standardized across Dashboard, Lab, Backtester, Tournament, Edge Health & Prop Simulator.
 */

export type Market = 'NQ' | 'GC' | 'CRYPTO';

export type StrategyCategory = 
  | 'FIXED_TIME_MOMENTUM' 
  | 'SESSION_HANDOFF' 
  | 'RESIDUAL_MOMENTUM' 
  | 'ORB_BREAKOUT' 
  | 'SEASONALITY' 
  | 'BENCHMARK';

export type StrategyStage = 
  | 'IDEA' 
  | 'RESEARCH' 
  | 'BACKTEST_PASS' 
  | 'OOS_PASS' 
  | 'PAPER' 
  | 'LIVE' 
  | 'DECAYING' 
  | 'RETIRED';

export type EdgeHealthStatus = 'UNKNOWN' | 'HEALTHY' | 'WATCH' | 'DECAYING' | 'DISABLED';

export type OOSVerdict = 'NOT_ELIGIBLE' | 'PASS' | 'WATCH' | 'FAIL';

export type ContractType = 'INDIVIDUAL' | 'CONTINUOUS' | 'BACK_ADJUSTED';

export type DrawdownType = 'STATIC' | 'TRAILING' | 'EOD_TRAILING';

export type DataSegment = 'TRAIN' | 'VALIDATION' | 'OOS' | 'FORWARD';

export interface ParameterSpec {
  name: string;
  key: string;
  type: 'number' | 'select' | 'boolean';
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
  unit?: string;
  description?: string;
}

export interface ComplexityBreakdown {
  entryConditions: number; // max 3
  indicatorsCount: number; // target 0-1
  parametersCount: number; // target 1-3
  marketsRequired: number; // 1 = 1 market
  intradayReactionRequired: boolean;
  manualJudgmentRequired: boolean; // MUST be false
}

export interface ExecutionFrictionBreakdown {
  chaseSlippageRisk: number; // 1-10
  reactionSpeedRequired: 'Fixed-Time' | 'Minutes' | 'Seconds' | 'Sub-second';
  fixedTimeEntry: boolean;
  limitOrderFriendly: boolean;
  multiMarketScreening: boolean;
  manualDiscretionRequired: boolean;
}

export interface TournamentScoreBreakdown {
  totalScore: number;          // /100
  oosEvScore: number;          // max 25
  stabilityScore: number;      // max 20
  maxDdScore: number;          // max 15
  edgeHealthScore: number;     // max 15
  propSurvivalScore: number;   // max 15
  executionSimplicityScore: number; // max 5
  complexityScore: number;     // max 5
}

export interface StrategyMetrics {
  evPerTrade: number;          // in R, e.g. +0.18R
  profitFactor: number;        // e.g. 1.42
  winRate: number;             // e.g. 54.2%
  maxDrawdownR: number;        // in R, e.g. 5.2R
  sharpeRatio: number;         // e.g. 1.35
  totalTrades: number;
  avgWinR: number;
  avgLossR: number;
  worstDayR: number;
  worstWeekR: number;
  maxConsecutiveLosses: number;
  
  // Edge Health & Rolling Tracking
  historicalEV: number;
  rolling100EV: number;
  rolling50EV: number;
  rolling20EV: number;
  historicalPF: number;
  recentPF: number;
  historicalWinRate: number;
  recentWinRate: number;
  currentDrawdownR: number;
  
  // Scoring
  tournament: TournamentScoreBreakdown;
  propFriendlyScore: number;   // 0-100
}

export interface Strategy {
  id: string;                  // e.g. "NQ-FTM-001"
  name: string;                // e.g. "NQ Fixed-Time Momentum"
  market: Market;
  category: StrategyCategory;
  hypothesis: string;
  edgeExplanation: string;
  entryRules: string[];
  exitRules: string[];
  parameters: Record<string, any>;
  parameterSpecs: ParameterSpec[];
  complexityScore: number;     // 1-10 (Lower is simpler / better)
  complexityBreakdown: ComplexityBreakdown;
  executionFrictionScore: number; // 1-10 (Lower is frictionless)
  executionFrictionBreakdown: ExecutionFrictionBreakdown;
  status: StrategyStage;
  edgeHealth: EdgeHealthStatus;
  oosResult: OOSVerdict;
  dataRequirements: string[];
  maxTradesPerDay: number;
  metrics: StrategyMetrics;
  
  // Historical data slices for charting
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  rollingEdge: RollingEdgePoint[];
  yearlyPerformance: YearlyPerformance[];
  oosPartitions: OOSPartitionSummary[];
  parameterStability: ParameterStabilityCell[];
}

export interface EquityPoint {
  tradeNumber: number;
  date: string;
  cumulativeR: number;
  segment: DataSegment;
}

export interface DrawdownPoint {
  tradeNumber: number;
  date: string;
  drawdownR: number;
  underwaterPercent: number;
}

export interface RollingEdgePoint {
  tradeNumber: number;
  date: string;
  rolling20EV: number;
  rolling50EV: number;
  rolling100EV: number;
  overallEV: number;
}

export interface YearlyPerformance {
  year: number;
  trades: number;
  ev: number;
  profitFactor: number;
  maxDrawdownR: number;
  winRate: number;
}

export interface OOSPartitionSummary {
  segment: DataSegment;
  period: string;
  trades: number;
  ev: number;
  profitFactor: number;
  winRate: number;
  maxDrawdownR: number;
  status: 'PASS' | 'WATCH' | 'FAIL';
}

export interface ParameterStabilityCell {
  paramKey: string;
  paramValue: number | string;
  label: string;
  ev: number;
  profitFactor: number;
  maxDrawdownR: number;
  totalTrades: number;
  winRate: number;
  isCurrent: boolean;
  isOverfitRisk: boolean;
  isPlateau: boolean;
}

export interface BacktestRunConfig {
  strategyId: string;
  market: Market;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  parameters: Record<string, any>;
  tradingCosts: {
    slippageTicks: number;
    commissionPerContract: number; // USD
  };
  positionRiskPercent: number; // e.g. 1%
  initialCapitalUSD: number;
}

export interface BacktestResult {
  runId: string;
  timestamp: string;
  strategyId: string;
  strategyName: string;
  config: BacktestRunConfig;
  metrics: StrategyMetrics;
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  rollingEdge: RollingEdgePoint[];
  parameterStability: ParameterStabilityCell[];
  oosPartitions: OOSPartitionSummary[];
  isDemoSimulation: boolean;
  disclaimer: string;
}

export interface PropFirmRule {
  accountSize: number;           // e.g. 100000
  profitTarget: number;          // e.g. 6000
  dailyLossLimit: number;        // e.g. 2000
  maxDrawdown: number;           // e.g. 3000
  drawdownType: DrawdownType;
  minTradingDays: number;        // e.g. 5
  maxContracts: number;          // e.g. 10
  consistencyRule: boolean;      // e.g. max 30% profit in single day
  riskPerTrade: number;          // USD or R equiv
}

export interface PropSimulationPath {
  simId: number;
  days: number;
  finalEquity: number;
  maxDrawdown: number;
  status: 'PASSED' | 'FAILED' | 'ACTIVE';
  dailyEquities: number[];
}

export interface PropSimulationResult {
  strategyId: string;
  strategyName: string;
  rules: PropFirmRule;
  passProbability: number;       // %
  failureProbability: number;    // %
  medianDaysToPass: number;
  expectedMaxDD: number;         // USD
  longestLosingStreak: number;
  mostCommonFailureReason: string;
  dailyLossViolationRisk: number;// %
  propFriendlyScore: number;     // 0-100
  totalSimulations: number;
  paths: PropSimulationPath[];
  isDemoSimulation: boolean;
}

export interface Dataset {
  id: string;
  symbol: string;
  market: Market;
  contractType: ContractType;
  resolution: string;
  startDate: string;
  endDate: string;
  rows: number;
  missingDataPct: number;
  timezone: string;
  status: 'VERIFIED' | 'NEEDS_RESYNC' | 'MOCK';
  fileSizeMb: number;
}

export interface CSVPreviewRow {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  market: string;
  timezone: string;
}
