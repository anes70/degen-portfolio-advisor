import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Token, Network } from '../types/token';

interface PortfolioState {
  wallets: Record<Network, string>;
  tokens: Token[];
  isLoading: boolean;
  error: string | null;
  
  addCustomToken: (network: Network, mintAddress: string, symbol: string, balance: number, entryPrice: number) => void;
  removeToken: (tokenId: string) => void;
  updateEntryPrice: (tokenId: string, price: number) => void;
  refreshPortfolio: () => Promise<void>;
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      wallets: { solana: '', base: '' },
      tokens: [],
      isLoading: false,
      error: null,

      addCustomToken: (network, mintAddress, symbol, balance, entryPrice) => {
        const id = `${network}-${mintAddress.toLowerCase().trim()}`;
        const alreadyExists = get().tokens.some(t => t.id === id);
        if (alreadyExists) return;

        const newToken: Token = {
          id,
          name: symbol,
          symbol: symbol.toUpperCase() || 'TOKEN',
          mintAddress: mintAddress.trim(),
          network,
          balance,
          entryPrice: entryPrice || 0,
          marketData: {
            currentPrice: entryPrice || 0.001,
            volume24h: 0,
            volumeChange1h: 0,
            liquidity: 0,
            ath: entryPrice || 0.001,
            holderCount: 5000,
            top10HolderShare: 20,
            ageInDays: 30,
            txCount24h: 1000,
            githubCommits30d: 5,
            socialSentimentScore: 75,
            rugPullRiskScore: 10
          }
        };

        set((state) => ({
          tokens: [...state.tokens, newToken],
          wallets: { ...state.wallets, [network]: 'active' }
        }));
        
        get().refreshPortfolio();
      },

      removeToken: (tokenId) => {
        set((state) => {
          const updatedTokens = state.tokens.filter(t => t.id !== tokenId);
          const hasSol = updatedTokens.some(t => t.network === 'solana');
          const hasBase = updatedTokens.some(t => t.network === 'base');
          return {
            tokens: updatedTokens,
            wallets: {
              solana: hasSol ? 'active' : '',
              base: hasBase ? 'active' : ''
            }
          };
        });
      },

      updateEntryPrice: (tokenId, price) => {
        set((state) => ({
          tokens: state.tokens.map((token) =>
            token.id === tokenId ? { ...token, entryPrice: Math.max(0, price) } : token
          ),
        }));
      },

      refreshPortfolio: async () => {
        const { tokens } = get();
        if (tokens.length === 0) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const mints = tokens.map(t => t.mintAddress).join(',');
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mints}`);
          const data = await response.json();

          const updatedTokens = tokens.map((token) => {
            const pair = data.pairs?.find((p: any) => p.baseToken.address.toLowerCase() === token.mintAddress.toLowerCase());
            
            if (pair) {
              return {
                ...token,
                name: pair.baseToken.name || token.name,
                symbol: pair.baseToken.symbol || token.symbol,
                marketData: {
                  currentPrice: parseFloat(pair.priceUsd) || token.marketData.currentPrice,
                  volume24h: pair.volume?.h24 || token.marketData.volume24h,
                  volumeChange1h: pair.priceChange?.h1 || 0,
                  liquidity: pair.liquidity?.usd || token.marketData.liquidity,
                  ath: Math.max(parseFloat(pair.priceUsd) || token.marketData.ath, token.marketData.ath),
                  holderCount: token.marketData.holderCount,
                  top10HolderShare: token.marketData.top10HolderShare,
                  ageInDays: token.marketData.ageInDays,
                  txCount24h: (pair.txns?.h24?.buys + pair.txns?.h24?.sells) || token.marketData.txCount24h,
                  githubCommits30d: token.marketData.githubCommits30d,
                  socialSentimentScore: token.marketData.socialSentimentScore,
                  rugPullRiskScore: token.marketData.rugPullRiskScore
                }
              };
            }
            return token;
          });

          set({ tokens: updatedTokens, isLoading: false });
        } catch (err) {
          set({ error: 'Erreur de synchronisation DexScreener', isLoading: false });
        }
      },

      clearPortfolio: () => set({ wallets: { solana: '', base: '' }, tokens: [], error: null }),
    }),
    {
      name: 'degen-portfolio-storage',
    }
  )
);
