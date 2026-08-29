/**
 * No-Brain EV Lab — Status & Health Badges
 */

import React from 'react';
import { StrategyStage, EdgeHealthStatus, OOSVerdict, Market } from '../types';

interface StatusBadgeProps {
  type: 'stage' | 'health' | 'oos' | 'market';
  value: StrategyStage | EdgeHealthStatus | OOSVerdict | Market | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-mono' : 'px-2.5 py-1 text-xs font-mono font-medium';

  if (type === 'stage') {
    const stage = value as StrategyStage;
    switch (stage) {
      case 'LIVE':
        return (
          <span className={`inline-flex items-center gap-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </span>
        );
      case 'PAPER':
        return (
          <span className={`inline-flex items-center gap-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 ${sizeClasses}`}>
            PAPER
          </span>
        );
      case 'OOS_PASS':
        return (
          <span className={`inline-flex items-center gap-1 rounded bg-blue-950/80 text-blue-300 border border-blue-700/60 ${sizeClasses}`}>
            OOS PASS
          </span>
        );
      case 'BACKTEST_PASS':
        return (
          <span className={`inline-flex items-center gap-1 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 ${sizeClasses}`}>
            BACKTEST PASS
          </span>
        );
      case 'RESEARCH':
        return (
          <span className={`inline-flex items-center gap-1 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 ${sizeClasses}`}>
            RESEARCH
          </span>
        );
      case 'IDEA':
        return (
          <span className={`inline-flex items-center gap-1 rounded bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
            IDEA
          </span>
        );
      case 'DECAYING':
        return (
          <span className={`inline-flex items-center gap-1 rounded bg-rose-950/90 text-rose-300 border border-rose-700/70 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            DECAYING
          </span>
        );
      case 'RETIRED':
        return (
          <span className={`inline-flex items-center gap-1 rounded bg-zinc-900 text-zinc-500 border border-zinc-800 ${sizeClasses}`}>
            RETIRED
          </span>
        );
      default:
        return <span className={`rounded bg-slate-800 text-slate-300 ${sizeClasses}`}>{value}</span>;
    }
  }

  if (type === 'health') {
    const health = value as EdgeHealthStatus;
    switch (health) {
      case 'HEALTHY':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            HEALTHY
          </span>
        );
      case 'WATCH':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded bg-amber-950/70 text-amber-400 border border-amber-800/80 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            WATCH
          </span>
        );
      case 'DECAYING':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/80 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            DECAYING
          </span>
        );
      case 'DISABLED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
            DISABLED
          </span>
        );
    }
  }

  if (type === 'oos') {
    const oos = value as OOSVerdict;
    switch (oos) {
      case 'PASS':
        return (
          <span className={`inline-flex items-center rounded bg-emerald-950 text-emerald-400 border border-emerald-800 ${sizeClasses}`}>
            PASS
          </span>
        );
      case 'WATCH':
        return (
          <span className={`inline-flex items-center rounded bg-amber-950 text-amber-400 border border-amber-800 ${sizeClasses}`}>
            WATCH
          </span>
        );
      case 'FAIL':
        return (
          <span className={`inline-flex items-center rounded bg-rose-950 text-rose-400 border border-rose-800 ${sizeClasses}`}>
            FAIL
          </span>
        );
    }
  }

  if (type === 'market') {
    switch (value) {
      case 'NQ':
        return (
          <span className={`rounded bg-sky-950 text-sky-400 border border-sky-800/70 font-semibold ${sizeClasses}`}>
            NQ Futures
          </span>
        );
      case 'GC':
        return (
          <span className={`rounded bg-amber-950 text-amber-400 border border-amber-800/70 font-semibold ${sizeClasses}`}>
            Gold GC
          </span>
        );
      case 'CRYPTO':
        return (
          <span className={`rounded bg-purple-950 text-purple-400 border border-purple-800/70 font-semibold ${sizeClasses}`}>
            Crypto Perp
          </span>
        );
    }
  }

  return <span className={`rounded bg-slate-800 text-slate-300 ${sizeClasses}`}>{value}</span>;
};
