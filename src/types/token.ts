export type Network = 'solana' | 'base';

export interface TokenMarketData {
  currentPrice: number;
  volume24h: number;
  volumeChange1h: number; 
  liquidity: number;
  ath: number;
  holderCount: number;
  top10HolderShare: number; 
  ageInDays: number;
  txCount24h: number;
  githubCommits30d: number;
  socialSentimentScore: number; 
  rugPullRiskScore: number; 
}

export interface Token {
  id: string; 
  name: string;
  symbol: string;
  mintAddress: string;
  network: Network;
  balance: number;
  decimals: number;
  entryPrice: number; 
  marketData: TokenMarketData;
}
