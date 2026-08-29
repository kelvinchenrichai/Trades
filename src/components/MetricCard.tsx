/**
 * No-Brain EV Lab — Institutional Metric Block
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  tooltip?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate';
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  tooltip,
  badge,
  badgeColor = 'slate',
  highlight = false,
}) => {
  const trendColor =
    trend === 'positive'
      ? 'text-emerald-400'
      : trend === 'negative'
      ? 'text-rose-400'
      : 'text-slate-300';

  const badgeColorClass = {
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-800',
    rose: 'bg-rose-950/80 text-rose-300 border-rose-800',
    blue: 'bg-blue-950/80 text-blue-300 border-blue-800',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-800',
  }[badgeColor || 'slate'] || 'bg-slate-800/80 text-slate-300 border-slate-700';

  // Safeguard against NaN or undefined values passed to React children
  const formatDisplayValue = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '--';
    if (typeof val === 'number') {
      if (isNaN(val)) return '--';
      return String(val);
    }
    if (val === 'NaN' || val === 'NaN%' || val === 'NaNR') return '--';
    return String(val);
  };

  const displayValue = formatDisplayValue(value);
  const displaySubValue = subValue ? (subValue.includes('NaN') ? '' : subValue) : undefined;

  return (
    <div
      className={`relative p-3.5 rounded-lg border transition-all ${
        highlight
          ? 'bg-slate-900/90 border-blue-500/40 shadow-sm shadow-blue-500/10'
          : 'bg-[#0f172a]/70 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase font-mono flex items-center gap-1">
          {label}
          {tooltip && (
            <span title={tooltip} className="cursor-help text-slate-500 hover:text-slate-300">
              <HelpCircle className="w-3 h-3" />
            </span>
          )}
        </span>
        {badge && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeColorClass}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className={`text-xl font-bold font-mono-num ${trendColor}`}>
          {displayValue}
        </div>
        {displaySubValue && (
          <div className="text-xs text-slate-500 font-mono">
            {displaySubValue}
          </div>
        )}
      </div>
    </div>
  );
};
