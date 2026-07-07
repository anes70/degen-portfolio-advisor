import { Network } from './token';

export interface Wallet {
  address: string;
  network: Network;
  isValid: boolean;
}

export interface PortfolioSummary {
  totalValueUSD: number;
  totalProfitLossUSD: number;
  totalProfitLossPercentage: number;
}
