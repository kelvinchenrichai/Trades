/**
 * No-Brain EV Lab — Demo Simulation Backtest Engine
 * 
 * NOTE FOR CODEX / FUTURE DEVELOPERS:
 * This module is isolated from React UI components.
 * To replace with real Python / Rust / C++ execution backend,
 * implement the interface in `src/services/api/` to call your FastAPI endpoint.
 */

import { BacktestRunConfig, BacktestResult, Strategy, EquityPoint, DrawdownPoint, RollingEdgePoint, ParameterStabilityCell, OOSPartitionSummary } from '../../types';

export class BacktestEngine {
  /**
   * Run simulation given strategy template and user configuration
   */
  public static async runSimulation(strategy: Strategy, config: BacktestRunConfig): Promise<BacktestResult> {
    // Simulate slight calculation latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Base EV adjusted by parameter deviation & trading costs
    const baseEV = strategy.metrics.evPerTrade;
    const slippagePenalty = (config.tradingCosts.slippageTicks * 0.02); // in R
    const commPenalty = (config.tradingCosts.commissionPerContract * 0.005); // in R
    const totalFrictionR = slippagePenalty + commPenalty;

    // Adjust performance based on input parameters vs default
    let paramModifier = 1.0;
    if (config.parameters.thresholdPct) {
      const defaultThreshold = strategy.parameters.thresholdPct || 0.25;
      const diff = Math.abs(config.parameters.thresholdPct - defaultThreshold);
      paramModifier = Math.max(0.6, 1.0 - diff * 1.5);
    }

    const effectiveEV = Math.max(-0.2, (baseEV * paramModifier) - totalFrictionR);
    const effectiveWinRate = Math.max(40, strategy.metrics.winRate * (effectiveEV > 0 ? 1.0 : 0.85));
    const effectivePF = Math.max(0.7, (strategy.metrics.profitFactor * paramModifier) - (totalFrictionR * 0.5));
    const totalTrades = Math.floor(strategy.metrics.totalTrades * (paramModifier > 0.8 ? 1.0 : 0.8));

    // Generate trade curve
    const { equityCurve, drawdownCurve, rollingEdge } = this.generateSimulatedCurve(
      totalTrades,
      effectiveEV,
      effectiveWinRate / 100,
      config.dateRange.startDate
    );

    // Compute parameter stability scan around user threshold
    const parameterStability = this.computeParameterStabilityScan(strategy, config);

    // Compute Out-Of-Sample partition results
    const oosPartitions = this.computeOOSPartitions(totalTrades, effectiveEV, effectivePF, effectiveWinRate);

    const maxDDR = drawdownCurve.reduce((max, pt) => Math.max(max, Math.abs(pt.drawdownR)), 0);

    const metrics = {
      ...strategy.metrics,
      evPerTrade: Number(effectiveEV.toFixed(2)),
      profitFactor: Number(effectivePF.toFixed(2)),
      winRate: Number(effectiveWinRate.toFixed(1)),
      maxDrawdownR: Number(maxDDR.toFixed(1)),
      totalTrades,
      rolling20EV: Number((effectiveEV * 1.05).toFixed(2)),
      rolling50EV: Number(effectiveEV.toFixed(2)),
      rolling100EV: Number((effectiveEV * 0.98).toFixed(2)),
    };

    return {
      runId: `RUN-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      strategyId: strategy.id,
      strategyName: strategy.name,
      config,
      metrics,
      equityCurve,
      drawdownCurve,
      rollingEdge,
      parameterStability,
      oosPartitions,
      isDemoSimulation: true,
      disclaimer: 'Current MVP uses demo simulation data. Do not use results for live trading.',
    };
  }

  private static generateSimulatedCurve(
    totalTrades: number,
    ev: number,
    winRate: number,
    startDateStr: string
  ): { equityCurve: EquityPoint[]; drawdownCurve: DrawdownPoint[]; rollingEdge: RollingEdgePoint[] } {
    const equityCurve: EquityPoint[] = [];
    const drawdownCurve: DrawdownPoint[] = [];
    const rollingEdge: RollingEdgePoint[] = [];

    let cumR = 0;
    let peakR = 0;
    const history: number[] = [];
    const baseTime = new Date(startDateStr || '2021-01-01').getTime();

    for (let i = 1; i <= totalTrades; i++) {
      const progress = i / totalTrades;
      let segment: 'TRAIN' | 'VALIDATION' | 'OOS' | 'FORWARD' = 'TRAIN';
      if (progress > 0.85) segment = 'FORWARD';
      else if (progress > 0.65) segment = 'OOS';
      else if (progress > 0.45) segment = 'VALIDATION';

      const rand = Math.sin(i * 45.7 + ev * 100) * 0.5 + 0.5;
      const isWin = rand < winRate;
      const r = isWin ? 1.0 + Math.sin(i) * 0.6 + ev : -1.0;

      cumR += r;
      if (cumR > peakR) peakR = cumR;
      const dd = peakR - cumR;
      const ddPct = peakR > 0 ? (dd / peakR) * 100 : 0;

      history.push(r);
      const dateStr = new Date(baseTime + i * 2.2 * 86400000).toISOString().split('T')[0];

      equityCurve.push({
        tradeNumber: i,
        date: dateStr,
        cumulativeR: Number(cumR.toFixed(2)),
        segment,
      });

      drawdownCurve.push({
        tradeNumber: i,
        date: dateStr,
        drawdownR: Number((-dd).toFixed(2)),
        underwaterPercent: Number(ddPct.toFixed(1)),
      });

      const r20 = history.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, history.length);
      const r50 = history.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, history.length);
      const r100 = history.slice(-100).reduce((a, b) => a + b, 0) / Math.min(100, history.length);

      rollingEdge.push({
        tradeNumber: i,
        date: dateStr,
        rolling20EV: Number(r20.toFixed(2)),
        rolling50EV: Number(r50.toFixed(2)),
        rolling100EV: Number(r100.toFixed(2)),
        overallEV: Number((cumR / i).toFixed(2)),
      });
    }

    return { equityCurve, drawdownCurve, rollingEdge };
  }

  private static computeParameterStabilityScan(
    strategy: Strategy,
    config: BacktestRunConfig
  ): ParameterStabilityCell[] {
    // Return existing stability grid or generate dynamically around selected parameter
    const mainParamKey = Object.keys(config.parameters)[0] || 'thresholdPct';
    const currentVal = config.parameters[mainParamKey] ?? 0.25;

    const testValues = typeof currentVal === 'number'
      ? [
          Number((currentVal * 0.4).toFixed(2)),
          Number((currentVal * 0.6).toFixed(2)),
          Number((currentVal * 0.8).toFixed(2)),
          Number(currentVal.toFixed(2)),
          Number((currentVal * 1.2).toFixed(2)),
          Number((currentVal * 1.4).toFixed(2)),
          Number((currentVal * 1.8).toFixed(2)),
        ]
      : ['Mode A', 'Mode B', 'Mode C'];

    return testValues.map((val) => {
      const isCurrent = val === currentVal || Number(val) === Number(currentVal);
      const dist = typeof val === 'number' ? Math.abs(val - (currentVal as number)) : 0;
      const ev = Math.max(-0.05, 0.20 - dist * 0.6);
      const pf = Math.max(0.9, 1.45 - dist * 1.2);
      const maxDd = 4.5 + dist * 8;
      const isPlateau = ev > 0.12;
      const isOverfitRisk = !isPlateau && isCurrent;

      return {
        paramKey: mainParamKey,
        paramValue: val,
        label: typeof val === 'number' ? `${val}` : String(val),
        ev: Number(ev.toFixed(2)),
        profitFactor: Number(pf.toFixed(2)),
        maxDrawdownR: Number(maxDd.toFixed(1)),
        totalTrades: Math.floor(320 - dist * 200),
        winRate: Number((54 - dist * 15).toFixed(1)),
        isCurrent,
        isOverfitRisk,
        isPlateau,
      };
    });
  }

  private static computeOOSPartitions(
    totalTrades: number,
    ev: number,
    pf: number,
    wr: number
  ): OOSPartitionSummary[] {
    return [
      {
        segment: 'TRAIN',
        period: '2021-01 to 2022-12',
        trades: Math.floor(totalTrades * 0.45),
        ev: Number((ev * 1.05).toFixed(2)),
        profitFactor: Number((pf * 1.04).toFixed(2)),
        winRate: Number((wr + 0.5).toFixed(1)),
        maxDrawdownR: 4.8,
        status: 'PASS',
      },
      {
        segment: 'VALIDATION',
        period: '2023-01 to 2023-12',
        trades: Math.floor(totalTrades * 0.20),
        ev: Number((ev * 1.02).toFixed(2)),
        profitFactor: Number(pf.toFixed(2)),
        winRate: Number(wr.toFixed(1)),
        maxDrawdownR: 3.9,
        status: 'PASS',
      },
      {
        segment: 'OOS',
        period: '2024-01 to 2024-12',
        trades: Math.floor(totalTrades * 0.20),
        ev: Number((ev * 0.96).toFixed(2)),
        profitFactor: Number((pf * 0.97).toFixed(2)),
        winRate: Number((wr - 0.4).toFixed(1)),
        maxDrawdownR: 4.5,
        status: ev > 0.10 ? 'PASS' : 'WATCH',
      },
      {
        segment: 'FORWARD',
        period: '2025-01 to 2026-08',
        trades: Math.floor(totalTrades * 0.15),
        ev: Number((ev * 0.95).toFixed(2)),
        profitFactor: Number((pf * 0.96).toFixed(2)),
        winRate: Number((wr - 0.5).toFixed(1)),
        maxDrawdownR: 4.1,
        status: ev > 0.10 ? 'PASS' : 'WATCH',
      },
    ];
  }
}
