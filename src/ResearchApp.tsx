import React, { useEffect, useState } from 'react';
import { AlertTriangle, Database, FlaskConical, ShieldCheck } from 'lucide-react';
import type { StrategyDefinition } from './types/research';
import { ResearchApiService } from './services/api/researchApi';

export function ResearchApp() {
  const [strategies, setStrategies] = useState<StrategyDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ResearchApiService.getStrategies().then(setStrategies).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Research API unavailable');
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="text-xs tracking-[0.24em] text-emerald-400 font-bold">REAL BACKTEST / RESEARCH MODE</div>
            <h1 className="text-2xl font-bold mt-2">No-Brain EV Lab</h1>
            <p className="text-sm text-slate-400 mt-1">Definitions are separate from runs and results. Synthetic fallback is disabled.</p>
          </div>
          <div className="px-3 py-2 rounded border border-emerald-700 bg-emerald-950/30 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> RESEARCH
          </div>
        </header>

        {error && (
          <section className="border border-amber-700 bg-amber-950/20 rounded-lg p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div><div className="font-bold text-amber-300">NO REAL BACKTEST DATA</div><p className="text-sm text-slate-400 mt-1">{error}. Start the FastAPI backend; the UI will not substitute demo results.</p></div>
          </section>
        )}

        <section className="grid md:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <article key={strategy.id} className="rounded-lg border border-slate-800 bg-[#0a0f18] p-5 space-y-4">
              <div className="flex justify-between gap-3"><div><div className="text-xs text-blue-400">{strategy.id} v{strategy.version}</div><h2 className="font-bold mt-1">{strategy.name}</h2></div><span className="text-[10px] h-fit px-2 py-1 border border-slate-700 rounded">{strategy.market}</span></div>
              <p className="text-xs leading-5 text-slate-400">{strategy.hypothesis}</p>
              <div className="grid grid-cols-2 gap-2 text-xs"><div className="bg-slate-900 p-2 rounded"><span className="text-slate-500">STATUS</span><div className="text-slate-200 mt-1">{strategy.status}</div></div><div className="bg-slate-900 p-2 rounded"><span className="text-slate-500">EDGE HEALTH</span><div className="text-slate-200 mt-1">{strategy.edge_health}</div></div></div>
              <div className="border-t border-slate-800 pt-3 text-xs text-slate-500"><strong className="text-slate-300">NO REAL BACKTEST DATA</strong><br />Upload a validated dataset and create a run to calculate metrics.</div>
            </article>
          ))}
        </section>

        <section className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="border border-slate-800 rounded p-4 flex gap-3"><Database className="w-5 h-5 text-blue-400" /><div><strong>Data provenance</strong><p className="text-xs text-slate-500 mt-1">Dataset ID, SHA-256 fingerprint, timezone and contract metadata.</p></div></div>
          <div className="border border-slate-800 rounded p-4 flex gap-3"><FlaskConical className="w-5 h-5 text-violet-400" /><div><strong>Run provenance</strong><p className="text-xs text-slate-500 mt-1">Strategy/engine version, parameters, costs, Git commit and split periods.</p></div></div>
          <div className="border border-slate-800 rounded p-4 flex gap-3"><ShieldCheck className="w-5 h-5 text-emerald-400" /><div><strong>Forward locked</strong><p className="text-xs text-slate-500 mt-1">2026 data defaults to an explicitly marked forward segment.</p></div></div>
        </section>
      </div>
    </div>
  );
}

