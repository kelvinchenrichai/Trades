/**
 * No-Brain EV Lab — Parameter Stability Heatmap & Plateau Visualizer
 * Core Philosophy: Plateau > Peak (Robust neighborhood vs Overfit single spikes)
 */

import React from 'react';
import { ParameterStabilityCell } from '../../types';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface StabilityHeatmapProps {
  cells: ParameterStabilityCell[];
  parameterName?: string;
}

export const StabilityHeatmap: React.FC<StabilityHeatmapProps> = ({
  cells,
  parameterName = 'Threshold Parameter Spectrum',
}) => {
  if (!cells || cells.length === 0) return null;

  const maxEV = Math.max(...cells.map((c) => c.ev), 0.01);
  const minEV = Math.min(...cells.map((c) => c.ev), 0);

  // Check if any overfit risk is detected
  const hasOverfitRisk = cells.some((c) => c.isOverfitRisk);
  const robustPlateauCount = cells.filter((c) => c.isPlateau).length;

  return (
    <div className="w-full bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div>
          <div className="text-xs font-bold uppercase text-slate-200 flex items-center gap-2">
            <span>Parameter Stability Plateau Analysis</span>
            <span className="text-[10px] text-slate-400 font-normal">({parameterName})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Evaluate neighboring parameter stability. Robust edges form wide plateaus rather than isolated spikes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasOverfitRisk ? (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              OVERFIT RISK DETECTED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              PLATEAU CONFIRMED ({robustPlateauCount} Adjacent Bands)
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="py-2 px-2.5 font-semibold">PARAMETER VALUE</th>
              <th className="py-2 px-2.5 font-semibold text-center">STATUS</th>
              <th className="py-2 px-2.5 font-semibold text-right">EV / TRADE</th>
              <th className="py-2 px-2.5 font-semibold text-right">PROFIT FACTOR</th>
              <th className="py-2 px-2.5 font-semibold text-right">MAX DD</th>
              <th className="py-2 px-2.5 font-semibold text-right">WIN RATE</th>
              <th className="py-2 px-2.5 font-semibold text-right">TRADES</th>
              <th className="py-2 px-3 font-semibold">EV VISUAL PROFILE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono-num">
            {cells.map((cell, idx) => {
              const evNormalized = maxEV > minEV ? Math.max(0, (cell.ev - minEV) / (maxEV - minEV)) : 0.5;
              const evWidth = Math.round(evNormalized * 100);

              let rowBg = 'hover:bg-slate-900/50';
              if (cell.isCurrent) rowBg = 'bg-blue-950/30 border-l-2 border-l-blue-500';

              return (
                <tr key={idx} className={rowBg}>
                  <td className="py-2.5 px-2.5 font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      {cell.label}
                      {cell.isCurrent && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          ACTIVE
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    {cell.isOverfitRisk ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] border border-rose-800">
                        OVERFIT SPIKE
                      </span>
                    ) : cell.isPlateau ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800">
                        PLATEAU ZONE
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        MARGINAL
                      </span>
                    )}
                  </td>
                  <td className={`py-2.5 px-2.5 text-right font-bold ${cell.ev >= 0.15 ? 'text-emerald-400' : cell.ev > 0 ? 'text-slate-200' : 'text-rose-400'}`}>
                    {cell.ev > 0 ? `+${cell.ev}` : cell.ev}R
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-slate-300">
                    {cell.profitFactor}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-slate-400">
                    {cell.maxDrawdownR}R
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-slate-300">
                    {cell.winRate}%
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-slate-400">
                    {cell.totalTrades}
                  </td>
                  <td className="py-2.5 px-3 min-w-[140px]">
                    <div className="w-full bg-slate-800/80 h-2.5 rounded overflow-hidden flex items-center">
                      <div
                        className={`h-full rounded transition-all ${
                          cell.ev >= 0.15
                            ? 'bg-emerald-500'
                            : cell.ev > 0
                            ? 'bg-blue-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(5, evWidth)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
