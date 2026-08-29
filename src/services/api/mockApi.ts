/**
 * No-Brain EV Lab — Clean API Abstraction Layer
 * 
 * Future Backend Architecture:
 * Codex can swap this mock API module with a REST/GraphQL client connected
 * to a FastAPI / Python Quantitative Engine without modifying UI components.
 */

import { ALL_STRATEGIES } from '../../data/strategies';
import { INITIAL_DATASETS, SAMPLE_CSV_PREVIEW } from '../../data/datasets';
import { Strategy, BacktestRunConfig, BacktestResult, PropFirmRule, PropSimulationResult, Dataset, CSVPreviewRow } from '../../types';
import { BacktestEngine } from '../backtest/engine';
import { PropSimulator } from '../prop/propSimulator';
import { DATA_MODE } from './dataMode';

function assertDemoMode(): void {
  if (DATA_MODE !== 'mock') {
    throw new Error('Mock API is disabled in RESEARCH mode; synthetic fallback is prohibited');
  }
}

export interface StrategyFilters {
  market?: string;
  status?: string;
  edgeHealth?: string;
  searchQuery?: string;
  sortBy?: 'score' | 'ev' | 'complexity' | 'pf' | 'maxDd';
  sortDirection?: 'asc' | 'desc';
}

export class QuantApiService {
  /**
   * Retrieve list of strategies with optional filtering & sorting
   */
  public static async getStrategies(filters?: StrategyFilters): Promise<Strategy[]> {
    assertDemoMode();
    let result = [...ALL_STRATEGIES];

    if (filters) {
      if (filters.market && filters.market !== 'ALL') {
        result = result.filter((s) => s.market === filters.market);
      }
      if (filters.status && filters.status !== 'ALL') {
        result = result.filter((s) => s.status === filters.status);
      }
      if (filters.edgeHealth && filters.edgeHealth !== 'ALL') {
        result = result.filter((s) => s.edgeHealth === filters.edgeHealth);
      }
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase().trim();
        result = result.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query) ||
            s.hypothesis.toLowerCase().includes(query)
        );
      }

      if (filters.sortBy) {
        result.sort((a, b) => {
          let valA = 0;
          let valB = 0;
          switch (filters.sortBy) {
            case 'score':
              valA = a.metrics.tournament.totalScore;
              valB = b.metrics.tournament.totalScore;
              break;
            case 'ev':
              valA = a.metrics.evPerTrade;
              valB = b.metrics.evPerTrade;
              break;
            case 'complexity':
              // Lower complexity is better, but sorting standard
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
          return filters.sortDirection === 'asc' ? valA - valB : valB - valA;
        });
      }
    }

    return result;
  }

  /**
   * Retrieve strategy by ID
   */
  public static async getStrategyById(id: string): Promise<Strategy | null> {
    assertDemoMode();
    const strategy = ALL_STRATEGIES.find((s) => s.id === id);
    return strategy || null;
  }

  /**
   * Execute Backtest simulation
   */
  public static async runBacktest(config: BacktestRunConfig): Promise<BacktestResult> {
    assertDemoMode();
    const strategy = await this.getStrategyById(config.strategyId);
    if (!strategy) {
      throw new Error(`Strategy not found with ID ${config.strategyId}`);
    }
    return BacktestEngine.runSimulation(strategy, config);
  }

  /**
   * Execute Prop Firm Monte Carlo Simulation
   */
  public static async runPropSimulation(strategyId: string, rules: PropFirmRule): Promise<PropSimulationResult> {
    assertDemoMode();
    const strategy = await this.getStrategyById(strategyId);
    if (!strategy) {
      throw new Error(`Strategy not found with ID ${strategyId}`);
    }
    return PropSimulator.runSimulation(strategy, rules);
  }

  /**
   * Get registered market datasets
   */
  public static async getDatasets(): Promise<Dataset[]> {
    assertDemoMode();
    return [...INITIAL_DATASETS];
  }

  /**
   * Parse CSV content and validate schema
   */
  public static async parseAndPreviewCSV(csvContent: string): Promise<{ rows: CSVPreviewRow[]; totalCount: number; errors: string[] }> {
    assertDemoMode();
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      return { rows: SAMPLE_CSV_PREVIEW, totalCount: SAMPLE_CSV_PREVIEW.length, errors: [] };
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredCols = ['timestamp', 'open', 'high', 'low', 'close', 'volume'];
    const missing = requiredCols.filter((col) => !header.includes(col));

    const errors: string[] = [];
    if (missing.length > 0) {
      errors.push(`Missing expected columns: ${missing.join(', ')}. Defaulted to Standard Schema preview.`);
      return { rows: SAMPLE_CSV_PREVIEW, totalCount: SAMPLE_CSV_PREVIEW.length, errors };
    }

    const rows: CSVPreviewRow[] = [];
    const timestampIdx = header.indexOf('timestamp');
    const openIdx = header.indexOf('open');
    const highIdx = header.indexOf('high');
    const lowIdx = header.indexOf('low');
    const closeIdx = header.indexOf('close');
    const volumeIdx = header.indexOf('volume');
    const symbolIdx = header.indexOf('symbol');
    const marketIdx = header.indexOf('market');
    const tzIdx = header.indexOf('timezone');

    for (let i = 1; i < Math.min(lines.length, 50); i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length < 6) continue;

      rows.push({
        timestamp: parts[timestampIdx] || new Date().toISOString(),
        open: parseFloat(parts[openIdx]) || 0,
        high: parseFloat(parts[highIdx]) || 0,
        low: parseFloat(parts[lowIdx]) || 0,
        close: parseFloat(parts[closeIdx]) || 0,
        volume: parseFloat(parts[volumeIdx]) || 0,
        symbol: symbolIdx >= 0 ? parts[symbolIdx] : 'NQ',
        market: marketIdx >= 0 ? parts[marketIdx] : 'Futures',
        timezone: tzIdx >= 0 ? parts[tzIdx] : 'UTC',
      });
    }

    return {
      rows: rows.length > 0 ? rows : SAMPLE_CSV_PREVIEW,
      totalCount: lines.length - 1,
      errors,
    };
  }
}
