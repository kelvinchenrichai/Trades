/**
 * No-Brain EV Lab — Equity Curve Chart with Train / Validation / OOS / Forward Partitions
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { EquityPoint } from '../../types';

const RefArea = ReferenceArea as any;

interface EquityChartProps {
  data: EquityPoint[];
  height?: number;
  showPartitions?: boolean;
}

export const EquityChart: React.FC<EquityChartProps> = ({
  data,
  height = 320,
  showPartitions = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed border-slate-800 rounded text-slate-500 font-mono text-sm">
        No equity trajectory data available
      </div>
    );
  }

  // Find boundaries for partition shading
  const trainEnd = data.find((d) => d.segment === 'VALIDATION')?.tradeNumber || Math.floor(data.length * 0.45);
  const valEnd = data.find((d) => d.segment === 'OOS')?.tradeNumber || Math.floor(data.length * 0.65);
  const oosEnd = data.find((d) => d.segment === 'FORWARD')?.tradeNumber || Math.floor(data.length * 0.85);
  const maxTrades = data[data.length - 1].tradeNumber;

  const validR = data.map((d) => Number(d.cumulativeR)).filter((n) => Number.isFinite(n));
  const minR = validR.length > 0 ? Math.floor(Math.min(...validR, 0)) : -5;
  const maxR = validR.length > 0 ? Math.ceil(Math.max(...validR, 10)) : 20;

  return (
    <div className="w-full bg-[#0a0f18] p-3 rounded-lg border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">
            Cumulative Return (R-Multiples)
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
            Total: {data[data.length - 1]?.cumulativeR ?? 0}R
          </span>
        </div>

        {showPartitions && (
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-800/80 border border-slate-600 inline-block"></span>
              Train
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-950/60 border border-indigo-700/60 inline-block"></span>
              Val
            </span>
            <span className="flex items-center gap-1 text-emerald-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950/70 border border-emerald-600 inline-block"></span>
              OOS (Blind)
            </span>
            <span className="flex items-center gap-1 text-sky-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-950/70 border border-sky-600 inline-block"></span>
              Forward
            </span>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

            {showPartitions && (
              <>
                <RefArea x1={1} x2={trainEnd} stroke="none" fill="#0f172a" fillOpacity={0.4} />
                <RefArea x1={trainEnd} x2={valEnd} stroke="none" fill="#1e1b4b" fillOpacity={0.3} />
                <RefArea x1={valEnd} x2={oosEnd} stroke="none" fill="#064e3b" fillOpacity={0.25} />
                <RefArea x1={oosEnd} x2={maxTrades} stroke="none" fill="#082f49" fillOpacity={0.3} />
              </>
            )}

            <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />

            <XAxis
              dataKey="tradeNumber"
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickFormatter={(v) => `T#${v}`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              domain={[minR - 1, maxR + 1]}
              tickFormatter={(v) => (typeof v === 'number' && !isNaN(v) ? `${v}R` : '')}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as EquityPoint;
                  return (
                    <div className="p-2.5 bg-slate-900/95 border border-slate-700 rounded shadow-xl text-xs font-mono">
                      <div className="text-slate-400 mb-1">
                        Trade #{pt.tradeNumber} ({pt.date})
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">Equity:</span>
                        <span className="font-bold text-emerald-400">{pt.cumulativeR}R</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400">Partition:</span>
                        <span className="text-cyan-300 font-semibold">{pt.segment}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Line
              type="monotone"
              dataKey="cumulativeR"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
