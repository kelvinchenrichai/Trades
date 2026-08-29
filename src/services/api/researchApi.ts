import type { BacktestResult, StrategyDefinition } from '../../types/research';
import { API_BASE_URL } from './dataMode';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(payload.detail || `Research API error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export class ResearchApiService {
  static getStrategies(): Promise<StrategyDefinition[]> {
    return request('/strategies');
  }

  static getBacktest(runId: string): Promise<BacktestResult> {
    return request(`/backtests/${encodeURIComponent(runId)}`);
  }

  static runBacktest(payload: unknown): Promise<BacktestResult> {
    return request('/backtests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  static async uploadDataset(form: FormData): Promise<unknown> {
    return request('/datasets/upload', { method: 'POST', body: form });
  }
}

