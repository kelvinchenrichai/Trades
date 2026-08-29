/**
 * No-Brain EV Lab — Edge Health & Decay Monitoring Center
 */

import React, { useState } from 'react';
import { Strategy, EdgeHealthStatus } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { StatusBadge } from '../components/StatusBadge';
import { EdgeDecayChart } from '../components/Charts/EdgeDecayChart';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Zap,
  TrendingDown,
  Clock,
  ArrowUpRight,
  Sliders,
} from 'lucide-react';

interface EdgeHealthPageProps {
  strategies: Strategy[];
  onSelectStrategy: (id: string) => void;
}

export const EdgeHealthPage: React.FC<EdgeHealthPageProps> = ({
  strategies,
  onSelectStrategy,
}) => {
  const [filterHealth, setFilterHealth] = useState<string>('ALL');

  const filteredStrategies = strategies.filter((s) => {
    if (filterHealth !== 'ALL' && s.edgeHealth !== filterHealth) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      <DisclaimerBanner compact />

      {/* Header Info */}
      <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Rolling Edge Degradation &amp; Decay Surveillance
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strategies are continuously evaluated across rolling trade windows (20, 50, 100 trades) to catch structural alpha erosion.
            </p>
          </div>
        </div>

        {/* Action Protocol Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              HEALTHY PROTOCOL
            </div>
            <p className="text-[11px] text-slate-300">
              Rolling 50 EV &gt; 0.10R and within 70% of historical baseline. Strategy eligible for Live execution.
            </p>
          </div>

          <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              WATCH PROTOCOL
            </div>
            <p className="text-[11px] text-slate-300">
              Rolling 20/50 EV drops below 0.05R or DD reaches 1.0x historical max. Position size automatically halved.
            </p>
          </div>

          <div className="p-3 rounded bg-rose-950/20 border border-rose-800/40 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <TrendingDown className="w-4 h-4" />
              DECAYING PROTOCOL
            </div>
            <p className="text-[11px] text-slate-300">
              Rolling 100 EV &le; 0.00R or structural regime failure. Strategy immediately demoted to Retired.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Contrast Chart (Healthy vs Decaying) */}
      <EdgeDecayChart />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
        <span className="text-xs text-slate-400 font-bold uppercase mr-2">Status Filter:</span>
        <button
          onClick={() => setFilterHealth('ALL')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterHealth === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({strategies.length})
        </button>
        <button
          onClick={() => setFilterHealth('HEALTHY')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterHealth === 'HEALTHY' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          HEALTHY ({strategies.filter((s) => s.edgeHealth === 'HEALTHY').length})
        </button>
        <button
          onClick={() => setFilterHealth('WATCH')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterHealth === 'WATCH' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          WATCH ({strategies.filter((s) => s.edgeHealth === 'WATCH').length})
        </button>
        <button
          onClick={() => setFilterHealth('DECAYING')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterHealth === 'DECAYING' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          DECAYING ({strategies.filter((s) => s.edgeHealth === 'DECAYING').length})
        </button>
      </div>

      {/* Strategy Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStrategies.map((s) => {
          const isHealthy = s.edgeHealth === 'HEALTHY';
          const isDecaying = s.edgeHealth === 'DECAYING';

          return (
            <div
              key={s.id}
              className={`p-5 rounded-lg border transition-all space-y-4 ${
                isHealthy
                  ? 'bg-[#0a0f18] border-slate-800 hover:border-emerald-700/60'
                  : isDecaying
                  ? 'bg-rose-950/10 border-rose-900/60 hover:border-rose-700'
                  : 'bg-amber-950/10 border-amber-900/60 hover:border-amber-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-400">{s.id}</span>
                    <StatusBadge type="market" value={s.market} size="sm" />
                    <StatusBadge type="stage" value={s.status} size="sm" />
                  </div>
                  <h3
                    onClick={() => onSelectStrategy(s.id)}
                    className="text-base font-bold text-slate-100 hover:text-blue-400 cursor-pointer"
                  >
                    {s.name}
                  </h3>
                </div>

                <StatusBadge type="health" value={s.edgeHealth} size="md" />
              </div>

              {/* Rolling Edge Comparative Grid */}
              <div className="grid grid-cols-4 gap-2 text-center font-mono-num text-xs border-y border-slate-800/80 py-3">
                <div className="p-2 rounded bg-slate-900/80">
                  <span className="text-[10px] text-slate-500 block">OVERALL EV</span>
                  <span className={`font-bold ${s.metrics.evPerTrade > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    +{s.metrics.evPerTrade}R
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900/80">
                  <span className="text-[10px] text-slate-500 block">ROLLING 100</span>
                  <span className={`font-bold ${s.metrics.rolling100EV > 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                    +{s.metrics.rolling100EV}R
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900/80">
                  <span className="text-[10px] text-slate-500 block">ROLLING 50</span>
                  <span className={`font-bold ${s.metrics.rolling50EV > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    +{s.metrics.rolling50EV}R
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900/80">
                  <span className="text-[10px] text-slate-500 block">ROLLING 20</span>
                  <span className={`font-bold ${s.metrics.rolling20EV > 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    +{s.metrics.rolling20EV}R
                  </span>
                </div>
              </div>

              {/* Health Diagnostics Details */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono-num text-slate-300">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Historical PF:</span>
                  <span className="font-bold">{s.metrics.profitFactor}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Max Drawdown:</span>
                  <span className="font-bold text-rose-400">{s.metrics.maxDrawdownR}R</span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Consecutive Losses:</span>
                  <span className="font-bold">{s.metrics.maxConsecutiveLosses} max</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onSelectStrategy(s.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                >
                  View Strategy Diagnostics
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
