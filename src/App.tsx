/**
 * No-Brain EV Lab — Main Application Entry & Router
 */

import React, { useState, useEffect } from 'react';
import { Strategy } from './types';
import { QuantApiService } from './services/api/mockApi';
import { SupportedTimezone } from './services/calendar/sessionCalendar';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { StrategyLabPage } from './pages/StrategyLabPage';
import { StrategyDetailPage } from './pages/StrategyDetailPage';
import { BacktestsPage } from './pages/BacktestsPage';
import { TournamentPage } from './pages/TournamentPage';
import { EdgeHealthPage } from './pages/EdgeHealthPage';
import { PropSimulatorPage } from './pages/PropSimulatorPage';
import { DataPage } from './pages/DataPage';
import { SettingsPage } from './pages/SettingsPage';
import { DATA_MODE } from './services/api/dataMode';
import { ResearchApp } from './ResearchApp';

function DemoApp() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('NQ-FTM-001');
  const [timezone, setTimezone] = useState<SupportedTimezone>('America/New_York');

  // Load strategies from API service
  useEffect(() => {
    async function loadData() {
      try {
        const data = await QuantApiService.getStrategies();
        setStrategies(data);
        if (data.length > 0) {
          setSelectedStrategyId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load strategies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectStrategy = (id: string) => {
    setSelectedStrategyId(id);
    setCurrentPage('strategy-detail');
  };

  const handleBacktestStrategy = (id: string) => {
    setSelectedStrategyId(id);
    setCurrentPage('backtests');
  };

  const currentStrategy =
    strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  // Helper for page title
  const getPageInfo = (): { title: string; subtitle: string } => {
    switch (currentPage) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Institutional Strategy Performance, OOS Verification & Health Overview',
        };
      case 'strategy-lab':
        return {
          title: 'Strategy Lab',
          subtitle: 'Lifecycle Progression Gate, Idea Screening & Complexity Filtering',
        };
      case 'strategy-detail':
        return {
          title: currentStrategy ? `${currentStrategy.name} (${currentStrategy.id})` : 'Strategy Detail',
          subtitle: 'Hypothesis, Objective Entry/Exit Rules, Risk Metrics & Multi-Year Walk-Forward',
        };
      case 'backtests':
        return {
          title: 'Backtests & Stability Suite',
          subtitle: 'Interactive Walk-Forward Simulator & Parameter Stability Plateau (Plateau > Peak)',
        };
      case 'tournament':
        return {
          title: 'Strategy Tournament',
          subtitle: '100-Point Composite Robustness Scoring & Head-to-Head Multi-Factor Comparison',
        };
      case 'edge-health':
        return {
          title: 'Edge Health Monitor',
          subtitle: 'Rolling Window Edge Decay Monitoring (20, 50, 100 Trades) & Elimination Protocol',
        };
      case 'prop-simulator':
        return {
          title: 'Prop Firm Evaluation Simulator',
          subtitle: 'Universal Monte Carlo Path Simulation & Trailing Drawdown Survival Analysis',
        };
      case 'data':
        return {
          title: 'Data & Session Registry',
          subtitle: 'Continuous Futures, Back-Adjusted Datasets & Session Calendar Engine',
        };
      case 'settings':
        return {
          title: 'Settings & Codex Hook',
          subtitle: 'Platform Risk Defaults, Timezone Preferences & Future Python Backend API Bridge',
        };
      default:
        return { title: 'EV Lab', subtitle: '' };
    }
  };

  const pageInfo = getPageInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center font-mono text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm font-bold tracking-wider uppercase text-blue-400">
            Initializing No-Brain EV Lab...
          </div>
          <div className="text-xs text-slate-500">Loading Quantitative Engine &amp; Strategy Schemas</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-row selection:bg-blue-600 selection:text-white">
      {/* Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        timezone={timezone}
        activeStrategyCount={strategies.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          timezone={timezone}
          onTimezoneChange={setTimezone}
          strategies={strategies}
          selectedStrategyId={selectedStrategyId}
          onSelectStrategy={setSelectedStrategyId}
          showStrategySelector={currentPage === 'strategy-detail' || currentPage === 'backtests'}
        />

        {/* Page Content */}
        <main className="flex-1 pb-16">
          {currentPage === 'dashboard' && (
            <DashboardPage
              strategies={strategies}
              onSelectStrategy={handleSelectStrategy}
              onNavigateToLab={() => setCurrentPage('strategy-lab')}
              onNavigateToTournament={() => setCurrentPage('tournament')}
              onNavigateToEdgeHealth={() => setCurrentPage('edge-health')}
            />
          )}

          {currentPage === 'strategy-lab' && (
            <StrategyLabPage
              strategies={strategies}
              onSelectStrategy={handleSelectStrategy}
              onBacktestStrategy={handleBacktestStrategy}
            />
          )}

          {currentPage === 'strategy-detail' && currentStrategy && (
            <StrategyDetailPage
              strategy={currentStrategy}
              allStrategies={strategies}
              onSelectStrategy={handleSelectStrategy}
              onNavigateToBacktest={handleBacktestStrategy}
            />
          )}

          {currentPage === 'backtests' && (
            <BacktestsPage
              strategies={strategies}
              initialStrategyId={selectedStrategyId}
              onSelectStrategy={handleSelectStrategy}
            />
          )}

          {currentPage === 'tournament' && (
            <TournamentPage
              strategies={strategies}
              onSelectStrategy={handleSelectStrategy}
            />
          )}

          {currentPage === 'edge-health' && (
            <EdgeHealthPage
              strategies={strategies}
              onSelectStrategy={handleSelectStrategy}
            />
          )}

          {currentPage === 'prop-simulator' && (
            <PropSimulatorPage
              strategies={strategies}
              onSelectStrategy={handleSelectStrategy}
            />
          )}

          {currentPage === 'data' && <DataPage />}

          {currentPage === 'settings' && (
            <SettingsPage
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return DATA_MODE === 'research' ? <ResearchApp /> : <DemoApp />;
}

export default App;
