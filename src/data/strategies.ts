/**
 * No-Brain EV Lab — Starter Strategies & Research Database
 * All metrics clearly annotated as DEMO / MOCK simulation datasets.
 */

import { Strategy, EquityPoint, DrawdownPoint, RollingEdgePoint, YearlyPerformance, OOSPartitionSummary, ParameterStabilityCell } from '../types';

/**
 * Generate synthetic realistic trade equity curve
 */
function generateSyntheticEquity(
  seed: number, 
  totalTrades: number, 
  evPerTrade: number, 
  winRate: number,
  decayTrend: boolean = false
): { equity: EquityPoint[]; drawdown: DrawdownPoint[]; rolling: RollingEdgePoint[] } {
  const equity: EquityPoint[] = [];
  const drawdown: DrawdownPoint[] = [];
  const rolling: RollingEdgePoint[] = [];
  
  let cumR = 0;
  let peakR = 0;
  const recentTrades: number[] = [];
  
  const startDate = new Date(2021, 0, 15);
  
  for (let i = 1; i <= totalTrades; i++) {
    // Determine segment
    const progress = i / totalTrades;
    let segment: 'TRAIN' | 'VALIDATION' | 'OOS' | 'FORWARD' = 'TRAIN';
    if (progress > 0.85) segment = 'FORWARD';
    else if (progress > 0.65) segment = 'OOS';
    else if (progress > 0.45) segment = 'VALIDATION';
    
    // Simulate trade outcome with noise
    const pseudoRandom = Math.sin(seed * 9999 + i * 133.7);
    const normalizedRand = (pseudoRandom + 1) / 2;
    
    let currentEV = evPerTrade;
    if (decayTrend && progress > 0.5) {
      // simulate decaying edge
      currentEV = evPerTrade * (1 - (progress - 0.5) * 2.5);
    }
    
    const isWin = normalizedRand < winRate;
    let rMultiple = isWin 
      ? 1.0 + Math.abs(Math.sin(i * 3.14)) * 0.8 + currentEV
      : -1.0 + Math.min(0, Math.sin(i * 7.77) * 0.2);
      
    cumR += rMultiple;
    if (cumR > peakR) peakR = cumR;
    const ddR = peakR - cumR;
    const ddPct = peakR > 0 ? (ddR / peakR) * 100 : 0;
    
    recentTrades.push(rMultiple);
    
    // Date calculation
    const currentDate = new Date(startDate.getTime() + (i * 2.1 * 24 * 60 * 60 * 1000));
    const dateStr = currentDate.toISOString().split('T')[0];
    
    equity.push({
      tradeNumber: i,
      date: dateStr,
      cumulativeR: Number(cumR.toFixed(2)),
      segment,
    });
    
    drawdown.push({
      tradeNumber: i,
      date: dateStr,
      drawdownR: Number((-ddR).toFixed(2)),
      underwaterPercent: Number(ddPct.toFixed(1)),
    });
    
    // Rolling EV calculation
    const r20Slice = recentTrades.slice(-20);
    const r50Slice = recentTrades.slice(-50);
    const r100Slice = recentTrades.slice(-100);
    
    const r20 = r20Slice.reduce((a, b) => a + b, 0) / r20Slice.length;
    const r50 = r50Slice.reduce((a, b) => a + b, 0) / r50Slice.length;
    const r100 = r100Slice.reduce((a, b) => a + b, 0) / r100Slice.length;
    const overall = cumR / i;
    
    rolling.push({
      tradeNumber: i,
      date: dateStr,
      rolling20EV: Number(r20.toFixed(3)),
      rolling50EV: Number(r50.toFixed(3)),
      rolling100EV: Number(r100.toFixed(3)),
      overallEV: Number(overall.toFixed(3)),
    });
  }
  
  return { equity, drawdown, rolling };
}

