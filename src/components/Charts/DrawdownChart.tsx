/**
 * No-Brain EV Lab — Drawdown Curve Chart (Underwater Analysis)
 */

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { DrawdownPoint } from '../../types';

interface DrawdownChartProps {
  data: DrawdownPoint[];
  height?: number;
}

export const DrawdownChart: React.FC<DrawdownChartProps> = ({ data, height = 220 }) => {
  if (!data || data.length === 0) return null;

  const validDD = data.map((d) => Number(d.drawdownR)).filter((n) => Number.isFinite(n));
  const minDD = validDD.length > 0 ? Math.floor(Math.min(...validDD, -1)) : -5;

  return (
    <div className="w-full bg-[#0a0f18] p-3 rounded-lg border border-slate-800">
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
        <span className="text-xs font-mono font-bold text-slate-300 uppercase">
          Underwater Drawdown (R-Multiples)
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
          Max DD: {Math.abs(minDD)}R
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <ReferenceLine y={0} stroke="#475569" />

            <XAxis
              dataKey="tradeNumber"
              stroke="#64748b"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              tickFormatter={(v) => `T#${v}`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              domain={[minDD - 0.5, 0]}
              tickFormatter={(v) => (typeof v === 'number' && !isNaN(v) ? `${v}R` : '')}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as DrawdownPoint;
                  return (
                    <div className="p-2 bg-slate-900 border border-slate-700 rounded shadow text-xs font-mono">
                      <div className="text-slate-400">Trade #{pt.tradeNumber} ({pt.date})</div>
                      <div className="text-rose-400 font-bold">Drawdown: {pt.drawdownR}R ({pt.underwaterPercent}%)</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="drawdownR"
              stroke="#ef4444"
              strokeWidth={1.5}
              fill="url(#ddGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
