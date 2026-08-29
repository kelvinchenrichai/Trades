/**
 * No-Brain EV Lab — Platform Settings & Codex Backend Integration
 */

import React, { useState } from 'react';
import { SupportedTimezone } from '../services/calendar/sessionCalendar';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Sliders,
  Globe,
  Database,
  Shield,
  Cpu,
  Save,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface SettingsPageProps {
  timezone: SupportedTimezone;
  onTimezoneChange: (tz: SupportedTimezone) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  timezone,
  onTimezoneChange,
}) => {
  const [backendUrl, setBackendUrl] = useState<string>('http://localhost:8000/api/v1');
  const [useMockApi, setUseMockApi] = useState<boolean>(true);
  const [defaultSlippage, setDefaultSlippage] = useState<number>(1);
  const [defaultCommission, setDefaultCommission] = useState<number>(4.0);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      <DisclaimerBanner compact />

      {/* Header */}
      <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-2">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          System Settings &amp; Architecture Configuration
        </h2>
        <p className="text-xs text-slate-400">
          Configure default risk parameters, timezone normalization, and future Codex backend connection endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Timezone & Default Friction */}
        <div className="space-y-6">
          {/* Timezone Preference */}
          <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Timezone Normalization
            </h3>
            <p className="text-xs text-slate-400">
              All market session times and backtest outputs are normalized to this timezone.
            </p>
            <div className="space-y-2">
              {[
                { id: 'America/New_York', label: 'America / New York (ET - CME & COMEX RTH)' },
                { id: 'UTC', label: 'UTC (Universal Coordinated Time - Crypto Standard)' },
                { id: 'Asia/Taipei', label: 'Asia / Taipei (TPE)' },
                { id: 'EXCHANGE', label: 'Exchange Local Time (Asset Native)' },
              ].map((tz) => (
                <label
                  key={tz.id}
                  className={`flex items-center gap-3 p-2.5 rounded border text-xs cursor-pointer transition-all ${
                    timezone === tz.id
                      ? 'bg-blue-950/60 border-blue-500 text-blue-200 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="timezone"
                    value={tz.id}
                    checked={timezone === tz.id}
                    onChange={(e) => onTimezoneChange(e.target.value as SupportedTimezone)}
                    className="accent-blue-500"
                  />
                  <span>{tz.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Default Execution Friction */}
          <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Default Execution Friction Assumptions
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">DEFAULT SLIPPAGE (TICKS)</label>
                <input
                  type="number"
                  value={defaultSlippage}
                  onChange={(e) => setDefaultSlippage(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">COMMISSION ($/RT)</label>
                <input
                  type="number"
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Codex API Backend Switcher */}
        <div className="space-y-6">
          <div className="bg-[#0a0f18] p-5 rounded-lg border border-slate-800 space-y-4">
            <div className="border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Codex Python / Rust Backend Hook
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                The frontend uses an abstraction layer (`src/services/api/mockApi.ts`). When Codex deploys the real Python/FastAPI backtester, point it here.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">Execution Service Driver</div>
                  <div className="text-[10px] text-slate-500">
                    {useMockApi ? 'In-Browser Statistical Simulation Engine' : 'External Python FastAPI Backtest Engine'}
                  </div>
                </div>
                <button
                  onClick={() => setUseMockApi(!useMockApi)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    useMockApi
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  {useMockApi ? 'MOCK ENGINE' : 'LIVE API'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">BACKEND API BASE URL</label>
                <input
                  type="text"
                  value={backendUrl}
                  disabled={useMockApi}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 disabled:opacity-50 text-slate-200 rounded p-2 font-mono text-xs"
                />
              </div>

              <div className="p-3 rounded bg-blue-950/20 border border-blue-800/40 text-slate-300 text-xs leading-relaxed space-y-1">
                <div className="text-blue-300 font-bold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  Codex Handoff Standard:
                </div>
                <p className="text-[11px] text-slate-400">
                  The API interface `QuantApiService` in `src/services/api/mockApi.ts` implements standard JSON schemas matching `src/types/index.ts`. Swapping to real backtesting requires 0 changes in UI components.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                className="w-full py-2.5 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Platform Preferences
              </button>

              {savedSuccess && (
                <div className="mt-2 p-2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-center text-xs flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Settings saved successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