// Strategy 1: NQ Fixed-Time Momentum (NQ-FTM-001)
const nqSynth = generateSyntheticEquity(42, 320, 0.18, 0.542, false);
export const STRATEGY_NQ_FTM: Strategy = {
  id: 'NQ-FTM-001',
  name: 'NQ Fixed-Time Momentum',
  market: 'NQ',
  category: 'FIXED_TIME_MOMENTUM',
  hypothesis: '09:30 ET opening liquidity flow establishes institutional morning direction. Return between 09:30 ET and 10:00 ET predicts continuation into midday auction.',
  edgeExplanation: 'Institutional index rebalancing and morning VWAP algorithms execute volume in waves following the opening bell. A non-arbitrary 30-minute return filter removes opening noise while capturing genuine momentum imbalance.',
  entryRules: [
    'At 10:00:00 ET sharp, compute Opening 30-Min Return = (Price_1000 - Open_0930) / Open_0930',
    'If Return > +0.25% (Threshold) → ENTER LONG at Market at 10:00:01 ET',
    'If Return < -0.25% (-Threshold) → ENTER SHORT at Market at 10:00:01 ET',
    'If |Return| <= 0.25% → NO TRADE for the day',
  ],
  exitRules: [
    'Hard Fixed-Time Exit: Close 100% position at 11:30:00 ET (or optional End-of-Day 15:55 ET)',
    'Emergency Protective Stop: 1.5R (calculated as fixed 45 index points on NQ)',
    'No trailing stops or discretion permitted.',
  ],
  parameters: {
    momentumWindowMins: 30,
    thresholdPct: 0.25,
    holdDurationMins: 90,
    maxDailyLossR: 1.5,
  },
  parameterSpecs: [
    { name: 'Threshold %', key: 'thresholdPct', type: 'number', default: 0.25, min: 0.05, max: 0.60, step: 0.05, unit: '%' },
    { name: 'Window Duration', key: 'momentumWindowMins', type: 'number', default: 30, min: 15, max: 60, step: 15, unit: 'mins' },
    { name: 'Holding Duration', key: 'holdDurationMins', type: 'number', default: 90, min: 30, max: 240, step: 30, unit: 'mins' },
    { name: 'Max Stop Loss (R)', key: 'maxDailyLossR', type: 'number', default: 1.5, min: 1.0, max: 3.0, step: 0.5, unit: 'R' },
  ],
  complexityScore: 2,
  complexityBreakdown: {
    entryConditions: 1,
    indicatorsCount: 0,
    parametersCount: 2,
    marketsRequired: 1,
    intradayReactionRequired: false,
    manualJudgmentRequired: false,
  },
  executionFrictionScore: 1,
  executionFrictionBreakdown: {
    chaseSlippageRisk: 1,
    reactionSpeedRequired: 'Fixed-Time',
    fixedTimeEntry: true,
    limitOrderFriendly: true,
    multiMarketScreening: false,
    manualDiscretionRequired: false,
  },
  status: 'RESEARCH',
  edgeHealth: 'UNKNOWN',
  oosResult: 'NOT_ELIGIBLE',
  dataRequirements: ['NQ 1-minute OHLCV (Continuous or active contract)', 'ET Timezone Clock'],
  maxTradesPerDay: 1,
  metrics: {
    evPerTrade: 0.18,
    profitFactor: 1.42,
    winRate: 54.2,
    maxDrawdownR: 5.2,
    sharpeRatio: 1.48,
    totalTrades: 320,
    avgWinR: 1.38,
    avgLossR: 0.98,
    worstDayR: -1.5,
    worstWeekR: -3.2,
    maxConsecutiveLosses: 4,
    historicalEV: 0.18,
    rolling100EV: 0.19,
    rolling50EV: 0.17,
    rolling20EV: 0.21,
    historicalPF: 1.42,
    recentPF: 1.46,
    historicalWinRate: 54.2,
    recentWinRate: 55.0,
    currentDrawdownR: 1.2,
    tournament: {
      totalScore: 89,
      oosEvScore: 22,
      stabilityScore: 19,
      maxDdScore: 14,
      edgeHealthScore: 14,
      propSurvivalScore: 15,
      executionSimplicityScore: 5,
      complexityScore: 5,
    },
    propFriendlyScore: 92,
  },
  equityCurve: nqSynth.equity,
  drawdownCurve: nqSynth.drawdown,
  rollingEdge: nqSynth.rolling,
  yearlyPerformance: [
    { year: 2021, trades: 64, ev: 0.19, profitFactor: 1.45, maxDrawdownR: 4.1, winRate: 54.7 },
    { year: 2022, trades: 65, ev: 0.16, profitFactor: 1.38, maxDrawdownR: 5.2, winRate: 53.8 },
    { year: 2023, trades: 63, ev: 0.21, profitFactor: 1.49, maxDrawdownR: 3.8, winRate: 55.5 },
    { year: 2024, trades: 64, ev: 0.18, profitFactor: 1.41, maxDrawdownR: 4.6, winRate: 54.0 },
    { year: 2025, trades: 52, ev: 0.17, profitFactor: 1.40, maxDrawdownR: 4.3, winRate: 53.8 },
    { year: 2026, trades: 12, ev: 0.20, profitFactor: 1.47, maxDrawdownR: 1.8, winRate: 58.3 },
  ],
  oosPartitions: [
    { segment: 'TRAIN', period: '2021-01 to 2022-12', trades: 144, ev: 0.18, profitFactor: 1.42, winRate: 54.2, maxDrawdownR: 5.2, status: 'PASS' },
    { segment: 'VALIDATION', period: '2023-01 to 2023-12', trades: 64, ev: 0.21, profitFactor: 1.49, winRate: 55.5, maxDrawdownR: 3.8, status: 'PASS' },
    { segment: 'OOS', period: '2024-01 to 2024-12', trades: 64, ev: 0.18, profitFactor: 1.41, winRate: 54.0, maxDrawdownR: 4.6, status: 'PASS' },
    { segment: 'FORWARD', period: '2025-01 to 2026-08', trades: 48, ev: 0.17, profitFactor: 1.41, winRate: 54.2, maxDrawdownR: 4.3, status: 'PASS' },
  ],
  parameterStability: [
    { paramKey: 'thresholdPct', paramValue: 0.10, label: '0.10%', ev: 0.11, profitFactor: 1.18, maxDrawdownR: 7.8, totalTrades: 480, winRate: 51.5, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.15, label: '0.15%', ev: 0.14, profitFactor: 1.28, maxDrawdownR: 6.4, totalTrades: 410, winRate: 52.8, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.20, label: '0.20%', ev: 0.17, profitFactor: 1.38, maxDrawdownR: 5.6, totalTrades: 360, winRate: 53.9, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.25, label: '0.25%', ev: 0.18, profitFactor: 1.42, maxDrawdownR: 5.2, totalTrades: 320, winRate: 54.2, isCurrent: true, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.30, label: '0.30%', ev: 0.19, profitFactor: 1.44, maxDrawdownR: 5.1, totalTrades: 275, winRate: 54.6, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.35, label: '0.35%', ev: 0.16, profitFactor: 1.37, maxDrawdownR: 5.9, totalTrades: 220, winRate: 53.6, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.40, label: '0.40%', ev: 0.13, profitFactor: 1.29, maxDrawdownR: 6.8, totalTrades: 170, winRate: 52.9, isCurrent: false, isOverfitRisk: false, isPlateau: false },
    { paramKey: 'thresholdPct', paramValue: 0.50, label: '0.50%', ev: 0.08, profitFactor: 1.14, maxDrawdownR: 8.2, totalTrades: 95, winRate: 51.0, isCurrent: false, isOverfitRisk: false, isPlateau: false },
  ],
};

