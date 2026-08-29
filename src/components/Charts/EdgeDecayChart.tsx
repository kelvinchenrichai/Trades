/**
 * No-Brain EV Lab — Edge Decay Comparative Visualization
 * Compares Healthy Stable Edge vs Decaying Edge evolution over 2021-2026.
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

export const EdgeDecayChart: React.FC = () => {
  const data = [
    { period: '2021 H1', stableEV: 0.18, decayingEV: 0.30, baseline: 0 },
    { period: '2021 H2', stableEV: 0.17, decayingEV: 0.28, baseline: 0 },
    { period: '2022 H1', stableEV: 0.19, decayingEV: 0.25, baseline: 0 },
    { period: '2022 H2', stableEV: 0.16, decayingEV: 0.22, baseline: 0 },
    { period: '2023 H1', stableEV: 0.20, decayingEV: 0.18, baseline: 0 },
    { period: '2023 H2', stableEV: 0.18, decayingEV: 0.13, baseline: 0 },
    { period: '2024 H1', stableEV: 0.17, decayingEV: 0.08, baseline: 0 },
    { period: '2024 H2', stableEV: 0.19, decayingEV: 0.04, baseline: 0 },
    { period: '2025 H1', stableEV: 0.18, decayingEV: -0.01, baseline: 0 },
    { period: '2025 H2', stableEV: 0.16, decayingEV: -0.04, baseline: 0 },
    { period: '2026 H1', stableEV: 0.18, decayingEV: -0.08, baseline: 0 },
  ];

  return (
    <div className="w-full bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div>
          <div className="text-sm font-bold font-mono text-slate-200 uppercase flex items-center gap-2">
            Edge Health Trajectory Contrast (2021 — 2026)
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Observing structural edge erosion over multi-year institutional regimes
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            Stable Edge (NQ-FTM-001) → HEALTHY
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Decaying Edge (NQ-OMB-001) → DECAYING
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <ReferenceLine y={0} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: '0.00R (Breakeven Zero Line)', fill: '#ef4444', fontSize: 11, position: 'insideBottomRight' }} />

            <XAxis
              dataKey="period"
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              domain={[-0.15, 0.35]}
              tickFormatter={(v) => `${v > 0 ? `+${v}` : v}R`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload;
                  return (
                    <div className="p-3 bg-slate-900 border border-slate-700 rounded shadow-xl text-xs font-mono space-y-1.5">
                      <div className="text-slate-300 font-bold border-b border-slate-800 pb-1">{pt.period} Review</div>
                      <div className="text-emerald-400 flex items-center justify-between gap-4">
                        <span>Stable Strategy (NQ-FTM):</span>
                        <span className="font-bold">+{pt.stableEV}R (HEALTHY)</span>
                      </div>
                      <div className="text-rose-400 flex items-center justify-between gap-4">
                        <span>Decaying Strategy (NQ-OMB):</span>
                        <span className="font-bold">{pt.decayingEV > 0 ? `+${pt.decayingEV}` : pt.decayingEV}R (DECAYING)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', paddingTop: '8px' }}
            />

            <Line
              type="monotone"
              dataKey="stableEV"
              name="Stable Edge (Persistent Plateau)"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981' }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="decayingEV"
              name="Decaying Edge (Structural Degradation)"
              stroke="#ef4444"
              strokeWidth={3}
              strokeDasharray="4 2"
              dot={{ r: 4, fill: '#ef4444' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/40 text-xs font-mono text-emerald-200/90">
          <strong className="text-emerald-300 font-bold block mb-0.5">Healthy Strategy Characteristics:</strong>
          EV stays within tight statistical bounds (+0.16R to +0.20R) across multi-year macroeconomic cycles. No structural drop below zero.
        </div>
        <div className="p-2.5 rounded bg-rose-950/20 border border-rose-800/40 text-xs font-mono text-rose-200/90">
          <strong className="text-rose-300 font-bold block mb-0.5">Decaying Strategy Characteristics:</strong>
          Early massive peak (+0.30R in 2021) followed by persistent downward slope to negative EV (-0.08R in 2026). Crowded out or regime shifted.
        </div>
      </div>
    </div>
  );
};
