/**
 * No-Brain EV Lab — Prop Firm Monte Carlo Simulation Engine
 * 
 * Runs stochastic evaluation simulations against universal prop rules.
 * Clearly labeled as Demo Monte Carlo Simulation for MVP.
 */

import { PropFirmRule, PropSimulationResult, PropSimulationPath, Strategy } from '../../types';

export class PropSimulator {
  /**
   * Run Monte Carlo simulation for a given strategy and prop rule set
   */
  public static async runSimulation(
    strategy: Strategy,
    rules: PropFirmRule,
    simulationsCount: number = 250
  ): Promise<PropSimulationResult> {
    // Artificial latency for realistic execution feeling
    await new Promise((resolve) => setTimeout(resolve, 350));

    const winRate = strategy.metrics.winRate / 100;
    const avgWinDollar = strategy.metrics.avgWinR * rules.riskPerTrade;
    const avgLossDollar = strategy.metrics.avgLossR * rules.riskPerTrade;

    let passedCount = 0;
    let failedCount = 0;
    const daysToPassList: number[] = [];
    const maxDrawdownList: number[] = [];
    let longestStreakOverall = 0;
    const failureReasons: Record<string, number> = {
      'Max Drawdown Breached': 0,
      'Daily Loss Limit Breached': 0,
      'Max Days Timeout (60d)': 0,
    };

    const paths: PropSimulationPath[] = [];

    for (let sim = 0; sim < simulationsCount; sim++) {
      let currentEquity = rules.accountSize;
      let peakEquity = rules.accountSize;
      let trailingFloor = rules.accountSize - rules.maxDrawdown;
      let currentLosingStreak = 0;
      let simMaxDD = 0;
      let status: 'PASSED' | 'FAILED' | 'ACTIVE' = 'ACTIVE';
      const dailyEquities: number[] = [rules.accountSize];
      let days = 0;
      const maxDays = 60;

      while (status === 'ACTIVE' && days < maxDays) {
        days++;
        let dailyPnl = 0;
        const tradesToday = Math.max(1, Math.min(strategy.maxTradesPerDay, 2));

        for (let t = 0; t < tradesToday; t++) {
          const rand = Math.random();
          const isWin = rand < winRate;
          const tradePnl = isWin 
            ? avgWinDollar * (0.8 + Math.random() * 0.4) 
            : -avgLossDollar * (0.9 + Math.random() * 0.2);

          dailyPnl += tradePnl;
          if (tradePnl < 0) {
            currentLosingStreak++;
            if (currentLosingStreak > longestStreakOverall) longestStreakOverall = currentLosingStreak;
          } else {
            currentLosingStreak = 0;
          }
        }

        currentEquity += dailyPnl;
        dailyEquities.push(Math.round(currentEquity));

        // Track Peak and Trailing Floor
        if (currentEquity > peakEquity) {
          peakEquity = currentEquity;
          if (rules.drawdownType === 'TRAILING' || rules.drawdownType === 'EOD_TRAILING') {
            trailingFloor = peakEquity - rules.maxDrawdown;
          }
        }

        const currentDD = peakEquity - currentEquity;
        if (currentDD > simMaxDD) simMaxDD = currentDD;

        // Rule Checks:
        // 1. Daily Loss Limit
        if (dailyPnl <= -rules.dailyLossLimit) {
          status = 'FAILED';
          failureReasons['Daily Loss Limit Breached']++;
          break;
        }

        // 2. Max Drawdown / Trailing Floor
        const activeFloor = rules.drawdownType === 'STATIC' 
          ? (rules.accountSize - rules.maxDrawdown) 
          : trailingFloor;

        if (currentEquity <= activeFloor) {
          status = 'FAILED';
          failureReasons['Max Drawdown Breached']++;
          break;
        }

        // 3. Profit Target
        const targetEquity = rules.accountSize + rules.profitTarget;
        if (currentEquity >= targetEquity && days >= rules.minTradingDays) {
          status = 'PASSED';
          daysToPassList.push(days);
          break;
        }
      }

      if (status === 'ACTIVE') {
        status = 'FAILED';
        failureReasons['Max Days Timeout (60d)']++;
      }

      if (status === 'PASSED') passedCount++;
      else failedCount++;

      maxDrawdownList.push(simMaxDD);

      // Keep first 12 representative paths for chart display
      if (sim < 12) {
        paths.push({
          simId: sim + 1,
          days,
          finalEquity: Math.round(currentEquity),
          maxDrawdown: Math.round(simMaxDD),
          status,
          dailyEquities,
        });
      }
    }

    const simCount = simulationsCount > 0 ? simulationsCount : 1;
    const passProbability = Number(((passedCount / simCount) * 100).toFixed(1)) || 0;
    const failureProbability = Number(((failedCount / simCount) * 100).toFixed(1)) || 0;
    
    // Sort days to calculate median
    daysToPassList.sort((a, b) => a - b);
    const medianDaysToPass = daysToPassList.length > 0
      ? daysToPassList[Math.floor(daysToPassList.length / 2)]
      : 0;

    const expectedMaxDD = maxDrawdownList.length > 0
      ? Math.round(maxDrawdownList.reduce((a, b) => a + b, 0) / maxDrawdownList.length)
      : 0;

    let mostCommonFailureReason = 'None';
    let highestFailures = -1;
    for (const [reason, count] of Object.entries(failureReasons)) {
      if (count > highestFailures) {
        highestFailures = count;
        mostCommonFailureReason = reason;
      }
    }

    // Daily loss violation risk
    const dailyBreaches = failureReasons['Daily Loss Limit Breached'] || 0;
    const dailyLossViolationRisk = Number(((dailyBreaches / simCount) * 100).toFixed(1)) || 0;

    // Calculate Prop Friendly Score: 0-100
    // Emphasizes low DD, low daily loss breach, and reasonable pass rate
    const maxDDLimit = rules.maxDrawdown > 0 ? rules.maxDrawdown : 3000;
    const ddScore = Math.max(0, 40 * (1 - (expectedMaxDD || 0) / maxDDLimit));
    const passScore = (passProbability || 0) * 0.4;
    const dailyRiskPenalty = (dailyLossViolationRisk || 0) * 0.2;
    const rawPropScore = ddScore + passScore - dailyRiskPenalty;
    const propFriendlyScore = isNaN(rawPropScore)
      ? 50
      : Math.min(100, Math.max(10, Math.round(rawPropScore)));

    return {
      strategyId: strategy.id,
      strategyName: strategy.name,
      rules,
      passProbability,
      failureProbability,
      medianDaysToPass,
      expectedMaxDD,
      longestLosingStreak: longestStreakOverall || 0,
      mostCommonFailureReason,
      dailyLossViolationRisk,
      propFriendlyScore,
      totalSimulations: simulationsCount,
      paths,
      isDemoSimulation: true,
    };
  }
}