// Strategy 2: Gold London -> New York Handoff (GC-LNY-001)
const gcSynth = generateSyntheticEquity(77, 280, 0.14, 0.521, false);
export const STRATEGY_GC_LNY: Strategy = {
  id: 'GC-LNY-001',
  name: 'Gold London → New York Handoff',
  market: 'GC',
  category: 'SESSION_HANDOFF',
  hypothesis: 'Gold session transition between London (03:00-08:00 ET) and NY COMEX opening (08:20 ET). Tests whether London direction continues (Momentum) or exhausts (Reversal) into the New York session.',
  edgeExplanation: 'Physical bullion fix in London creates morning order imbalance. New York open participants either amplify the trend or absorb extreme moves depending on macro risk environment.',
  entryRules: [
    'Calculate London Return = (Price_0800 - Price_0300) / Price_0300 ET',
    'Select Hypothesis Mode in parameters (Default: Reversal)',
    'If Mode = Reversal: London UP (> +0.30%) → NY SHORT at 08:20 ET; London DOWN (< -0.30%) → NY LONG at 08:20 ET',
    'If Mode = Momentum: London UP (> +0.30%) → NY LONG at 08:20 ET; London DOWN (< -0.30%) → NY SHORT at 08:20 ET',
  ],
  exitRules: [
    'Fixed Time Exit at 13:30 ET (COMEX pit close window)',
    'Hard stop at 1.2R (fixed $12 GC move)',
  ],
  parameters: {
    hypothesisMode: 'REVERSAL',
    thresholdPct: 0.30,
    londonStartET: '03:00',
    londonEndET: '08:00',
    nyEntryET: '08:20',
  },
  parameterSpecs: [
    { 
      name: 'Hypothesis Mode', 
      key: 'hypothesisMode', 
      type: 'select', 
      default: 'REVERSAL', 
      options: [
        { label: 'Reversal (Mean Revert London Move)', value: 'REVERSAL' },
        { label: 'Momentum (Follow London Move)', value: 'MOMENTUM' }
      ] 
    },
    { name: 'London Threshold %', key: 'thresholdPct', type: 'number', default: 0.30, min: 0.10, max: 0.80, step: 0.05, unit: '%' },
    { name: 'Hold Until (ET)', key: 'exitTimeET', type: 'select', default: '13:30', options: [
      { label: '12:00 ET', value: '12:00' },
      { label: '13:30 ET (Pit Close)', value: '13:30' },
      { label: '16:00 ET (Session Close)', value: '16:00' }
    ]}
  ],
  complexityScore: 3,
  complexityBreakdown: {
    entryConditions: 2,
    indicatorsCount: 0,
    parametersCount: 2,
    marketsRequired: 1,
    intradayReactionRequired: false,
    manualJudgmentRequired: false,
  },
  executionFrictionScore: 2,
  executionFrictionBreakdown: {
    chaseSlippageRisk: 2,
    reactionSpeedRequired: 'Fixed-Time',
    fixedTimeEntry: true,
    limitOrderFriendly: true,
    multiMarketScreening: false,
    manualDiscretionRequired: false,
  },
  status: 'RESEARCH',
  edgeHealth: 'UNKNOWN',
  oosResult: 'NOT_ELIGIBLE',
  dataRequirements: ['GC / MGC Gold Futures 5-minute OHLCV', 'London Session Calendar'],
  maxTradesPerDay: 1,
  metrics: {
    evPerTrade: 0.14,
    profitFactor: 1.31,
    winRate: 52.1,
    maxDrawdownR: 6.8,
    sharpeRatio: 1.15,
    totalTrades: 280,
    avgWinR: 1.45,
    avgLossR: 1.05,
    worstDayR: -1.2,
    worstWeekR: -3.8,
    maxConsecutiveLosses: 5,
    historicalEV: 0.14,
    rolling100EV: 0.13,
    rolling50EV: 0.11,
    rolling20EV: 0.08,
    historicalPF: 1.31,
    recentPF: 1.22,
    historicalWinRate: 52.1,
    recentWinRate: 50.0,
    currentDrawdownR: 3.4,
    tournament: {
      totalScore: 71,
      oosEvScore: 16,
      stabilityScore: 15,
      maxDdScore: 11,
      edgeHealthScore: 10,
      propSurvivalScore: 11,
      executionSimplicityScore: 4,
      complexityScore: 4,
    },
    propFriendlyScore: 74,
  },
  equityCurve: gcSynth.equity,
  drawdownCurve: gcSynth.drawdown,
  rollingEdge: gcSynth.rolling,
  yearlyPerformance: [
    { year: 2021, trades: 55, ev: 0.16, profitFactor: 1.35, maxDrawdownR: 5.1, winRate: 53.0 },
    { year: 2022, trades: 58, ev: 0.15, profitFactor: 1.32, maxDrawdownR: 5.8, winRate: 52.5 },
    { year: 2023, trades: 54, ev: 0.17, profitFactor: 1.39, maxDrawdownR: 4.8, winRate: 54.1 },
    { year: 2024, trades: 56, ev: 0.12, profitFactor: 1.25, maxDrawdownR: 6.8, winRate: 50.5 },
    { year: 2025, trades: 45, ev: 0.10, profitFactor: 1.21, maxDrawdownR: 6.2, winRate: 49.8 },
    { year: 2026, trades: 12, ev: 0.08, profitFactor: 1.18, maxDrawdownR: 3.4, winRate: 50.0 },
  ],
  oosPartitions: [
    { segment: 'TRAIN', period: '2021-01 to 2022-12', trades: 120, ev: 0.16, profitFactor: 1.34, winRate: 53.0, maxDrawdownR: 5.8, status: 'PASS' },
    { segment: 'VALIDATION', period: '2023-01 to 2023-12', trades: 54, ev: 0.17, profitFactor: 1.39, winRate: 54.1, maxDrawdownR: 4.8, status: 'PASS' },
    { segment: 'OOS', period: '2024-01 to 2024-12', trades: 56, ev: 0.12, profitFactor: 1.25, winRate: 50.5, maxDrawdownR: 6.8, status: 'WATCH' },
    { segment: 'FORWARD', period: '2025-01 to 2026-08', trades: 50, ev: 0.09, profitFactor: 1.20, winRate: 49.5, maxDrawdownR: 6.2, status: 'WATCH' },
  ],
  parameterStability: [
    { paramKey: 'thresholdPct', paramValue: 0.15, label: '0.15%', ev: 0.06, profitFactor: 1.11, maxDrawdownR: 9.4, totalTrades: 420, winRate: 49.5, isCurrent: false, isOverfitRisk: false, isPlateau: false },
    { paramKey: 'thresholdPct', paramValue: 0.20, label: '0.20%', ev: 0.10, profitFactor: 1.21, maxDrawdownR: 7.9, totalTrades: 360, winRate: 50.8, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.25, label: '0.25%', ev: 0.13, profitFactor: 1.28, maxDrawdownR: 7.1, totalTrades: 310, winRate: 51.6, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.30, label: '0.30%', ev: 0.14, profitFactor: 1.31, maxDrawdownR: 6.8, totalTrades: 280, winRate: 52.1, isCurrent: true, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.35, label: '0.35%', ev: 0.13, profitFactor: 1.29, maxDrawdownR: 7.0, totalTrades: 230, winRate: 51.8, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.40, label: '0.40%', ev: 0.11, profitFactor: 1.23, maxDrawdownR: 7.5, totalTrades: 190, winRate: 51.0, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'thresholdPct', paramValue: 0.50, label: '0.50%', ev: 0.05, profitFactor: 1.09, maxDrawdownR: 9.8, totalTrades: 120, winRate: 49.0, isCurrent: false, isOverfitRisk: false, isPlateau: false },
  ],
};

