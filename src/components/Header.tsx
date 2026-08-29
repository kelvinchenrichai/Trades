/**
 * No-Brain EV Lab — Top Header Bar
 */

import React from 'react';
import { SupportedTimezone } from '../services/calendar/sessionCalendar';
import { Strategy } from '../types';
import { Globe, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  timezone: SupportedTimezone;
  onTimezoneChange: (tz: SupportedTimezone) => void;
  strategies: Strategy[];
  selectedStrategyId?: string;
  onSelectStrategy?: (id: string) => void;
  showStrategySelector?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  timezone,
  onTimezoneChange,
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  showStrategySelector = false,
}) => {
  return (
    <header className="bg-[#090d16]/90 backdrop-blur border-b border-slate-800/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 font-mono">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>EV Lab</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-blue-400 font-semibold">{title}</span>
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Controls & Badges */}
      <div className="flex items-center gap-3">
        {/* Strategy Jump Selector */}
        {showStrategySelector && onSelectStrategy && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Strategy:</span>
            <select
              value={selectedStrategyId || ''}
              onChange={(e) => onSelectStrategy(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 font-mono focus:outline-none focus:border-blue-500"
            >
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.id}] {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Timezone Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value as SupportedTimezone)}
            className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
          >
            <option value="America/New_York">ET (New York)</option>
            <option value="UTC">UTC (Universal)</option>
            <option value="Asia/Taipei">Asia / Taipei (TPE)</option>
            <option value="EXCHANGE">Exchange Session</option>
          </select>
        </div>

        {/* Prominent Demo Mock Notice */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/80 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>DEMO / MOCK DATA</span>
        </div>
      </div>
    </header>
  );
};
