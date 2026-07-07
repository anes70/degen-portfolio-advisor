import { Token, Network } from '../types/token';

export function getMockWalletAssets(address: string, network: Network): Token[] {
  if (network === 'solana') {
    return [
      {
        id: 'solana-ansem1111111111111111111111111111111112',
        name: 'Ansem Token',
        symbol: 'ANSEM',
        mintAddress: 'ansem1111111111111111111111111111111112',
        network: 'solana',
        balance: 4500,
        decimals: 9,
        entryPrice: 0.12,
        marketData: {
          currentPrice: 0.095,
          volume24h: 6200000,
          volumeChange1h: 4.2,
          liquidity: 850000,
          ath: 0.145,
          holderCount: 12400,
          top10HolderShare: 24,
          ageInDays: 45,
          txCount24h: 3100,
          githubCommits30d: 12,
          socialSentimentScore: 78,
          rugPullRiskScore: 10
        }
      },
      {
        id: 'solana-bome333333333333333333333333333333333333',
        name: 'Degen Parabolic Speculation',
        symbol: 'PARABOL',
        mintAddress: 'bome333333333333333333333333333333333333',
        network: 'solana',
        balance: 125000,
        decimals: 6,
        entryPrice: 0.001,
        marketData: {
          currentPrice: 0.0065,
          volume24h: 18400000,
          volumeChange1h: 32.5,
          liquidity: 2100000,
          ath: 0.007,
          holderCount: 42100,
          top10HolderShare: 18,
          ageInDays: 6,
          txCount24h: 14500,
          githubCommits30d: 0,
          socialSentimentScore: 92,
          rugPullRiskScore: 35
        }
      }
    ];
  } else {
    return [
      {
        id: 'base-0x4200000000000000000000000000000000000022',
        name: 'Base Alpha Liquidity',
        symbol: 'BALPHA',
        mintAddress: '0x4200000000000000000000000000000000000022',
        network: 'base',
        balance: 1.5,
        decimals: 18,
        entryPrice: 450,
        marketData: {
          currentPrice: 510,
          volume24h: 150000,
          volumeChange1h: -45.2,
          liquidity: 1800000,
          ath: 520,
          holderCount: 1100,
          top10HolderShare: 72,
          ageInDays: 14,
          txCount24h: 180,
          githubCommits30d: 4,
          socialSentimentScore: 40,
          rugPullRiskScore: 65
        }
      }
    ];
  }
}