// Strategy 3: Crypto Residual Momentum (CR-RM-001)
const crSynth = generateSyntheticEquity(108, 410, 0.22, 0.558, false);
export const STRATEGY_CR_RM: Strategy = {
  id: 'CR-RM-001',
  name: 'Crypto Residual Momentum',
  market: 'CRYPTO',
  category: 'RESIDUAL_MOMENTUM',
  hypothesis: 'Isolating asset-specific idiosyncratic return by subtracting beta-adjusted market return (Residual = Coin Return - Beta * BTC Return) creates cross-sectional momentum that is dollar-neutral to broad market crashes.',
  edgeExplanation: 'Altcoins exhibit lead-lag and retail attention spillover. Raw momentum is 85% dominated by BTC market beta; residual momentum strips out systemic beta noise to extract pure alpha.',
  entryRules: [
    'Daily at 00:00 UTC, calculate 30-day Rolling Beta of top 30 liquid perpetuals against BTC',
    'Compute 24h Residual Return = Asset_Return_24h - (Beta * BTC_Return_24h)',
    'Rank cross-section: LONG Top 3 coins with highest Residual Return',
    'SHORT Bottom 3 coins with lowest Residual Return',
    'Equal weight allocation (16.6% per leg) rebalanced daily at 00:05 UTC',
  ],
  exitRules: [
    'Rebalance every 24 hours at 00:00 UTC',
    'If an asset drops out of Top/Bottom 5 at daily review, rotate out at market',
  ],
  parameters: {
    topN: 3,
    betaLookbackDays: 30,
    momentumLookbackHours: 24,
    rebalanceIntervalHours: 24,
  },
  parameterSpecs: [
    { name: 'Top / Bottom N Assets', key: 'topN', type: 'number', default: 3, min: 2, max: 10, step: 1, unit: 'coins' },
    { name: 'Beta Lookback', key: 'betaLookbackDays', type: 'number', default: 30, min: 14, max: 90, step: 7, unit: 'days' },
    { name: 'Return Window', key: 'momentumLookbackHours', type: 'number', default: 24, min: 4, max: 72, step: 4, unit: 'hours' },
  ],
  complexityScore: 5,
  complexityBreakdown: {
    entryConditions: 2,
    indicatorsCount: 1, // Beta linear regression
    parametersCount: 3,
    marketsRequired: 30, // Cross-sectional universe
    intradayReactionRequired: false,
    manualJudgmentRequired: false,
  },
  executionFrictionScore: 4,
  executionFrictionBreakdown: {
    chaseSlippageRisk: 4,
    reactionSpeedRequired: 'Minutes',
    fixedTimeEntry: true,
    limitOrderFriendly: true,
    multiMarketScreening: true,
    manualDiscretionRequired: false,
  },
  status: 'RESEARCH',
  edgeHealth: 'UNKNOWN',
  oosResult: 'NOT_ELIGIBLE',
  dataRequirements: ['Top 30 Crypto Perpetual 1-hour OHLCV', 'BTC Reference Index', 'Funding rate feed'],
  maxTradesPerDay: 6,
  metrics: {
    evPerTrade: 0.22,
    profitFactor: 1.55,
    winRate: 55.8,
    maxDrawdownR: 7.4,
    sharpeRatio: 1.62,
    totalTrades: 410,
    avgWinR: 1.52,
    avgLossR: 0.94,
    worstDayR: -2.1,
    worstWeekR: -4.5,
    maxConsecutiveLosses: 4,
    historicalEV: 0.22,
    rolling100EV: 0.24,
    rolling50EV: 0.21,
    rolling20EV: 0.25,
    historicalPF: 1.55,
    recentPF: 1.59,
    historicalWinRate: 55.8,
    recentWinRate: 56.5,
    currentDrawdownR: 2.1,
    tournament: {
      totalScore: 84,
      oosEvScore: 24,
      stabilityScore: 18,
      maxDdScore: 12,
      edgeHealthScore: 15,
      propSurvivalScore: 8, // multi-coin crypto harder for standard prop firms
      executionSimplicityScore: 3,
      complexityScore: 4,
    },
    propFriendlyScore: 68,
  },
  equityCurve: crSynth.equity,
  drawdownCurve: crSynth.drawdown,
  rollingEdge: crSynth.rolling,
  yearlyPerformance: [
    { year: 2021, trades: 80, ev: 0.28, profitFactor: 1.72, maxDrawdownR: 6.2, winRate: 58.2 },
    { year: 2022, trades: 82, ev: 0.24, profitFactor: 1.58, maxDrawdownR: 7.4, winRate: 56.1 },
    { year: 2023, trades: 84, ev: 0.20, profitFactor: 1.48, maxDrawdownR: 6.8, winRate: 54.8 },
    { year: 2024, trades: 82, ev: 0.21, profitFactor: 1.52, maxDrawdownR: 5.9, winRate: 55.0 },
    { year: 2025, trades: 68, ev: 0.19, profitFactor: 1.46, maxDrawdownR: 6.4, winRate: 54.4 },
    { year: 2026, trades: 14, ev: 0.23, profitFactor: 1.57, maxDrawdownR: 2.1, winRate: 57.1 },
  ],
  oosPartitions: [
    { segment: 'TRAIN', period: '2021-01 to 2022-12', trades: 170, ev: 0.26, profitFactor: 1.65, winRate: 57.1, maxDrawdownR: 7.4, status: 'PASS' },
    { segment: 'VALIDATION', period: '2023-01 to 2023-12', trades: 84, ev: 0.20, profitFactor: 1.48, winRate: 54.8, maxDrawdownR: 6.8, status: 'PASS' },
    { segment: 'OOS', period: '2024-01 to 2024-12', trades: 82, ev: 0.21, profitFactor: 1.52, winRate: 55.0, maxDrawdownR: 5.9, status: 'PASS' },
    { segment: 'FORWARD', period: '2025-01 to 2026-08', trades: 74, ev: 0.19, profitFactor: 1.47, winRate: 54.9, maxDrawdownR: 6.4, status: 'PASS' },
  ],
  parameterStability: [
    { paramKey: 'topN', paramValue: 1, label: 'Top 1', ev: 0.14, profitFactor: 1.25, maxDrawdownR: 12.2, totalTrades: 410, winRate: 51.2, isCurrent: false, isOverfitRisk: true, isPlateau: false },
    { paramKey: 'topN', paramValue: 2, label: 'Top 2', ev: 0.19, profitFactor: 1.45, maxDrawdownR: 8.6, totalTrades: 410, winRate: 54.0, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'topN', paramValue: 3, label: 'Top 3', ev: 0.22, profitFactor: 1.55, maxDrawdownR: 7.4, totalTrades: 410, winRate: 55.8, isCurrent: true, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'topN', paramValue: 4, label: 'Top 4', ev: 0.21, profitFactor: 1.51, maxDrawdownR: 7.0, totalTrades: 410, winRate: 55.2, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'topN', paramValue: 5, label: 'Top 5', ev: 0.18, profitFactor: 1.43, maxDrawdownR: 6.8, totalTrades: 410, winRate: 54.5, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'topN', paramValue: 8, label: 'Top 8', ev: 0.12, profitFactor: 1.27, maxDrawdownR: 6.5, totalTrades: 410, winRate: 52.8, isCurrent: false, isOverfitRisk: false, isPlateau: false },
  ],
};

