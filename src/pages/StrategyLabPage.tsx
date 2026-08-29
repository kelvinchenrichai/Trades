/**
 * No-Brain EV Lab — Strategy Lab Page
 */

import React, { useState, useMemo } from 'react';
import { Strategy, StrategyStage, EdgeHealthStatus, Market } from '../types';
import { StrategyCard } from '../components/StrategyCard';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { Search, Filter, ArrowUpDown, ChevronRight, Layers, Sparkles } from 'lucide-react';

interface StrategyLabPageProps {
  strategies: Strategy[];
  onSelectStrategy: (strategyId: string) => void;
  onBacktestStrategy: (strategyId: string) => void;
}

export const StrategyLabPage: React.FC<StrategyLabPageProps> = ({
  strategies,
  onSelectStrategy,
  onBacktestStrategy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedHealth, setSelectedHealth] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'ev' | 'complexity' | 'pf' | 'maxDd'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Stages for the visual pipeline banner
  const pipelineStages: Array<{ stage: StrategyStage; label: string }> = [
    { stage: 'IDEA', label: 'Idea' },
    { stage: 'RESEARCH', label: 'Research' },
    { stage: 'BACKTEST_PASS', label: 'Backtest Pass' },
    { stage: 'OOS_PASS', label: 'OOS Pass' },
    { stage: 'PAPER', label: 'Paper' },
    { stage: 'LIVE', label: 'Live' },
    { stage: 'DECAYING', label: 'Decaying' },
    { stage: 'RETIRED', label: 'Retired' },
  ];

  const filteredStrategies = useMemo(() => {
    return strategies
      .filter((s) => {
        if (selectedMarket !== 'ALL' && s.market !== selectedMarket) return false;
        if (selectedStage !== 'ALL' && s.status !== selectedStage) return false;
        if (selectedHealth !== 'ALL' && s.edgeHealth !== selectedHealth) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          return (
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.hypothesis.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        switch (sortBy) {
          case 'score':
            valA = a.metrics.tournament.totalScore;
            valB = b.metrics.tournament.totalScore;
            break;
          case 'ev':
            valA = a.metrics.evPerTrade;
            valB = b.metrics.evPerTrade;
            break;
          case 'complexity':
            valA = a.complexityScore;
            valB = b.complexityScore;
            break;
          case 'pf':
            valA = a.metrics.profitFactor;
            valB = b.metrics.profitFactor;
            break;
          case 'maxDd':
            valA = a.metrics.maxDrawdownR;
            valB = b.metrics.maxDrawdownR;
            break;
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [strategies, selectedMarket, selectedStage, selectedHealth, searchQuery, sortBy, sortDirection]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      <DisclaimerBanner compact />

      {/* Stage Progression Pipeline Header */}
      <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Strategy Lifecycle Progression Gate
          </div>
          <span className="text-[10px] text-slate-500">
            Strict OOS Gate prevents forward progression without statistical edge proof
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {pipelineStages.map((item, index) => {
            const count = strategies.filter((s) => s.status === item.stage).length;
            const isSelected = selectedStage === item.stage;
            const isDecayingOrRetired = item.stage === 'DECAYING' || item.stage === 'RETIRED';

            return (
              <button
                key={item.stage}
                onClick={() => setSelectedStage(isSelected ? 'ALL' : item.stage)}
                className={`p-2 rounded border text-left transition-all relative ${
                  isSelected
                    ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-sm'
                    : isDecayingOrRetired
                    ? 'bg-rose-950/20 border-slate-800/80 hover:border-slate-700 text-slate-400'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>0{index + 1}</span>
                  <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-bold font-mono-num">
                    {count}
                  </span>
                </div>
                <div className="font-bold text-xs truncate">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="bg-[#0a0f18] p-4 rounded-lg border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search strategies by name, ID, or hypothesis..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded pl-9 pr-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Market Filter */}
          <div>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">Market: All Markets</option>
              <option value="NQ">NQ Futures</option>
              <option value="GC">Gold GC</option>
              <option value="CRYPTO">Crypto Perp</option>
            </select>
          </div>

          {/* Edge Health Filter */}
          <div>
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">Health: All States</option>
              <option value="HEALTHY">HEALTHY</option>
              <option value="WATCH">WATCH</option>
              <option value="DECAYING">DECAYING</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="score">Sort: Tournament Score</option>
              <option value="ev">Sort: EV / Trade</option>
              <option value="complexity">Sort: Complexity</option>
              <option value="pf">Sort: Profit Factor</option>
              <option value="maxDd">Sort: Max Drawdown</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter State Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200 font-mono-num">{filteredStrategies.length}</strong> of{' '}
            <strong className="text-slate-200 font-mono-num">{strategies.length}</strong> strategies
          </span>

          {(selectedMarket !== 'ALL' || selectedStage !== 'ALL' || selectedHealth !== 'ALL' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedMarket('ALL');
                setSelectedStage('ALL');
                setSelectedHealth('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-blue-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStrategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            onSelect={onSelectStrategy}
            onBacktest={onBacktestStrategy}
          />
        ))}
      </div>

      {filteredStrategies.length === 0 && (
        <div className="p-12 text-center bg-[#0a0f18] rounded-lg border border-dashed border-slate-800 space-y-2">
          <div className="text-slate-400 font-bold">No strategies match your filter criteria</div>
          <p className="text-xs text-slate-500">Try adjusting your market, health, or stage filters.</p>
        </div>
      )}
    </div>
  );
};
