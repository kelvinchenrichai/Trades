/**
 * No-Brain EV Lab — Institutional Disclaimer Banner
 * Enforces clear "DEMO / MOCK DATA" distinction across all views.
 */

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span><strong className="font-semibold">DEMO / MOCK DATA:</strong> All curves, metrics & test results are synthetic simulations for workflow evaluation only.</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-md border border-amber-500/30 bg-amber-950/20 text-amber-200/90 text-xs leading-relaxed">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wide text-amber-300 font-mono">DEMO / MOCK SIMULATION ENVIRONMENT</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40">RESEARCH PROTOTYPE</span>
        </div>
        <p className="text-slate-400">
          This MVP demonstrates quantitative research workflows, unified Strategy Schemas, parameter stability heuristics, and Edge Health tracking. 
          Performance data is purely synthetic. Do not use for live trading capital allocation.
        </p>
      </div>
    </div>
  );
};