// Strategy 4 (Decaying Edge Example): NQ Overnight Midpoint Bias (NQ-OMB-001)
const decayingSynth = generateSyntheticEquity(314, 290, 0.24, 0.58, true);
export const STRATEGY_NQ_OMB: Strategy = {
  id: 'NQ-OMB-001',
  name: 'NQ Overnight Midpoint Bias',
  market: 'NQ',
  category: 'BENCHMARK',
  hypothesis: 'Trading in the direction of the Globex overnight range midpoint breakout at cash market open.',
  edgeExplanation: 'Formerly effective during 2021-2022 high volatility regime; edge has undergone severe structural decay due to algorithmic crowdedness in Globex inventory matching.',
  entryRules: [
    'Calculate Globex Range 18:00 - 09:15 ET High, Low, Midpoint',
    'If 09:30 Open > Midpoint + 20pts → Long at Open',
    'If 09:30 Open < Midpoint - 20pts → Short at Open',
  ],
  exitRules: [
    'Exit at 10:30 ET',
    'Stop loss at opposite midpoint',
  ],
  parameters: {
    offsetPoints: 20,
    exitTime: '10:30',
  },
  parameterSpecs: [
    { name: 'Offset Points', key: 'offsetPoints', type: 'number', default: 20, min: 5, max: 50, step: 5, unit: 'pts' },
  ],
  complexityScore: 4,
  complexityBreakdown: {
    entryConditions: 2,
    indicatorsCount: 1,
    parametersCount: 2,
    marketsRequired: 1,
    intradayReactionRequired: true,
    manualJudgmentRequired: false,
  },
  executionFrictionScore: 5,
  executionFrictionBreakdown: {
    chaseSlippageRisk: 6,
    reactionSpeedRequired: 'Seconds',
    fixedTimeEntry: false,
    limitOrderFriendly: false,
    multiMarketScreening: false,
    manualDiscretionRequired: false,
  },
  status: 'RESEARCH',
  edgeHealth: 'UNKNOWN',
  oosResult: 'NOT_ELIGIBLE',
  dataRequirements: ['NQ Full 24h Globex Tick Data'],
  maxTradesPerDay: 1,
  metrics: {
    evPerTrade: 0.02,
    profitFactor: 1.04,
    winRate: 48.2,
    maxDrawdownR: 11.4,
    sharpeRatio: 0.15,
    totalTrades: 290,
    avgWinR: 1.15,
    avgLossR: 1.10,
    worstDayR: -2.4,
    worstWeekR: -5.8,
    maxConsecutiveLosses: 7,
    historicalEV: 0.19,
    rolling100EV: 0.04,
    rolling50EV: -0.02,
    rolling20EV: -0.06,
    historicalPF: 1.38,
    recentPF: 0.92,
    historicalWinRate: 53.0,
    recentWinRate: 44.0,
    currentDrawdownR: 9.8,
    tournament: {
      totalScore: 42,
      oosEvScore: 4,
      stabilityScore: 6,
      maxDdScore: 4,
      edgeHealthScore: 2,
      propSurvivalScore: 4,
      executionSimplicityScore: 4,
      complexityScore: 4,
    },
    propFriendlyScore: 38,
  },
  equityCurve: decayingSynth.equity,
  drawdownCurve: decayingSynth.drawdown,
  rollingEdge: decayingSynth.rolling,
  yearlyPerformance: [
    { year: 2021, trades: 60, ev: 0.30, profitFactor: 1.68, maxDrawdownR: 4.2, winRate: 58.0 },
    { year: 2022, trades: 62, ev: 0.25, profitFactor: 1.54, maxDrawdownR: 5.1, winRate: 56.4 },
    { year: 2023, trades: 58, ev: 0.18, profitFactor: 1.36, maxDrawdownR: 6.8, winRate: 53.2 },
    { year: 2024, trades: 55, ev: 0.04, profitFactor: 1.07, maxDrawdownR: 9.2, winRate: 48.0 },
    { year: 2025, trades: 45, ev: -0.02, profitFactor: 0.95, maxDrawdownR: 11.4, winRate: 45.1 },
    { year: 2026, trades: 10, ev: -0.08, profitFactor: 0.88, maxDrawdownR: 4.6, winRate: 40.0 },
  ],
  oosPartitions: [
    { segment: 'TRAIN', period: '2021-01 to 2022-12', trades: 122, ev: 0.27, profitFactor: 1.61, winRate: 57.2, maxDrawdownR: 5.1, status: 'PASS' },
    { segment: 'VALIDATION', period: '2023-01 to 2023-12', trades: 58, ev: 0.18, profitFactor: 1.36, winRate: 53.2, maxDrawdownR: 6.8, status: 'WATCH' },
    { segment: 'OOS', period: '2024-01 to 2024-12', trades: 55, ev: 0.04, profitFactor: 1.07, winRate: 48.0, maxDrawdownR: 9.2, status: 'FAIL' },
    { segment: 'FORWARD', period: '2025-01 to 2026-08', trades: 55, ev: -0.03, profitFactor: 0.93, winRate: 44.2, maxDrawdownR: 11.4, status: 'FAIL' },
  ],
  parameterStability: [
    { paramKey: 'offsetPoints', paramValue: 10, label: '10 pts', ev: -0.04, profitFactor: 0.92, maxDrawdownR: 13.5, totalTrades: 380, winRate: 46.0, isCurrent: false, isOverfitRisk: false, isPlateau: false },
    { paramKey: 'offsetPoints', paramValue: 15, label: '15 pts', ev: -0.01, profitFactor: 0.98, maxDrawdownR: 12.1, totalTrades: 330, winRate: 47.5, isCurrent: false, isOverfitRisk: false, isPlateau: false },
    { paramKey: 'offsetPoints', paramValue: 20, label: '20 pts', ev: 0.02, profitFactor: 1.04, maxDrawdownR: 11.4, totalTrades: 290, winRate: 48.2, isCurrent: true, isOverfitRisk: false, isPlateau: false },
    { paramKey: 'offsetPoints', paramValue: 25, label: '25 pts', ev: -0.02, profitFactor: 0.96, maxDrawdownR: 11.9, totalTrades: 250, winRate: 47.0, isCurrent: false, isOverfitRisk: false, isPlateau: false },
    { paramKey: 'offsetPoints', paramValue: 30, label: '30 pts', ev: -0.06, profitFactor: 0.89, maxDrawdownR: 13.8, totalTrades: 210, winRate: 45.5, isCurrent: false, isOverfitRisk: false, isPlateau: false },
  ],
};

