/**
 * No-Brain EV Lab — Formal Strategy Audit Report Generator
 */

import React from 'react';
import { Strategy } from '../types';
import { StatusBadge } from './StatusBadge';
import { X, Printer, Download, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface ReportModalProps {
  strategy: Strategy;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ strategy, onClose }) => {
  const isPass = strategy.oosResult === 'PASS' && strategy.edgeHealth === 'HEALTHY';
  const isWatch = strategy.oosResult === 'WATCH' || strategy.edgeHealth === 'WATCH';
  const verdict = isPass ? 'PASS' : isWatch ? 'WATCH' : 'FAIL';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b111e] border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col font-mono text-xs">
        {/* Header Bar */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-950 border border-blue-800 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                QUANTITATIVE STRATEGY AUDIT REPORT
              </div>
              <h2 className="text-base font-bold text-slate-100 font-sans">
                {strategy.name} ({strategy.id})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Top Verdict Callout */}
          <div
            className={`p-4 rounded-lg border flex items-center justify-between ${
              verdict === 'PASS'
                ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-300'
                : verdict === 'WATCH'
                ? 'bg-amber-950/40 border-amber-700/80 text-amber-300'
                : 'bg-rose-950/40 border-rose-700/80 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {verdict === 'PASS' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : verdict === 'WATCH' ? (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-400" />
              )}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider">
                  SYSTEM EVALUATION AUDIT VERDICT
                </div>
                <div className="text-xl font-bold font-sans">
                  STRATEGY VERDICT: {verdict}
                </div>
                <div className="text-xs opacity-90 mt-0.5">
                  {verdict === 'PASS'
                    ? 'Strategy passes strict OOS criteria, parameter plateau checks & low-friction validation.'
                    : verdict === 'WATCH'
                    ? 'Marginal performance detected in recent samples or parameter stability. Stage locked in Research.'
                    : 'Strategy fails statistical stability or exhibits structural edge decay.'}
                </div>
              </div>
            </div>

            <div className="text-right font-mono-num">
              <div className="text-[10px] text-slate-400 uppercase">Tournament Score</div>
              <div className="text-2xl font-bold text-slate-100">
                {strategy.metrics.tournament.totalScore}/100
              </div>
            </div>
          </div>

          {/* Section 1: Hypothesis & Mechanical Rules */}
          <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide border-b border-slate-800 pb-1.5">
              1. Hypothesis & No-Brain Mechanical Rules
            </h4>
            <div className="space-y-2 text-slate-300">
              <div>
                <span className="text-slate-500 font-semibold block">HYPOTHESIS:</span>
                <p className="text-slate-300 leading-relaxed">{strategy.hypothesis}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">WHY EDGE EXISTS:</span>
                <p className="text-slate-300 leading-relaxed">{strategy.edgeExplanation}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-blue-400 font-bold block mb-1.5">ENTRY CONDITIONS (≤3):</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {strategy.entryRules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1.5">EXIT CONDITIONS:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {strategy.exitRules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Key Statistical Summary Table */}
          <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-800 font-mono-num">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide border-b border-slate-800 pb-1.5">
              2. Core Performance & Risk Multiples
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">EV / TRADE</div>
                <div className="text-sm font-bold text-emerald-400">+{strategy.metrics.evPerTrade}R</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">PROFIT FACTOR</div>
                <div className="text-sm font-bold text-slate-200">{strategy.metrics.profitFactor}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">WIN RATE</div>
                <div className="text-sm font-bold text-slate-200">{strategy.metrics.winRate}%</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">MAX DRAWDOWN</div>
                <div className="text-sm font-bold text-rose-400">{strategy.metrics.maxDrawdownR}R</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">TOTAL TRADES</div>
                <div className="text-sm font-bold text-slate-200">{strategy.metrics.totalTrades}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">SHARPE RATIO</div>
                <div className="text-sm font-bold text-slate-200">{strategy.metrics.sharpeRatio}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">AVG WIN / LOSS</div>
                <div className="text-xs font-semibold text-slate-300">+{strategy.metrics.avgWinR}R / {strategy.metrics.avgLossR}R</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">WORST DAY</div>
                <div className="text-xs font-semibold text-rose-400">{strategy.metrics.worstDayR}R</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">WORST WEEK</div>
                <div className="text-xs font-semibold text-rose-400">{strategy.metrics.worstWeekR}R</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">MAX CONSECUTIVE LOSS</div>
                <div className="text-xs font-semibold text-slate-300">{strategy.metrics.maxConsecutiveLosses} Trades</div>
              </div>
            </div>
          </div>

          {/* Section 3: Train / Validation / OOS Partitions */}
          <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide border-b border-slate-800 pb-1.5">
              3. Walk-Forward / Out-of-Sample Partition Integrity
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="pb-1.5">PARTITION</th>
                    <th className="pb-1.5">DATE RANGE</th>
                    <th className="pb-1.5 text-right">TRADES</th>
                    <th className="pb-1.5 text-right">EV</th>
                    <th className="pb-1.5 text-right">PF</th>
                    <th className="pb-1.5 text-right">WIN RATE</th>
                    <th className="pb-1.5 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-num">
                  {strategy.oosPartitions.map((p, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-1.5 font-bold text-slate-300">{p.segment}</td>
                      <td className="py-1.5 text-slate-400">{p.period}</td>
                      <td className="py-1.5 text-right text-slate-300">{p.trades}</td>
                      <td className="py-1.5 text-right font-bold text-emerald-400">+{p.ev}R</td>
                      <td className="py-1.5 text-right text-slate-300">{p.profitFactor}</td>
                      <td className="py-1.5 text-right text-slate-300">{p.winRate}%</td>
                      <td className="py-1.5 text-right">
                        <StatusBadge type="oos" value={p.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Prop Firm Compatibility */}
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              4. Prop Evaluation Suitability Score
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-200">
                  Prop Friendly Score: <span className="text-emerald-400">{strategy.metrics.propFriendlyScore}/100</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Due to tight Max DD ({strategy.metrics.maxDrawdownR}R) and zero intraday reaction chasing, this strategy has very low daily loss violation risk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-slate-500 text-[10px]">
          <span>Generated by No-Brain EV Lab · Institutional Verification Engine</span>
          <span>DEMO / MOCK DATA — NOT REAL TRADING RESULTS</span>
        </div>
      </div>
    </div>
  );
};
