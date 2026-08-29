import type { ResearchMode } from '../../types/research';

export const DATA_MODE: ResearchMode =
  String((import.meta as any).env?.VITE_DATA_MODE || 'mock').toLowerCase() === 'research'
    ? 'research'
    : 'mock';

export const API_BASE_URL = String(
  (import.meta as any).env?.VITE_RESEARCH_API_URL || 'http://localhost:8000'
).replace(/\/$/, '');

