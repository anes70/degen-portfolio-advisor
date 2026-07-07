import React, { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { Wallet, Search } from 'lucide-react';

export const WalletInput: React.FC = () => {
  const { wallets, setWalletAddress, clearPortfolio } = usePortfolioStore();
  
  const [solInput, setSolInput] = useState(wallets.solana);
  const [baseInput, setBaseInput] = useState(wallets.base);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (solInput.trim() !== wallets.solana) {
      setWalletAddress('solana', solInput.trim());
    }
    if (baseInput.trim() !== wallets.base) {
      setWalletAddress('base', baseInput.trim());
    }
  };

  const hasActiveWallets = wallets.solana || wallets.base;

  return (
    <div className="w-full bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Scanner automatique de Portefeuille Réel
          </h2>
        </div>
        {hasActiveWallets && (
          <button
            onClick={() => {
              setSolInput('');
              setBaseInput('');
              clearPortfolio();
            }}
            className="text-[10px] font-mono text-rose-500 hover:underline tracking-tight"
          >
            DECONNECTER LES WALLETS
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">Adresse Solana</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-purple-500/80">SOL</span>
              <input
                type="text"
                placeholder="Ex: 7xKX... (Phantom, Backpack)"
                value={solInput}
                onChange={(e) => setSolInput(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-900 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">Adresse Base (EVM)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-cyan-500/80">0x</span>
              <input
                type="text"
                placeholder="Ex: 0x123... (Rabby, Metamask)"
                value={baseInput}
                onChange={(e) => setBaseInput(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-900 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-slate-100 px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider shadow-lg"
          >
            <Search className="h-3.5 w-3.5" />
            LANCER LE SCAN LIVE
          </button>
        </div>
      </form>
    </div>
  );
};
