/**
 * No-Brain EV Lab — Multi-Factor Tournament Leaderboard
 */

import React, { useState } from 'react';
import { Strategy } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { StatusBadge } from '../components/StatusBadge';
import { Trophy, Award, ShieldCheck, Zap, Layers, Activity, ArrowUpRight, Scale } from 'lucide-react';

interface TournamentPageProps {
  strategies: Strategy[];
  onSelectStrategy: (id: string) => void;
}

export const TournamentPage: React.FC<TournamentPageProps> = ({
  strategies,
  onSelectStrategy,
}) => {
  const [filterMode, setFilterMode] = useState<
    'ALL' | 'NQ' | 'GC' | 'CRYPTO' | 'PROP' | 'SIMPLE'
  >('ALL');

  const [compareAId, setCompareAId] = useState<string>(strategies[0]?.id || '');
  const [compareBId, setCompareBId] = useState<string>(strategies[1]?.id || '');

  const filteredStrategies = [...strategies]
    .filter((s) => {
      if (filterMode === 'NQ') return s.market === 'NQ';
      if (filterMode === 'GC') return s.market === 'GC';
      if (filterMode === 'CRYPTO') return s.market === 'CRYPTO';
      if (filterMode === 'PROP') return s.metrics.propFriendlyScore >= 80;
      if (filterMode === 'SIMPLE') return s.complexityScore <= 3;
      return true;
    })
    .sort((a, b) => b.metrics.tournament.totalScore - a.metrics.tournament.totalScore);

  const stratA = strategies.find((s) => s.id === compareAId) || strategies[0];
  const stratB = strategies.find((s) => s.id === compareBId) || strategies[1];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      <DisclaimerBanner compact />

      {/* Top Scoring Model Description */}
      <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              100-Point Institutional Tournament Scoring Model
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strategies are ranked systematically by quantitative robustness, not subjective curve-fit profits.
            </p>
          </div>
        </div>

        {/* 7 Core Weights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">OOS EV</span>
            <span className="text-base font-bold text-emerald-400">25 pts</span>
            <span className="text-[9px] text-slate-500 block">Blind Performance</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">STABILITY</span>
            <span className="text-base font-bold text-cyan-400">20 pts</span>
            <span className="text-[9px] text-slate-500 block">Plateau Robustness</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">MAX DD</span>
            <span className="text-base font-bold text-indigo-400">15 pts</span>
            <span className="text-[9px] text-slate-500 block">Capital Preservation</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">EDGE HEALTH</span>
            <span className="text-base font-bold text-amber-400">15 pts</span>
            <span className="text-[9px] text-slate-500 block">No Rolling Decay</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">PROP SURVIVAL</span>
            <span className="text-base font-bold text-purple-400">15 pts</span>
            <span className="text-[9px] text-slate-500 block">Trailing Rule Fit</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">EXEC SIMPLICITY</span>
            <span className="text-base font-bold text-sky-400">5 pts</span>
            <span className="text-[9px] text-slate-500 block">Low Friction</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">COMPLEXITY</span>
            <span className="text-base font-bold text-emerald-300">5 pts</span>
            <span className="text-[9px] text-slate-500 block">≤3 Conditions</span>
          </div>
        </div>
      </div>

      {/* Filter Mode Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
        <span className="text-xs text-slate-400 font-bold uppercase mr-2">Filter View:</span>
        <button
          onClick={() => setFilterMode('ALL')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterMode === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Strategies ({strategies.length})
        </button>
        <button
          onClick={() => setFilterMode('NQ')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterMode === 'NQ' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          NQ Futures
        </button>
        <button
          onClick={() => setFilterMode('GC')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterMode === 'GC' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Gold (GC)
        </button>
        <button
          onClick={() => setFilterMode('CRYPTO')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterMode === 'CRYPTO' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Crypto
        </button>
        <button
          onClick={() => setFilterMode('PROP')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterMode === 'PROP' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Prop-Friendly Focus
        </button>
        <button
          onClick={() => setFilterMode('SIMPLE')}
          className={`py-1.5 px-3 rounded text-xs font-semibold ${
            filterMode === 'SIMPLE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Simplest (&le;3 Complexity)
        </button>
      </div>

      {/* Tournament Leaderboard Table */}
      <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-2 text-center w-12">RANK</th>
                <th className="py-2.5 px-3">STRATEGY</th>
                <th className="py-2.5 px-2">MARKET</th>
                <th className="py-2.5 px-2 text-right">TOTAL SCORE</th>
                <th className="py-2.5 px-2 text-right">OOS EV (25)</th>
                <th className="py-2.5 px-2 text-right">STABILITY (20)</th>
                <th className="py-2.5 px-2 text-right">MAX DD (15)</th>
                <th className="py-2.5 px-2 text-right">HEALTH (15)</th>
                <th className="py-2.5 px-2 text-right">PROP (15)</th>
                <th className="py-2.5 px-2 text-right">SIMPLICITY (10)</th>
                <th className="py-2.5 px-2 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-num">
              {filteredStrategies.map((s, idx) => {
                const isChampion = idx === 0;
                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                    onClick={() => onSelectStrategy(s.id)}
                  >
                    <td className="py-3 px-2 text-center font-bold">
                      {isChampion ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          1
                        </span>
                      ) : (
                        <span className="text-slate-500">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{s.id}</div>
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge type="market" value={s.market} size="sm" />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-base font-bold text-blue-400">
                        {s.metrics.tournament.totalScore}
                      </span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </td>
                    <td className="py-3 px-2 text-right text-emerald-400 font-bold">
                      {s.metrics.tournament.oosEvScore}
                    </td>
                    <td className="py-3 px-2 text-right text-cyan-400">
                      {s.metrics.tournament.stabilityScore}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300">
                      {s.metrics.tournament.maxDdScore}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300">
                      {s.metrics.tournament.edgeHealthScore}
                    </td>
                    <td className="py-3 px-2 text-right text-purple-400">
                      {s.metrics.tournament.propScore}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300">
                      {s.metrics.tournament.simplicityScore + s.metrics.tournament.complexityScore}
                    </td>
                    <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectStrategy(s.id)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        title="View Strategy"
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

      {/* Strategy Head-to-Head Comparison Matrix */}
      <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            Head-to-Head Multi-Factor Comparison
          </h3>
          <span className="text-[10px] text-slate-500">Select any two strategies</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strategy A Selector & Breakdown */}
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">STRATEGY A</label>
              <select
                value={compareAId}
                onChange={(e) => setCompareAId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
              >
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.market}] {s.name} ({s.metrics.tournament.totalScore} pts)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 font-mono-num text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Score:</span>
                <span className="font-bold text-blue-400">{stratA.metrics.tournament.totalScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EV / Trade:</span>
                <span className="font-bold text-emerald-400">+{stratA.metrics.evPerTrade}R</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profit Factor:</span>
                <span className="text-slate-200">{stratA.metrics.profitFactor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Drawdown:</span>
                <span className="text-rose-400">{stratA.metrics.maxDrawdownR}R</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Complexity Score:</span>
                <span className="text-slate-200">{stratA.complexityScore}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prop Friendly:</span>
                <span className="text-purple-400">{stratA.metrics.propFriendlyScore}/100</span>
              </div>
            </div>
          </div>

          {/* Strategy B Selector & Breakdown */}
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">STRATEGY B</label>
              <select
                value={compareBId}
                onChange={(e) => setCompareBId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
              >
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.market}] {s.name} ({s.metrics.tournament.totalScore} pts)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 font-mono-num text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Score:</span>
                <span className="font-bold text-blue-400">{stratB.metrics.tournament.totalScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EV / Trade:</span>
                <span className="font-bold text-emerald-400">+{stratB.metrics.evPerTrade}R</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profit Factor:</span>
                <span className="text-slate-200">{stratB.metrics.profitFactor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Drawdown:</span>
                <span className="text-rose-400">{stratB.metrics.maxDrawdownR}R</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Complexity Score:</span>
                <span className="text-slate-200">{stratB.complexityScore}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prop Friendly:</span>
                <span className="text-purple-400">{stratB.metrics.propFriendlyScore}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
