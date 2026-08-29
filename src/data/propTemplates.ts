/**
 * No-Brain EV Lab — Prop Firm Rule Templates
 */

import { PropFirmRule } from '../types';

export interface PropTemplate {
  id: string;
  name: string;
  description: string;
  rules: PropFirmRule;
}

export const PROP_TEMPLATES: PropTemplate[] = [
  {
    id: 'PROP-100K-STD',
    name: '100K Standard Evaluation',
    description: 'Standard 2-step evaluation rule model with static drawdown limit.',
    rules: {
      accountSize: 100000,
      profitTarget: 6000,
      dailyLossLimit: 2000,
      maxDrawdown: 3000,
      drawdownType: 'STATIC',
      minTradingDays: 5,
      maxContracts: 10,
      consistencyRule: false,
      riskPerTrade: 500,
    },
  },
  {
    id: 'PROP-50K-EOD',
    name: '50K EOD Trailing Account',
    description: 'End-of-Day trailing drawdown account popular among futures evaluation firms.',
    rules: {
      accountSize: 50000,
      profitTarget: 3000,
      dailyLossLimit: 1000,
      maxDrawdown: 2000,
      drawdownType: 'EOD_TRAILING',
      minTradingDays: 5,
      maxContracts: 4,
      consistencyRule: true,
      riskPerTrade: 300,
    },
  },
  {
    id: 'PROP-150K-TRAILING',
    name: '150K Intraday Trailing',
    description: 'High-leverage intraday peak-trailing model with strict consistency rules.',
    rules: {
      accountSize: 150000,
      profitTarget: 9000,
      dailyLossLimit: 3000,
      maxDrawdown: 4500,
      drawdownType: 'TRAILING',
      minTradingDays: 7,
      maxContracts: 15,
      consistencyRule: true,
      riskPerTrade: 750,
    },
  },
];
