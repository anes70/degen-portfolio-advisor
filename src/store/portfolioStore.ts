import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Token, Network } from '../types/token';
import { getMockWalletAssets } from '../mocks/wallets';

interface PortfolioState {
  wallets: Record<Network, string>;
  tokens: Token[];
  isLoading: boolean;
  error: string | null;
  
  setWalletAddress: (network: Network, address: string) => void;
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

      setWalletAddress: (network, address) => {
        set((state) => ({
          wallets: { ...state.wallets, [network]: address }
        }));
        get().refreshPortfolio();
      },

      updateEntryPrice: (tokenId, price) => {
        set((state) => ({
          tokens: state.tokens.map((token) =>
            token.id === tokenId ? { ...token, entryPrice: Math.max(0, price) } : token
          ),
        }));
      },

      refreshPortfolio: async () => {
        const { wallets, tokens: currentTokens } = get();
        if (!wallets.solana && !wallets.base) {
          set({ tokens: [], error: null });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          let baseTokens = [];
          if (wallets.solana) baseTokens = [...baseTokens, ...getMockWalletAssets(wallets.solana, 'solana')];
          if (wallets.base) baseTokens = [...baseTokens, ...getMockWalletAssets(wallets.base, 'base')];

          if (baseTokens.length === 0) {
            set({ tokens: [], isLoading: false });
            return;
          }

          // Extraction des adresses de contract pour interroger DexScreener
          const mints = baseTokens.map(t => t.mintAddress).join(',');
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mints}`);
          const data = await response.json();

          const updatedTokens = baseTokens.map((token) => {
            // Trouver les vraies données live correspondantes sur DexScreener
            const pair = data.pairs?.find((p: any) => p.baseToken.address.toLowerCase() === token.mintAddress.toLowerCase());
            const existingToken = currentTokens.find((t) => t.id === token.id);
            const entryPrice = existingToken ? existingToken.entryPrice : token.entryPrice;

            if (pair) {
              return {
                ...token,
                entryPrice,
                marketData: {
                  currentPrice: parseFloat(pair.priceUsd) || token.marketData.currentPrice,
                  volume24h: pair.volume?.h24 || token.marketData.volume24h,
                  volumeChange1h: pair.priceChange?.h1 || 0,
                  liquidity: pair.liquidity?.usd || token.marketData.liquidity,
                  ath: Math.max(parseFloat(pair.priceUsd) || 0, token.marketData.ath),
                  holderCount: token.marketData.holderCount,
                  top10HolderShare: token.marketData.top10HolderShare,
                  ageInDays: token.marketData.ageInDays,
                  txCount24h: pair.txns?.h24?.buys + pair.txns?.h24?.sells || token.marketData.txCount24h,
                  githubCommits30d: token.marketData.githubCommits30d,
                  socialSentimentScore: token.marketData.socialSentimentScore,
                  rugPullRiskScore: token.marketData.rugPullRiskScore
                }
              };
            }
            return { ...token, entryPrice };
          });

          set({ tokens: updatedTokens, isLoading: false });
        } catch (err: any) {
          set({ error: 'Impossible de synchroniser les prix live', isLoading: false });
        }
      },

      clearPortfolio: () => {
        set({ wallets: { solana: '', base: '' }, tokens: [], error: null });
      },
    }),
    {
      name: 'degen-portfolio-storage',
      partialize: (state) => ({
        wallets: state.wallets,
        tokens: state.tokens.map(t => ({ id: t.id, entryPrice: t.entryPrice }))
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        wallets: persistedState?.wallets || currentState.wallets,
        tokens: []
      })
    }
  )
);
