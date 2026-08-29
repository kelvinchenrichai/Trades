/**
 * No-Brain EV Lab — Backtest Runner & Stability Suite
 */

import React, { useState, useEffect } from 'react';
import { Strategy, BacktestRunConfig, BacktestResult, Market } from '../types';
import { QuantApiService } from '../services/api/mockApi';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { MetricCard } from '../components/MetricCard';
import { EquityChart } from '../components/Charts/EquityChart';
import { DrawdownChart } from '../components/Charts/DrawdownChart';
import { StabilityHeatmap } from '../components/Charts/StabilityHeatmap';
import { StatusBadge } from '../components/StatusBadge';
import {
  PlaySquare,
  RotateCcw,
  Sliders,
  Calendar,
  DollarSign,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface BacktestsPageProps {
  strategies: Strategy[];
  initialStrategyId?: string;
  onSelectStrategy: (id: string) => void;
}

export const BacktestsPage: React.FC<BacktestsPageProps> = ({
  strategies,
  initialStrategyId,
  onSelectStrategy,
}) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(
    initialStrategyId || strategies[0]?.id || 'NQ-FTM-001'
  );

  const activeStrategy = strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  // Config State
  const [market, setMarket] = useState<Market>(activeStrategy.market);
  const [startDate, setStartDate] = useState<string>('2021-01-01');
  const [endDate, setEndDate] = useState<string>('2026-08-28');
  const [parameters, setParameters] = useState<Record<string, any>>(activeStrategy.parameters);
  const [slippageTicks, setSlippageTicks] = useState<number>(1);
  const [commissionUSD, setCommissionUSD] = useState<number>(4.0);
  const [positionRiskPct, setPositionRiskPct] = useState<number>(1.0);
  const [initialCapital, setInitialCapital] = useState<number>(100000);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  // Sync parameters when strategy changes
  useEffect(() => {
    if (activeStrategy) {
      setMarket(activeStrategy.market);
      setParameters({ ...activeStrategy.parameters });
    }
  }, [selectedStrategyId, activeStrategy]);

  // Run initial default simulation on mount
  useEffect(() => {
    handleRunBacktest();
  }, [selectedStrategyId]);

  const handleRunBacktest = async () => {
    setIsRunning(true);
    try {
      const config: BacktestRunConfig = {
        strategyId: activeStrategy.id,
        market: activeStrategy.market,
        dateRange: { startDate, endDate },
        parameters,
        tradingCosts: {
          slippageTicks,
          commissionPerContract: commissionUSD,
        },
        positionRiskPercent: positionRiskPct,
        initialCapitalUSD: initialCapital,
      };

      const res = await QuantApiService.runBacktest(config);
      setResult(res);
    } catch (err) {
      console.error('Backtest error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const updateParam = (key: string, val: any) => {
    setParameters((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      <DisclaimerBanner />

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Configuration Form */}
        <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-5 lg:col-span-1">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Backtest Runner Configuration
            </h2>
            <button
              onClick={() => {
                setParameters({ ...activeStrategy.parameters });
                setSlippageTicks(1);
                setCommissionUSD(4.0);
              }}
              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Strategy Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-semibold block">
              TARGET STRATEGY
            </label>
            <select
              value={selectedStrategyId}
              onChange={(e) => setSelectedStrategyId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
            >
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.market}] {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold block">START DATE</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold block">END DATE</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Dynamic Strategy Parameters */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="text-[11px] text-blue-400 font-bold uppercase tracking-wide block">
              Strategy Parameters
            </label>

            {activeStrategy.parameterSpecs.map((spec) => {
              const currentVal = parameters[spec.key] ?? spec.default;

              if (spec.type === 'select') {
                return (
                  <div key={spec.key} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{spec.name}:</span>
                    </div>
                    <select
                      value={currentVal}
                      onChange={(e) => updateParam(spec.key, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
                    >
                      {spec.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={spec.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{spec.name}:</span>
                    <span className="font-bold text-blue-400 font-mono-num">
                      {currentVal} {spec.unit || ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={spec.min ?? 0}
                    max={spec.max ?? 1}
                    step={spec.step ?? 0.05}
                    value={currentVal}
                    onChange={(e) => updateParam(spec.key, parseFloat(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          {/* Trading Costs & Friction */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="text-[11px] text-amber-400 font-bold uppercase tracking-wide block">
              Friction &amp; Execution Costs
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">SLIPPAGE (TICKS)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="1"
                  value={slippageTicks}
                  onChange={(e) => setSlippageTicks(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-2 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">COMMISSION ($/RT)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={commissionUSD}
                  onChange={(e) => setCommissionUSD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-2 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className={`w-full py-2.5 px-4 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              isRunning
                ? 'bg-blue-800 text-slate-300 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 cursor-pointer'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            {isRunning ? 'Simulating Backtest...' : 'Run Backtest Engine'}
          </button>
        </div>

        {/* Right 2/3: Backtest Results & Stability Heatmap */}
        <div className="space-y-6 lg:col-span-2">
          {result && (
            <>
              {/* Performance Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  label="Simulated EV"
                  value={`${result.metrics.evPerTrade > 0 ? `+${result.metrics.evPerTrade}` : result.metrics.evPerTrade}R`}
                  trend={result.metrics.evPerTrade > 0 ? 'positive' : 'negative'}
                  subValue="Per Trade"
                  highlight={true}
                />
                <MetricCard
                  label="Profit Factor"
                  value={result.metrics.profitFactor}
                  trend={result.metrics.profitFactor > 1.2 ? 'positive' : 'neutral'}
                  subValue="After Friction"
                />
                <MetricCard
                  label="Simulated Max DD"
                  value={`${result.metrics.maxDrawdownR}R`}
                  trend="negative"
                />
                <MetricCard
                  label="Simulated Trades"
                  value={result.metrics.totalTrades}
                  subValue={`WR: ${result.metrics.winRate}%`}
                />
              </div>

              {/* Equity & Drawdown Charts */}
              <div className="space-y-4">
                <EquityChart data={result.equityCurve} height={280} showPartitions={true} />
                <DrawdownChart data={result.drawdownCurve} height={180} />
              </div>

              {/* Parameter Stability Heatmap (Crucial Requirement: Plateau > Peak) */}
              <StabilityHeatmap
                cells={result.parameterStability}
                parameterName={`${activeStrategy.name} Stability Scan`}
              />

              {/* Out of Sample Partitions */}
              <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Walk-Forward Partition Verdict
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    OOS Gate Validation
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                        <th className="py-2 px-2">SEGMENT</th>
                        <th className="py-2 px-2">PERIOD</th>
                        <th className="py-2 px-2 text-right">TRADES</th>
                        <th className="py-2 px-2 text-right">EV / TRADE</th>
                        <th className="py-2 px-2 text-right">PF</th>
                        <th className="py-2 px-2 text-right">WIN RATE</th>
                        <th className="py-2 px-2 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono-num">
                      {result.oosPartitions.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="py-2 px-2 font-bold text-slate-300">{p.segment}</td>
                          <td className="py-2 px-2 text-slate-400">{p.period}</td>
                          <td className="py-2 px-2 text-right text-slate-300">{p.trades}</td>
                          <td className="py-2 px-2 text-right font-bold text-emerald-400">+{p.ev}R</td>
                          <td className="py-2 px-2 text-right text-slate-300">{p.profitFactor}</td>
                          <td className="py-2 px-2 text-right text-slate-300">{p.winRate}%</td>
                          <td className="py-2 px-2 text-center">
                            <StatusBadge type="oos" value={p.status} size="sm" />
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
