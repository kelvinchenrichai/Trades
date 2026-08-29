/**
 * No-Brain EV Lab — Prop Firm Monte Carlo Paths Chart
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
} from 'recharts';
import { PropSimulationResult } from '../../types';

interface PropMonteCarloChartProps {
  result: PropSimulationResult;
  height?: number;
}

export const PropMonteCarloChart: React.FC<PropMonteCarloChartProps> = ({
  result,
  height = 300,
}) => {
  if (!result || !result.paths || result.paths.length === 0) return null;

  // Build unified time series for paths
  const maxDays = Math.max(...result.paths.map((p) => p.dailyEquities.length));
  const chartData: any[] = [];

  for (let day = 0; day < maxDays; day++) {
    const row: any = { day };
    result.paths.forEach((p, idx) => {
      if (day < p.dailyEquities.length) {
        row[`sim_${idx}`] = p.dailyEquities[day];
      }
    });
    chartData.push(row);
  }

  const accountSize = Number(result?.rules?.accountSize) || 50000;
  const targetEquity = accountSize + (Number(result?.rules?.profitTarget) || 3000);
  const maxDDEquity = accountSize - (Number(result?.rules?.maxDrawdown) || 2500);

  const yDomainMin = isNaN(maxDDEquity) ? 45000 : maxDDEquity - 1000;
  const yDomainMax = isNaN(targetEquity) ? 55000 : targetEquity + 1000;

  return (
    <div className="w-full bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div>
          <span className="text-xs font-mono font-bold text-slate-200 uppercase">
            Monte Carlo Equity Trajectories (Sample Simulation Paths)
          </span>
          <span className="text-[10px] font-mono text-slate-400 block">
            {result.totalSimulations} Total Iterations | Profit Target vs Maximum Drawdown
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Pass Prob: {result.passProbability || 0}%
          </span>
          <span className="text-rose-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Fail Prob: {result.failureProbability || 0}%
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />

            <ReferenceLine
              y={targetEquity}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 2"
              label={{
                value: `Profit Target: $${targetEquity.toLocaleString()}`,
                fill: '#10b981',
                fontSize: 10,
                position: 'top',
              }}
            />

            <ReferenceLine
              y={accountSize}
              stroke="#64748b"
              strokeDasharray="2 2"
              label={{
                value: `Starting Balance: $${accountSize.toLocaleString()}`,
                fill: '#64748b',
                fontSize: 10,
                position: 'insideRight',
              }}
            />

            <ReferenceLine
              y={maxDDEquity}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4 2"
              label={{
                value: `Max DD Limit: $${maxDDEquity.toLocaleString()}`,
                fill: '#ef4444',
                fontSize: 10,
                position: 'bottom',
              }}
            />

            <XAxis
              dataKey="day"
              stroke="#64748b"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              tickFormatter={(v) => `Day ${v}`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              domain={[yDomainMin, yDomainMax]}
              tickFormatter={(v) => (typeof v === 'number' && !isNaN(v) ? `$${(v / 1000).toFixed(0)}k` : '')}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-2 bg-slate-900 border border-slate-700 rounded shadow text-xs font-mono">
                      <div className="text-slate-400 font-bold mb-1">Evaluation Day {label}</div>
                      <div className="text-slate-300">Active simulated path balances rendered</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {result.paths.map((p, idx) => {
              const isPass = p.status === 'PASSED';
              const strokeColor = isPass ? '#10b981' : '#ef4444';
              return (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={`sim_${idx}`}
                  stroke={strokeColor}
                  strokeWidth={1.2}
                  opacity={0.45}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
