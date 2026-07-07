import React, { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { TokenRow } from './TokenRow';
import { Network } from '../types/token';
import { Layers, Disc, Database } from 'lucide-react';

export const TokenTable: React.FC = () => {
  const { tokens, isLoading } = usePortfolioStore();
  const [networkFilter, setNetworkFilter] = useState<Network | 'all'>('all');

  const filteredTokens = tokens
    .filter((t) => networkFilter === 'all' || t.network === networkFilter)
    .sort((a, b) => (b.balance * b.marketData.currentPrice) - (a.balance * a.marketData.currentPrice));

  if (tokens.length === 0 && !isLoading) {
    return (
      <div className="w-full border border-dashed border-slate-900 rounded-2xl p-12 text-center bg-slate-950/10 backdrop-blur-sm">
        <p className="text-sm font-mono text-slate-600 tracking-wide uppercase">
          Aucun actif détecté. Entrez des adresses de wallet ci-dessus pour lancer l'analyse de momentum.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
        <button
          onClick={() => setNetworkFilter('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all duration-200
            ${networkFilter === 'all'
              ? 'bg-slate-900 border-slate-800 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.05)]'
              : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
            }`}
        >
          <Layers className="h-3 w-3" />
          ALL ASSETS ({tokens.length})
        </button>
        <button
          onClick={() => setNetworkFilter('solana')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all duration-200
            ${networkFilter === 'solana'
              ? 'bg-purple-950/30 border-purple-900/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.05)]'
              : 'bg-transparent border-transparent text-slate-500 hover:text-purple-400/60'
            }`}
        >
          <Disc className="h-3 w-3" />
          SOLANA ({tokens.filter(t => t.network === 'solana').length})
        </button>
        <button
          onClick={() => setNetworkFilter('base')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all duration-200
            ${networkFilter === 'base'
              ? 'bg-cyan-950/30 border-cyan-900/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.05)]'
              : 'bg-transparent border-transparent text-slate-500 hover:text-cyan-400/60'
            }`}
        >
          <Database className="h-3 w-3" />
          BASE EVM ({tokens.filter(t => t.network === 'base').length})
        </button>
      </div>

      <div className="w-full overflow-x-auto bg-slate-950 border border-slate-900 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900 font-mono text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900/20">
              <th className="px-6 py-4 font-semibold">Asset</th>
              <th className="px-6 py-4 font-semibold">Balance</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Avg Entry</th>
              <th className="px-6 py-4 font-semibold">PnL</th>
              <th className="px-6 py-4 font-semibold">Volume (24h/1h)</th>
              <th className="px-6 py-4 font-semibold">Liquidity</th>
              <th className="px-6 py-4 font-semibold">ATH Drop</th>
              <th className="px-6 py-4 font-semibold">Degen Advisor / Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/40 relative">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 font-mono text-xs text-cyan-500">
                    <div className="h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="tracking-widest animate-pulse font-bold uppercase">Analyse des smart contracts on-chain...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center font-mono text-xs text-slate-600 uppercase">
                  Aucun token trouvé pour ce réseau spécifique.
                </td>
              </tr>
            ) : (
              filteredTokens.map((token) => (
                <TokenRow key={token.id} token={token} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
