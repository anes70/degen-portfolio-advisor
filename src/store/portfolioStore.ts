import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Token, Network } from '../types/token';

// ========================================================
// RECOPIE TES DEUX CLÉS ALCHEMY DISTINCTES ICI
// ========================================================
const ALCHEMY_SOLANA_KEY = "p4VwvqxWwBmS2d0Qq6_ct";
const ALCHEMY_BASE_KEY   = "_dJrQehMB7TYeu11Ja894";
// ========================================================

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
          wallets: { ...state.wallets, [network]: address.trim() },
          error: null
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
        let scannedTokens: { mint: string; balance: number; network: Network; symbol: string }[] = [];

        const SOLANA_RPC = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_SOLANA_KEY}`;
        const BASE_RPC = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_BASE_KEY}`;

        try {
          if (wallets.solana && (wallets.solana.length < 32 || wallets.solana.length > 44)) {
            set({ error: "L'adresse Solana n'est pas valide.", isLoading: false });
            return;
          }
          if (wallets.base && (!wallets.base.startsWith('0x') || wallets.base.length !== 42)) {
            set({ error: "L'adresse Base n'est pas valide.", isLoading: false });
            return;
          }

          // ==================== 1. SCAN SOLANA ====================
          if (wallets.solana) {
            try {
              const solBalanceRes = await fetch(SOLANA_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [wallets.solana] })
              });

              if (!solBalanceRes.ok) {
                const textErr = await solBalanceRes.text();
                set({ error: `Alchemy Solana (HTTP ${solBalanceRes.status}) : Clé Solana incorrecte. Détails : ${textErr}`, isLoading: false });
                return;
              }

              const solBalanceData = await solBalanceRes.json();
              const lamports = solBalanceData.result?.value || 0;
              if (lamports > 0) {
                scannedTokens.push({
                  mint: 'So11111111111111111111111111111111111111112',
                  balance: lamports / 1000000000,
                  network: 'solana',
                  symbol: 'SOL'
                });
              }

              const splRes = await fetch(SOLANA_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0', id: 2, method: 'getTokenAccountsByOwner',
                  params: [wallets.solana, { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, { encoding: 'jsonParsed' }]
                })
              });
              
              if (splRes.ok) {
                const splData = await splRes.json();
                if (splData.result?.value) {
                  splData.result.value.forEach((acc: any) => {
                    const info = acc.account.data.parsed.info;
                    const balance = info.tokenAmount.uiAmount;
                    if (balance > 0) scannedTokens.push({ mint: info.mint, balance, network: 'solana', symbol: 'TOKEN' });
                  });
                }
              }
            } catch (e) {
              console.error(e);
            }
          }

          // ==================== 2. SCAN BASE ====================
          if (wallets.base) {
            try {
              const ethBalanceRes = await fetch(BASE_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'eth_getBalance', params: [wallets.base, 'latest'] })
              });

              if (!ethBalanceRes.ok) {
                const textErr = await ethBalanceRes.text();
                set({ error: `Alchemy Base (HTTP ${ethBalanceRes.status}) : Clé Base incorrecte. Détails : ${textErr}`, isLoading: false });
                return;
              }

              const ethBalanceData = await ethBalanceRes.json();
              if (ethBalanceData.result) {
                const wei = parseInt(ethBalanceData.result, 16);
                if (wei > 0) {
                  scannedTokens.push({
                    mint: '0x4200000000000000000000000000000000000006',
                    balance: wei / 1e18,
                    network: 'base',
                    symbol: 'ETH'
                  });
                }
              }

              const tokenListRes = await fetch(`https://base.blockscout.com/api/v2/addresses/${wallets.base}/token-balances`);
              if (tokenListRes.ok) {
                const tokenListData = await tokenListRes.json();
                if (Array.isArray(tokenListData)) {
                  tokenListData.forEach((item: any) => {
                    const t = item.token;
                    if (t && t.type === 'ERC-20') {
                      const decimals = parseInt(t.decimals) || 18;
                      const balance = parseFloat(item.value) / Math.pow(10, decimals);
                      if (balance > 0) scannedTokens.push({ mint: t.address, balance, network: 'base', symbol: t.symbol || 'TOKEN' });
                    }
                  });
                }
              }
            } catch (e) {
              console.error(e);
            }
          }

          if (scannedTokens.length === 0) {
            set({ tokens: [], isLoading: false, error: "Aucun actif trouvé sur ces adresses." });
            return;
          }

          // ==================== 3. DEXSCREENER ====================
          const uniqueTokens = scannedTokens.filter((v, i, a) => a.findIndex(t => t.mint === v.mint) === i);
          const mintsList = uniqueTokens.map(t => t.mint).slice(0, 30).join(',');
          
          const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintsList}`);
          const dexData = await dexRes.json();

          const finalTokens: Token[] = [];

          uniqueTokens.forEach((scanned) => {
            const pair = dexData.pairs?.find((p: any) => p.baseToken.address.toLowerCase() === scanned.mint.toLowerCase());
            if (!pair && scanned.symbol !== 'SOL' && scanned.symbol !== 'ETH') return;

            const existing = currentTokens.find(t => t.id === `${scanned.network}-${scanned.mint.toLowerCase()}`);
            const currentPrice = pair ? parseFloat(pair.priceUsd) : (scanned.symbol === 'SOL' ? 140 : 3000);
            const entryPrice = existing ? existing.entryPrice : currentPrice;

            finalTokens.push({
              id: `${scanned.network}-${scanned.mint.toLowerCase()}`,
              name: pair?.baseToken?.name || scanned.symbol,
              symbol: pair?.baseToken?.symbol || scanned.symbol,
              mintAddress: scanned.mint,
              network: scanned.network,
              balance: scanned.balance,
              entryPrice,
              marketData: {
                currentPrice,
                volume24h: pair?.volume?.h24 || 100000,
                volumeChange1h: pair?.priceChange?.h1 || 0,
                liquidity: pair?.liquidity?.usd || 50000,
                ath: currentPrice * 1.3,
                holderCount: 25000,
                top10HolderShare: 15,
                ageInDays: 60,
                txCount24h: 2000,
                githubCommits30d: 0,
                socialSentimentScore: 80,
                rugPullRiskScore: 2
              }
            });
          });

          finalTokens.sort((a, b) => (b.balance * b.marketData.currentPrice) - (a.balance * a.marketData.currentPrice));
          set({ tokens: finalTokens, isLoading: false, error: null });

        } catch (err) {
          set({ error: "Erreur réseau.", isLoading: false });
        }
      },

      clearPortfolio: () => set({ wallets: { solana: '', base: '' }, tokens: [], error: null }),
    }),
    {
      name: 'degen-portfolio-storage',
    }
  )
);
