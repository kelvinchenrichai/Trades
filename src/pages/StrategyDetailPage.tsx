/**
 * No-Brain EV Lab — Strategy Detail Page
 */

import React, { useState } from 'react';
import { Strategy } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { MetricCard } from '../components/MetricCard';
import { EquityChart } from '../components/Charts/EquityChart';
import { DrawdownChart } from '../components/Charts/DrawdownChart';
import { RollingEdgeChart } from '../components/Charts/RollingEdgeChart';
import { ReportModal } from '../components/ReportModal';
import {
  FileText,
  PlaySquare,
  Layers,
  Zap,
  ShieldCheck,
  Calendar,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';

interface StrategyDetailPageProps {
  strategy: Strategy;
  allStrategies: Strategy[];
  onSelectStrategy: (id: string) => void;
  onNavigateToBacktest: (id: string) => void;
}

export type DetailTab =
  | 'overview'
  | 'performance'
  | 'equity'
  | 'drawdown'
  | 'rolling'
  | 'yearly'
  | 'oos';

export const StrategyDetailPage: React.FC<StrategyDetailPageProps> = ({
  strategy,
  allStrategies,
  onSelectStrategy,
  onNavigateToBacktest,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const tabs: Array<{ id: DetailTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview & Rules', icon: Info },
    { id: 'performance', label: 'Performance Metrics', icon: Activity },
    { id: 'equity', label: 'Equity Curve', icon: CheckCircle2 },
    { id: 'drawdown', label: 'Drawdown (Underwater)', icon: AlertTriangle },
    { id: 'rolling', label: 'Rolling Edge Decay', icon: Zap },
    { id: 'yearly', label: 'Yearly Results (2021-2026)', icon: Calendar },
    { id: 'oos', label: 'OOS Partition Walk', icon: ShieldCheck },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      <DisclaimerBanner compact />

      {/* Top Banner Card */}
      <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400">
                {strategy.id}
              </span>
              <StatusBadge type="market" value={strategy.market} size="sm" />
              <StatusBadge type="stage" value={strategy.status} size="sm" />
              <StatusBadge type="health" value={strategy.edgeHealth} size="sm" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 font-sans">
              {strategy.name}
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {strategy.hypothesis}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowReportModal(true)}
              className="py-2 px-3.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              Generate Report
            </button>
            <button
              onClick={() => onNavigateToBacktest(strategy.id)}
              className="py-2 px-3.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
            >
              <PlaySquare className="w-4 h-4" />
              Backtest Runner
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3 border-t border-slate-800/80 font-mono-num text-center">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">EV / Trade</div>
            <div className={`text-base font-bold ${strategy.metrics.evPerTrade > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {strategy.metrics.evPerTrade > 0 ? `+${strategy.metrics.evPerTrade}` : strategy.metrics.evPerTrade}R
            </div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Profit Factor</div>
            <div className="text-base font-bold text-slate-200">
              {strategy.metrics.profitFactor}
            </div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Max Drawdown</div>
            <div className="text-base font-bold text-rose-400">
              {strategy.metrics.maxDrawdownR}R
            </div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Win Rate</div>
            <div className="text-base font-bold text-slate-200">
              {strategy.metrics.winRate}%
            </div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Complexity</div>
            <div className="text-base font-bold text-emerald-400">
              {strategy.complexityScore}/10
            </div>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Tournament Score</div>
            <div className="text-base font-bold text-blue-400">
              {strategy.metrics.tournament.totalScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-4 text-xs font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Rules and Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Mechanical Entry Conditions (≤3)
              </h3>
              <div className="space-y-2">
                {strategy.entryRules.map((rule, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-400 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5 border border-blue-800">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-slate-400">
                <strong className="text-slate-300">Max Trades Per Day:</strong> {strategy.maxTradesPerDay} trade
              </div>
            </div>

            <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Exit &amp; Risk Parameters
              </h3>
              <div className="space-y-2">
                {strategy.exitRules.map((rule, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-950 text-amber-400 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5 border border-amber-800">
                      E{idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-slate-400">
                <strong className="text-slate-300">Data Requirements:</strong> {strategy.dataRequirements.join(', ')}
              </div>
            </div>
          </div>

          {/* Edge Mechanism Breakdown */}
          <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              Why This Structural Edge May Exist
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {strategy.edgeExplanation}
            </p>
          </div>

          {/* Complexity vs Execution Friction Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Complexity Score: {strategy.complexityScore}/10
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  {strategy.complexityScore <= 3 ? 'ULTRA SIMPLE' : 'MODERATE'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Entry Conditions</span>
                  <span className="font-bold text-slate-200">{strategy.complexityBreakdown.entryConditions}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Indicators Count</span>
                  <span className="font-bold text-slate-200">{strategy.complexityBreakdown.indicatorsCount}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Parameters Count</span>
                  <span className="font-bold text-slate-200">{strategy.complexityBreakdown.parametersCount}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Manual Judgment</span>
                  <span className="font-bold text-emerald-400">0 (Strictly Banned)</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Execution Friction: {strategy.executionFrictionScore}/10
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                  {strategy.executionFrictionBreakdown.fixedTimeEntry ? 'FIXED-TIME' : 'INTRADAY'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Reaction Speed</span>
                  <span className="font-bold text-slate-200">{strategy.executionFrictionBreakdown.reactionSpeedRequired}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Fixed-Time Entry</span>
                  <span className="font-bold text-emerald-400">{strategy.executionFrictionBreakdown.fixedTimeEntry ? 'YES' : 'NO'}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Limit Order Friendly</span>
                  <span className="font-bold text-slate-200">{strategy.executionFrictionBreakdown.limitOrderFriendly ? 'YES' : 'NO'}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Manual Discretion</span>
                  <span className="font-bold text-emerald-400">0% (Zero)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard label="Total Trades" value={strategy.metrics.totalTrades} subValue="2021-2026" />
            <MetricCard label="Win Rate" value={`${strategy.metrics.winRate}%`} trend="positive" />
            <MetricCard label="EV Per Trade" value={`+${strategy.metrics.evPerTrade}R`} trend="positive" />
            <MetricCard label="Profit Factor" value={strategy.metrics.profitFactor} trend="positive" />
            <MetricCard label="Sharpe Ratio" value={strategy.metrics.sharpeRatio} />
            <MetricCard label="Max Drawdown" value={`${strategy.metrics.maxDrawdownR}R`} trend="negative" />
            <MetricCard label="Avg Win / Loss" value={`+${strategy.metrics.avgWinR}R`} subValue={`-${strategy.metrics.avgLossR}R`} />
            <MetricCard label="Worst Day" value={`${strategy.metrics.worstDayR}R`} trend="negative" />
            <MetricCard label="Worst Week" value={`${strategy.metrics.worstWeekR}R`} trend="negative" />
            <MetricCard label="Max Consec. Losses" value={`${strategy.metrics.maxConsecutiveLosses} Trades`} />
            <MetricCard label="Rolling 20 EV" value={`+${strategy.metrics.rolling20EV}R`} trend="positive" />
            <MetricCard label="Rolling 100 EV" value={`+${strategy.metrics.rolling100EV}R`} trend="positive" />
          </div>
        </div>
      )}

      {/* Tab 3: Equity */}
      {activeTab === 'equity' && (
        <div className="space-y-4">
          <EquityChart data={strategy.equityCurve} height={380} showPartitions={true} />
        </div>
      )}

      {/* Tab 4: Drawdown */}
      {activeTab === 'drawdown' && (
        <div className="space-y-4">
          <DrawdownChart data={strategy.drawdownCurve} height={320} />
        </div>
      )}

      {/* Tab 5: Rolling Edge */}
      {activeTab === 'rolling' && (
        <div className="space-y-4">
          <RollingEdgeChart data={strategy.rollingEdge} height={340} />
        </div>
      )}

      {/* Tab 6: Yearly Performance */}
      {activeTab === 'yearly' && (
        <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
          <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Multi-Year Breakdown (2021 — 2026)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">YEAR</th>
                  <th className="py-2.5 px-3 text-right">TRADES</th>
                  <th className="py-2.5 px-3 text-right">EV / TRADE</th>
                  <th className="py-2.5 px-3 text-right">PROFIT FACTOR</th>
                  <th className="py-2.5 px-3 text-right">MAX DD</th>
                  <th className="py-2.5 px-3 text-right">WIN RATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                {strategy.yearlyPerformance.map((y) => (
                  <tr key={y.year} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 font-bold text-slate-200">{y.year}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{y.trades}</td>
                    <td className={`py-3 px-3 text-right font-bold ${y.ev > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {y.ev > 0 ? `+${y.ev}` : y.ev}R
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">{y.profitFactor}</td>
                    <td className="py-3 px-3 text-right text-slate-400">{y.maxDrawdownR}R</td>
                    <td className="py-3 px-3 text-right text-slate-300">{y.winRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: OOS Partition Integrity */}
      {activeTab === 'oos' && (
        <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-4 font-mono">
          <div className="border-b border-slate-800/80 pb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Chronological Partition Integrity (No Random Shuffle)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict Walk-Forward validation. Future data is strictly quarantined from parameter tuning.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">PARTITION</th>
                  <th className="py-2.5 px-3">PERIOD</th>
                  <th className="py-2.5 px-3 text-right">TRADES</th>
                  <th className="py-2.5 px-3 text-right">EV / TRADE</th>
                  <th className="py-2.5 px-3 text-right">PROFIT FACTOR</th>
                  <th className="py-2.5 px-3 text-right">WIN RATE</th>
                  <th className="py-2.5 px-3 text-right">MAX DD</th>
                  <th className="py-2.5 px-3 text-center">VERDICT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                {strategy.oosPartitions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 font-bold text-slate-200 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.segment === 'OOS' ? 'bg-emerald-400' : p.segment === 'FORWARD' ? 'bg-sky-400' : 'bg-slate-500'}`} />
                      {p.segment}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{p.period}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{p.trades}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">+{p.ev}R</td>
                    <td className="py-3 px-3 text-right text-slate-300">{p.profitFactor}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{p.winRate}%</td>
                    <td className="py-3 px-3 text-right text-slate-400">{p.maxDrawdownR}R</td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge type="oos" value={p.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal strategy={strategy} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};
