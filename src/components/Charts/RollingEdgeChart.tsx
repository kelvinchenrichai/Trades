/**
 * No-Brain EV Lab — Rolling Edge Multi-Window Chart
 * Tracks Rolling 20, 50, and 100 trade EV to identify Edge stability vs decay.
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
  ReferenceLine,
  Legend,
} from 'recharts';
import { RollingEdgePoint } from '../../types';

interface RollingEdgeChartProps {
  data: RollingEdgePoint[];
  height?: number;
}

export const RollingEdgeChart: React.FC<RollingEdgeChartProps> = ({ data, height = 260 }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full bg-[#0a0f18] p-3 rounded-lg border border-slate-800">
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">
            Rolling EV Decay Monitor
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            (R per Trade Expectancy)
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <ReferenceLine y={0} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: '0.00R (Breakeven)', fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} />

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
              tickFormatter={(v) => `${v}R`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as RollingEdgePoint;
                  return (
                    <div className="p-2.5 bg-slate-900 border border-slate-700 rounded shadow text-xs font-mono space-y-1">
                      <div className="text-slate-400 font-semibold">Trade #{pt.tradeNumber} ({pt.date})</div>
                      <div className="text-cyan-400">Rolling 20 EV: {pt.rolling20EV > 0 ? `+${pt.rolling20EV}` : pt.rolling20EV}R</div>
                      <div className="text-emerald-400">Rolling 50 EV: {pt.rolling50EV > 0 ? `+${pt.rolling50EV}` : pt.rolling50EV}R</div>
                      <div className="text-indigo-400">Rolling 100 EV: {pt.rolling100EV > 0 ? `+${pt.rolling100EV}` : pt.rolling100EV}R</div>
                      <div className="text-slate-400 border-t border-slate-800 pt-1">Overall EV: {pt.overallEV > 0 ? `+${pt.overallEV}` : pt.overallEV}R</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', paddingTop: '6px' }}
            />

            <Line
              type="monotone"
              dataKey="rolling20EV"
              name="Rolling 20 Trades"
              stroke="#38bdf8"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="rolling50EV"
              name="Rolling 50 Trades"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="rolling100EV"
              name="Rolling 100 Trades"
              stroke="#818cf8"
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
