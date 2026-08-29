/**
 * No-Brain EV Lab — Universal Prop Firm Evaluation Simulator
 */

import React, { useState, useEffect } from 'react';
import { Strategy, PropFirmRule, PropSimulationResult, DrawdownType } from '../types';
import { QuantApiService } from '../services/api/mockApi';
import { PROP_TEMPLATES, PropTemplate } from '../data/propTemplates';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { MetricCard } from '../components/MetricCard';
import { PropMonteCarloChart } from '../components/Charts/PropMonteCarloChart';
import {
  ShieldCheck,
  AlertTriangle,
  PlaySquare,
  Sliders,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Clock,
  Flame,
} from 'lucide-react';

interface PropSimulatorPageProps {
  strategies: Strategy[];
  onSelectStrategy: (id: string) => void;
}

export const PropSimulatorPage: React.FC<PropSimulatorPageProps> = ({
  strategies,
  onSelectStrategy,
}) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategies[0]?.id || 'NQ-FTM-001');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PROP_TEMPLATES[0].id);

  // Prop Rule Configuration
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [profitTarget, setProfitTarget] = useState<number>(6000);
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(2000);
  const [maxDrawdown, setMaxDrawdown] = useState<number>(3000);
  const [drawdownType, setDrawdownType] = useState<DrawdownType>('EOD_TRAILING');
  const [minTradingDays, setMinTradingDays] = useState<number>(5);
  const [maxContracts, setMaxContracts] = useState<number>(10);
  const [riskPerTradeUSD, setRiskPerTradeUSD] = useState<number>(500);
  const [numSimulations, setNumSimulations] = useState<number>(250);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<PropSimulationResult | null>(null);

  // Apply Template
  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = PROP_TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      setAccountSize(tpl.rules.accountSize);
      setProfitTarget(tpl.rules.profitTarget);
      setDailyLossLimit(tpl.rules.dailyLossLimit);
      setMaxDrawdown(tpl.rules.maxDrawdown);
      setDrawdownType(tpl.rules.drawdownType);
      setMinTradingDays(tpl.rules.minTradingDays);
      setMaxContracts(tpl.rules.maxContracts);
      setRiskPerTradeUSD(tpl.rules.riskPerTrade);
    }
  };

  // Run simulation on strategy / rule changes
  useEffect(() => {
    handleRunSimulation();
  }, [selectedStrategyId]);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      const rules: PropFirmRule = {
        accountSize,
        profitTarget,
        dailyLossLimit,
        maxDrawdown,
        drawdownType,
        minTradingDays,
        maxContracts,
        consistencyRule: true,
        riskPerTrade: riskPerTradeUSD,
      };

      const simResult = await QuantApiService.runPropSimulation(
        selectedStrategyId,
        rules
      );
      setResult(simResult);
    } catch (err) {
      console.error('Prop simulation failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      <DisclaimerBanner />

      {/* Grid: Left Config Panel + Right Results Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Configuration & Template Selector */}
        <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-5 lg:col-span-1">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Universal Prop Rule Configuration
            </h2>
            <button
              onClick={() => handleApplyTemplate(PROP_TEMPLATES[0].id)}
              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Default
            </button>
          </div>

          {/* Strategy to Simulate */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-semibold block">
              EVALUATING STRATEGY
            </label>
            <select
              value={selectedStrategyId}
              onChange={(e) => setSelectedStrategyId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded p-2 focus:outline-none focus:border-purple-500 font-mono"
            >
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.market}] {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          {/* Preset Templates */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-semibold block">
              PRESET EVALUATION TEMPLATE
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {PROP_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className={`p-2 rounded text-left border text-xs transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold">{tpl.name}</div>
                  <div className="text-[10px] text-slate-500">
                    Target: ${tpl.rules.profitTarget.toLocaleString()} · Max DD: ${tpl.rules.maxDrawdown.toLocaleString()} ({tpl.rules.drawdownType})
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Rule Fields */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">ACCOUNT SIZE ($)</label>
                <input
                  type="number"
                  value={accountSize}
                  onChange={(e) => setAccountSize(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">PROFIT TARGET ($)</label>
                <input
                  type="number"
                  value={profitTarget}
                  onChange={(e) => setProfitTarget(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">DAILY LOSS LIMIT ($)</label>
                <input
                  type="number"
                  value={dailyLossLimit}
                  onChange={(e) => setDailyLossLimit(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">MAX DRAWDOWN ($)</label>
                <input
                  type="number"
                  value={maxDrawdown}
                  onChange={(e) => setMaxDrawdown(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400">DRAWDOWN TRAILING MODEL</label>
              <select
                value={drawdownType}
                onChange={(e) => setDrawdownType(e.target.value as DrawdownType)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 font-mono"
              >
                <option value="STATIC">STATIC (Fixed from Starting Balance)</option>
                <option value="TRAILING_EOD">TRAILING EOD (Calculated at Market Close)</option>
                <option value="TRAILING_UNREALIZED">TRAILING INTRADAY (Highest High Spike)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">RISK / TRADE ($)</label>
                <input
                  type="number"
                  value={riskPerTradeUSD}
                  onChange={(e) => setRiskPerTradeUSD(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">MONTE CARLO RUNS</label>
                <input
                  type="number"
                  value={numSimulations}
                  min="50"
                  max="1000"
                  step="50"
                  onChange={(e) => setNumSimulations(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Run Action */}
          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className={`w-full py-2.5 px-4 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              isRunning
                ? 'bg-purple-900 text-slate-300 cursor-wait'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            {isRunning ? 'Running Monte Carlo Simulations...' : 'Run Prop Simulation'}
          </button>
        </div>

        {/* Right 2/3: Simulation Analysis & Paths */}
        <div className="space-y-6 lg:col-span-2">
          {result && (
            <>
              {/* Top Probabilities Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-num">
                <MetricCard
                  label="Pass Probability"
                  value={`${result.passProbability}%`}
                  trend="positive"
                  badge="MONTE CARLO"
                  badgeColor="emerald"
                  highlight={true}
                  tooltip="Probability of reaching profit target before violating Max DD or Daily Loss limit"
                />
                <MetricCard
                  label="Failure Probability"
                  value={`${result.failureProbability}%`}
                  trend={result.failureProbability > 30 ? 'negative' : 'neutral'}
                  subValue="Risk of Ruin"
                />
                <MetricCard
                  label="Median Days to Pass"
                  value={`${result.medianDaysToPass} Days`}
                  subValue="Simulated Pace"
                />
                <MetricCard
                  label="Prop Friendly Score"
                  value={`${result.propFriendlyScore}/100`}
                  trend="positive"
                  badge="RATING"
                  badgeColor="purple"
                />
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-num text-center">
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">EXPECTED MAX DD</div>
                  <div className="text-sm font-bold text-rose-400">${result.expectedMaxDD.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">LONGEST LOSING STREAK</div>
                  <div className="text-sm font-bold text-slate-200">{result.longestLosingStreak} Trades</div>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">DAILY LOSS RISK</div>
                  <div className="text-sm font-bold text-amber-400">{result.dailyLossViolationRisk}%</div>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">TOP FAILURE MODE</div>
                  <div className="text-xs font-bold text-rose-300 truncate">{result.mostCommonFailureReason}</div>
                </div>
              </div>

              {/* Monte Carlo Paths Visualizer */}
              <PropMonteCarloChart result={result} height={320} />

              {/* Strategy Ranking for Prop Rules */}
              <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
                <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Strategy Prop Compatibility Matrix
                </h3>
                <p className="text-[11px] text-slate-400">
                  Low intraday drawdown and low trade frequency produce the highest prop challenge pass rates.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                        <th className="py-2 px-2">STRATEGY</th>
                        <th className="py-2 px-2 text-right">EV / TRADE</th>
                        <th className="py-2 px-2 text-right">MAX DD</th>
                        <th className="py-2 px-2 text-right">DAILY VIOLATION RISK</th>
                        <th className="py-2 px-2 text-right">PROP SCORE</th>
                        <th className="py-2 px-2 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono-num">
                      {strategies.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-2 font-bold text-slate-200">
                            {s.name} ({s.id})
                          </td>
                          <td className="py-2.5 px-2 text-right text-emerald-400 font-bold">
                            +{s.metrics.evPerTrade}R
                          </td>
                          <td className="py-2.5 px-2 text-right text-rose-400">
                            {s.metrics.maxDrawdownR}R
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-300">
                            {s.metrics.propFriendlyScore >= 80 ? 'Low (<5%)' : 'Moderate (15%)'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-bold text-purple-400">
                            {s.metrics.propFriendlyScore}/100
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => {
                                setSelectedStrategyId(s.id);
                              }}
                              className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 text-[10px]"
                            >
                              Simulate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