// Strategy 5 (Idea Stage): Gold Asian Session Seasonality (GC-SEA-001)
const gcSeaSynth = generateSyntheticEquity(512, 140, 0.09, 0.505, false);
export const STRATEGY_GC_SEA: Strategy = {
  id: 'GC-SEA-001',
  name: 'Gold Asian Session Seasonality',
  market: 'GC',
  category: 'SEASONALITY',
  hypothesis: 'Tokyo / Shanghai physical gold premium pricing arbitrage into London pre-market.',
  edgeExplanation: 'Asian central bank physical buying windows tend to concentrate in early morning Asian hours. Hypothesis is under exploratory phase.',
  entryRules: [
    'Enter at 20:00 ET (Tokyo Open)',
    'Long if Gold is above Asian session 10-period EMA',
  ],
  exitRules: [
    'Exit at 02:30 ET (London pre-market handover)',
  ],
  parameters: {
    emaPeriod: 10,
  },
  parameterSpecs: [
    { name: 'EMA Period', key: 'emaPeriod', type: 'number', default: 10, min: 5, max: 30, step: 5 },
  ],
  complexityScore: 3,
  complexityBreakdown: {
    entryConditions: 1,
    indicatorsCount: 1,
    parametersCount: 1,
    marketsRequired: 1,
    intradayReactionRequired: false,
    manualJudgmentRequired: false,
  },
  executionFrictionScore: 2,
  executionFrictionBreakdown: {
    chaseSlippageRisk: 2,
    reactionSpeedRequired: 'Fixed-Time',
    fixedTimeEntry: true,
    limitOrderFriendly: true,
    multiMarketScreening: false,
    manualDiscretionRequired: false,
  },
  status: 'RESEARCH',
  edgeHealth: 'UNKNOWN',
  oosResult: 'NOT_ELIGIBLE',
  dataRequirements: ['GC Asian Session 15m OHLCV'],
  maxTradesPerDay: 1,
  metrics: {
    evPerTrade: 0.09,
    profitFactor: 1.18,
    winRate: 50.5,
    maxDrawdownR: 8.2,
    sharpeRatio: 0.88,
    totalTrades: 140,
    avgWinR: 1.25,
    avgLossR: 1.05,
    worstDayR: -1.0,
    worstWeekR: -3.2,
    maxConsecutiveLosses: 5,
    historicalEV: 0.09,
    rolling100EV: 0.10,
    rolling50EV: 0.08,
    rolling20EV: 0.11,
    historicalPF: 1.18,
    recentPF: 1.20,
    historicalWinRate: 50.5,
    recentWinRate: 51.0,
    currentDrawdownR: 3.1,
    tournament: {
      totalScore: 62,
      oosEvScore: 12,
      stabilityScore: 14,
      maxDdScore: 10,
      edgeHealthScore: 12,
      propSurvivalScore: 10,
      executionSimplicityScore: 4,
      complexityScore: 5,
    },
    propFriendlyScore: 65,
  },
  equityCurve: gcSeaSynth.equity,
  drawdownCurve: gcSeaSynth.drawdown,
  rollingEdge: gcSeaSynth.rolling,
  yearlyPerformance: [
    { year: 2023, trades: 50, ev: 0.11, profitFactor: 1.22, maxDrawdownR: 5.4, winRate: 51.5 },
    { year: 2024, trades: 52, ev: 0.08, profitFactor: 1.16, maxDrawdownR: 6.8, winRate: 49.8 },
    { year: 2025, trades: 30, ev: 0.09, profitFactor: 1.17, maxDrawdownR: 4.8, winRate: 50.2 },
    { year: 2026, trades: 8, ev: 0.12, profitFactor: 1.25, maxDrawdownR: 1.5, winRate: 55.0 },
  ],
  oosPartitions: [
    { segment: 'TRAIN', period: '2023-01 to 2023-12', trades: 50, ev: 0.11, profitFactor: 1.22, winRate: 51.5, maxDrawdownR: 5.4, status: 'PASS' },
    { segment: 'VALIDATION', period: '2024-01 to 2024-06', trades: 26, ev: 0.08, profitFactor: 1.16, winRate: 50.0, maxDrawdownR: 4.8, status: 'WATCH' },
    { segment: 'OOS', period: '2024-07 to 2025-06', trades: 45, ev: 0.08, profitFactor: 1.15, winRate: 49.5, maxDrawdownR: 6.8, status: 'WATCH' },
    { segment: 'FORWARD', period: '2025-07 to 2026-08', trades: 19, ev: 0.10, profitFactor: 1.19, winRate: 51.0, maxDrawdownR: 3.2, status: 'PASS' },
  ],
  parameterStability: [
    { paramKey: 'emaPeriod', paramValue: 5, label: 'EMA 5', ev: 0.04, profitFactor: 1.08, maxDrawdownR: 10.2, totalTrades: 190, winRate: 48.5, isCurrent: false, isOverfitRisk: false, isPlateau: false },
    { paramKey: 'emaPeriod', paramValue: 10, label: 'EMA 10', ev: 0.09, profitFactor: 1.18, maxDrawdownR: 8.2, totalTrades: 140, winRate: 50.5, isCurrent: true, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'emaPeriod', paramValue: 15, label: 'EMA 15', ev: 0.08, profitFactor: 1.16, maxDrawdownR: 8.5, totalTrades: 120, winRate: 50.0, isCurrent: false, isOverfitRisk: false, isPlateau: true },
    { paramKey: 'emaPeriod', paramValue: 20, label: 'EMA 20', ev: 0.07, profitFactor: 1.14, maxDrawdownR: 9.1, totalTrades: 105, winRate: 49.2, isCurrent: false, isOverfitRisk: false, isPlateau: true },
  ],
};

export const ALL_STRATEGIES: Strategy[] = [
  STRATEGY_NQ_FTM,
  STRATEGY_GC_LNY,
  STRATEGY_CR_RM,
  STRATEGY_NQ_OMB,
  STRATEGY_GC_SEA,
];
