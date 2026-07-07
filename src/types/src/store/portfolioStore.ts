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
      wallets: {
        solana: '',
        base: '',
      },
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
          await new Promise((resolve) => setTimeout(resolve, 1200));

          let fetchedTokens: Token[] = [];

          if (wallets.solana) {
            const solAssets = getMockWalletAssets(wallets.solana, 'solana');
            fetchedTokens = [...fetchedTokens, ...solAssets];
          }
          if (wallets.base) {
            const baseAssets = getMockWalletAssets(wallets.base, 'base');
            fetchedTokens = [...fetchedTokens, ...baseAssets];
          }

          const finalTokens = fetchedTokens.map((newToken) => {
            const existingToken = currentTokens.find((t) => t.id === newToken.id);
            return existingToken
              ? { ...newToken, entryPrice: existingToken.entryPrice }
              : newToken;
          });

          set({ tokens: finalTokens, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || 'Erreur de chargement', isLoading: false });
        }
      },

      clearPortfolio: () => {
        set({
          wallets: { solana: '', base: '' },
          tokens: [],
          error: null,
        });
      },
    }),
    {
      name: 'degen-portfolio-storage',
      partialize: (state) => ({
        wallets: state.wallets,
        tokens: state.tokens.map(t => ({ id: t.id, entryPrice: t.entryPrice }))
      }),
      merge: (persistedState: any, currentState) => {
        const wallets = persistedState?.wallets || currentState.wallets;
        return {
          ...currentState,
          wallets,
          tokens: [] 
        };
      }
    }
  )
);
