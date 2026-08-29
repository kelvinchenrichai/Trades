/**
 * No-Brain EV Lab — Session Calendar & Timezone Service
 * Unified handling for UTC, New York (ET), Asia/Taipei, and Exchange clocks with DST awareness.
 */

export type SupportedTimezone = 'UTC' | 'America/New_York' | 'Asia/Taipei' | 'EXCHANGE';

export interface MarketSession {
  name: string;
  market: 'NQ' | 'GC' | 'CRYPTO';
  openET: string;
  closeET: string;
  timezone: string;
  is24h: boolean;
}

export const MARKET_SESSIONS: Record<string, MarketSession> = {
  NQ_REGULAR: {
    name: 'NQ US Equities Regular Trading Hours (RTH)',
    market: 'NQ',
    openET: '09:30',
    closeET: '16:00',
    timezone: 'America/New_York',
    is24h: false,
  },
  NQ_GLOBEX: {
    name: 'NQ CME Globex Extended Hours (ETH)',
    market: 'NQ',
    openET: '18:00',
    closeET: '17:00',
    timezone: 'America/New_York',
    is24h: true,
  },
  GC_PIT: {
    name: 'Gold COMEX Pit & Electronic Session',
    market: 'GC',
    openET: '08:20',
    closeET: '13:30',
    timezone: 'America/New_York',
    is24h: false,
  },
  LONDON_FIX: {
    name: 'London Bullion & European Equities Session',
    market: 'GC',
    openET: '03:00',
    closeET: '11:30',
    timezone: 'Europe/London',
    is24h: false,
  },
  CRYPTO_PERPETUAL: {
    name: 'Crypto Continuous 24/7 Global Trading',
    market: 'CRYPTO',
    openET: '00:00',
    closeET: '23:59',
    timezone: 'UTC',
    is24h: true,
  },
};

/**
 * Format timestamp into selected display timezone
 */
export function formatTimeInTimezone(
  date: Date | string | number, 
  timezone: SupportedTimezone = 'America/New_York',
  includeSeconds: boolean = false
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--';

  const tz = timezone === 'EXCHANGE' ? 'America/New_York' : timezone;

  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: false,
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

/**
 * Calculates whether US Daylight Saving Time (DST) is active for a given date
 */
export function isUSDaylightSavingTime(date: Date = new Date()): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== date.getTimezoneOffset();
}
