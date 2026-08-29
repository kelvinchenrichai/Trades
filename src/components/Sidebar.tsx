/**
 * No-Brain EV Lab — Left Navigation Sidebar
 */

import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  FileCode2,
  PlaySquare,
  Trophy,
  Activity,
  ShieldCheck,
  Database,
  Sliders,
  Terminal,
  Cpu,
  Layers,
  Clock,
} from 'lucide-react';
import { SupportedTimezone, formatTimeInTimezone } from '../services/calendar/sessionCalendar';

export type PageId =
  | 'dashboard'
  | 'strategy-lab'
  | 'strategy-detail'
  | 'backtests'
  | 'tournament'
  | 'edge-health'
  | 'prop-simulator'
  | 'data'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  timezone: SupportedTimezone;
  activeStrategyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  timezone,
  activeStrategyCount,
}) => {
  const [timeNow, setTimeNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems: Array<{ id: PageId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'strategy-lab', label: 'Strategy Lab', icon: FlaskConical, badge: String(activeStrategyCount) },
    { id: 'strategy-detail', label: 'Strategy Detail', icon: FileCode2 },
    { id: 'backtests', label: 'Backtests', icon: PlaySquare },
    { id: 'tournament', label: 'Tournament', icon: Trophy, badge: 'TOP' },
    { id: 'edge-health', label: 'Edge Health', icon: Activity },
    { id: 'prop-simulator', label: 'Prop Simulator', icon: ShieldCheck },
    { id: 'data', label: 'Data Registry', icon: Database },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 font-mono select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-inner">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 tracking-tight font-sans flex items-center gap-1.5">
                <span>No-Brain EV Lab</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono tracking-wider">
                QUANT RESEARCH v1.0
              </div>
            </div>
          </div>
        </div>

        {/* System Status Indicator */}
        <div className="px-4 py-2.5 bg-[#0d1320] border-b border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Mock Engine Active
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
            DEMO
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Research Platform
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Info & Time Clocks */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070a10] space-y-2 text-[11px]">
        <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Clock ({timezone}):
            </span>
          </div>
          <div className="font-mono text-xs font-bold text-slate-200 font-mono-num">
            {formatTimeInTimezone(timeNow, timezone, true)}
          </div>
        </div>

        <div className="text-[10px] text-slate-500 text-center leading-tight">
          No-Brain Philosophy: <br />
          <span className="text-slate-400 font-semibold">Plateau &gt; Peak · Simple &gt; Complex</span>
        </div>
      </div>
    </aside>
  );
};
