/**
 * No-Brain EV Lab — Modular Strategy Card
 */

import React from 'react';
import { Strategy } from '../types';
import { StatusBadge } from './StatusBadge';
import { ArrowUpRight, Zap, Shield, Layers, Clock } from 'lucide-react';

interface StrategyCardProps {
  strategy: Strategy;
  onSelect: (strategyId: string) => void;
  onBacktest?: (strategyId: string) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  onSelect,
  onBacktest,
}) => {
  return (
    <div className="bg-[#0f172a]/80 border border-slate-800 hover:border-slate-700 rounded-lg p-4 transition-all flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-blue-950/20 group">
      <div className="space-y-2.5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400">
                {strategy.id}
              </span>
              <StatusBadge type="market" value={strategy.market} size="sm" />
            </div>
            <h3
              onClick={() => onSelect(strategy.id)}
              className="text-base font-bold text-slate-100 hover:text-blue-400 cursor-pointer transition-colors"
            >
              {strategy.name}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusBadge type="stage" value={strategy.status} size="sm" />
            <StatusBadge type="health" value={strategy.edgeHealth} size="sm" />
          </div>
        </div>

        {/* Hypothesis */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {strategy.hypothesis}
        </p>

        {/* Complexity & Execution Friction Bars */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                Complexity
              </span>
              <span className={`font-bold ${strategy.complexityScore <= 3 ? 'text-emerald-400' : strategy.complexityScore <= 6 ? 'text-amber-400' : 'text-rose-400'}`}>
                {strategy.complexityScore}/10
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              {strategy.complexityBreakdown.entryConditions} Entry Cond · {strategy.complexityBreakdown.parametersCount} Params
            </div>
          </div>

          <div className="p-2 rounded bg-slate-900/90 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Friction
              </span>
              <span className={`font-bold ${strategy.executionFrictionScore <= 2 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {strategy.executionFrictionScore}/10
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              {strategy.executionFrictionBreakdown.fixedTimeEntry ? 'Fixed-Time Entry' : 'Intraday Trigger'}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row & Action Footer */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="grid grid-cols-4 gap-1 text-center font-mono-num">
          <div className="p-1.5 rounded bg-slate-900/60">
            <div className="text-[10px] text-slate-500 uppercase">EV/Trade</div>
            <div className={`text-xs font-bold ${strategy.metrics.evPerTrade > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {strategy.metrics.evPerTrade > 0 ? `+${strategy.metrics.evPerTrade}` : strategy.metrics.evPerTrade}R
            </div>
          </div>
          <div className="p-1.5 rounded bg-slate-900/60">
            <div className="text-[10px] text-slate-500 uppercase">PF</div>
            <div className="text-xs font-bold text-slate-200">
              {strategy.metrics.profitFactor}
            </div>
          </div>
          <div className="p-1.5 rounded bg-slate-900/60">
            <div className="text-[10px] text-slate-500 uppercase">Max DD</div>
            <div className="text-xs font-bold text-slate-300">
              {strategy.metrics.maxDrawdownR}R
            </div>
          </div>
          <div className="p-1.5 rounded bg-slate-900/60">
            <div className="text-[10px] text-slate-500 uppercase">OOS</div>
            <div className="text-xs font-bold">
              <StatusBadge type="oos" value={strategy.oosResult} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onSelect(strategy.id)}
            className="flex-1 py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center justify-center gap-1 transition-colors"
          >
            Strategy Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          {onBacktest && (
            <button
              onClick={() => onBacktest(strategy.id)}
              className="py-1.5 px-3 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-mono font-medium transition-colors"
            >
              Run Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
