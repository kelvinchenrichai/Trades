/**
 * No-Brain EV Lab — Dashboard Page
 */

import React from 'react';
import { Strategy } from '../types';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { ArrowUpRight, Trophy, Zap, Shield, Flame, Activity, Compass } from 'lucide-react';

interface DashboardPageProps {
  strategies: Strategy[];
  onSelectStrategy: (strategyId: string) => void;
  onNavigateToLab: () => void;
  onNavigateToTournament: () => void;
  onNavigateToEdgeHealth: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  strategies,
  onSelectStrategy,
  onNavigateToLab,
  onNavigateToTournament,
  onNavigateToEdgeHealth,
}) => {
  const activeCount = strategies.filter((s) => s.status === 'LIVE' || s.status === 'PAPER' || s.status === 'OOS_PASS' || s.status === 'BACKTEST_PASS').length;
  const researchCount = strategies.filter((s) => s.status === 'RESEARCH' || s.status === 'IDEA').length;
  const oosPassedCount = strategies.filter((s) => s.oosResult === 'PASS').length;
  const healthyCount = strategies.filter((s) => s.edgeHealth === 'HEALTHY').length;
  const watchCount = strategies.filter((s) => s.edgeHealth === 'WATCH').length;
  const decayingCount = strategies.filter((s) => s.edgeHealth === 'DECAYING').length;

  // Leaderboard sorted by Tournament Total Score
  const sortedStrategies = [...strategies].sort(
    (a, b) => b.metrics.tournament.totalScore - a.metrics.tournament.totalScore
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Top Summary Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            System Research Portfolio Overview
          </h2>
          <span className="text-[11px] text-slate-500">Updated: Real-time Mock Engine</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            label="Active Strategies"
            value={activeCount}
            subValue="Validated"
            trend="positive"
            badge="PORTFOLIO"
            badgeColor="blue"
            tooltip="Strategies in Backtest Pass, OOS Pass, Paper, or Live stage"
          />
          <MetricCard
            label="Research Stage"
            value={researchCount}
            subValue="Under Test"
            badge="LAB"
            badgeColor="slate"
            tooltip="Strategies currently in Idea or Initial Research stage"
          />
          <MetricCard
            label="OOS Passed"
            value={oosPassedCount}
            subValue="Blind Test"
            trend="positive"
            badge="WALK-FWD"
            badgeColor="emerald"
            tooltip="Strategies that maintained positive EV in pure Out-Of-Sample partition"
          />
          <MetricCard
            label="Healthy Edges"
            value={healthyCount}
            subValue="Stable Rolling"
            trend="positive"
            badge="HEALTHY"
            badgeColor="emerald"
            tooltip="Strategies with stable rolling EV and no structural decay"
          />
          <MetricCard
            label="Watch Status"
            value={watchCount}
            subValue="Monitoring"
            trend="neutral"
            badge="WATCH"
            badgeColor="amber"
            tooltip="Strategies exhibiting minor performance variance"
          />
          <MetricCard
            label="Decaying Edges"
            value={decayingCount}
            subValue="Flagged"
            trend="negative"
            badge="DECAYING"
            badgeColor="rose"
            tooltip="Strategies with structural loss of positive statistical expectancy"
          />
        </div>
      </div>

      {/* Philosophy Anchor Box */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-[#0d1627] to-[#0a101d] border border-blue-900/40 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            No-Brain EV Lab Guiding Principles
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            <strong>Simple &gt; Complex</strong> · <strong>Objective &gt; Subjective</strong> · <strong>Plateau &gt; Peak</strong> · <strong>Low Drawdown &gt; Max Profit</strong>.
            All rules are 100% executable by computer with 0 discretionary lines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToTournament}
            className="py-1.5 px-3 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5" />
            Tournament Rankings
          </button>
          <button
            onClick={onNavigateToEdgeHealth}
            className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            Edge Health Monitor
          </button>
        </div>
      </div>

      {/* Strategy Leaderboard */}
      <div className="space-y-3 bg-[#0a0f18] p-4 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Strategy Leaderboard &amp; Multi-Factor Score
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by composite 100-pt scoring model (OOS EV, Parameter Plateau, Drawdown, Edge Health &amp; Simplicity)
            </p>
          </div>

          <button
            onClick={onNavigateToLab}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            Explore All in Strategy Lab
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-2 font-semibold text-center w-12">RANK</th>
                <th className="py-2.5 px-3 font-semibold">STRATEGY</th>
                <th className="py-2.5 px-2.5 font-semibold">MARKET</th>
                <th className="py-2.5 px-2.5 font-semibold">STATUS</th>
                <th className="py-2.5 px-2.5 font-semibold text-right">EV / TRADE</th>
                <th className="py-2.5 px-2.5 font-semibold text-right">PROFIT FACTOR</th>
                <th className="py-2.5 px-2.5 font-semibold text-right">MAX DD</th>
                <th className="py-2.5 px-2.5 font-semibold text-center">OOS</th>
                <th className="py-2.5 px-2.5 font-semibold text-center">EDGE HEALTH</th>
                <th className="py-2.5 px-2.5 font-semibold text-center">COMPLEXITY</th>
                <th className="py-2.5 px-2.5 font-semibold text-right">SCORE</th>
                <th className="py-2.5 px-2 font-semibold text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-num">
              {sortedStrategies.map((strategy, index) => {
                const isTop = index === 0;
                return (
                  <tr
                    key={strategy.id}
                    className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectStrategy(strategy.id)}
                  >
                    <td className="py-3 px-2 text-center">
                      {isTop ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40">
                          1
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">#{index + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          {strategy.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {strategy.id}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2.5">
                      <StatusBadge type="market" value={strategy.market} size="sm" />
                    </td>
                    <td className="py-3 px-2.5">
                      <StatusBadge type="stage" value={strategy.status} size="sm" />
                    </td>
                    <td className={`py-3 px-2.5 text-right font-bold ${strategy.metrics.evPerTrade > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {strategy.metrics.evPerTrade > 0 ? `+${strategy.metrics.evPerTrade}` : strategy.metrics.evPerTrade}R
                    </td>
                    <td className="py-3 px-2.5 text-right text-slate-300">
                      {strategy.metrics.profitFactor}
                    </td>
                    <td className="py-3 px-2.5 text-right text-slate-300">
                      {strategy.metrics.maxDrawdownR}R
                    </td>
                    <td className="py-3 px-2.5 text-center">
                      <StatusBadge type="oos" value={strategy.oosResult} size="sm" />
                    </td>
                    <td className="py-3 px-2.5 text-center">
                      <StatusBadge type="health" value={strategy.edgeHealth} size="sm" />
                    </td>
                    <td className="py-3 px-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${strategy.complexityScore <= 3 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'}`}>
                        {strategy.complexityScore}/10
                      </span>
                    </td>
                    <td className="py-3 px-2.5 text-right font-bold text-slate-100">
                      <span className="text-sm text-blue-400 font-mono">
                        {strategy.metrics.tournament.totalScore}
                      </span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </td>
                    <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectStrategy(strategy.id)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="View Strategy Deep Dive"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
