import React, { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { Network } from '../types/token';

export const WalletInput: React.FC = () => {
  const { tokens, addCustomToken, clearPortfolio, removeToken } = usePortfolioStore();
  
  const [network, setNetwork] = useState<Network>('solana');
  const [address, setAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [balance, setBalance] = useState('');
  const [entryPrice, setEntryPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !balance) return;

    addCustomToken(
      network,
      address.trim(),
      symbol.trim() || 'TOKEN',
      parseFloat(balance) || 0,
      parseFloat(entryPrice) || 0
    );

    setAddress('');
    setSymbol('');
    setBalance('');
    setEntryPrice('');
  };

  return (
    <div className="w-full bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Injecteur de Tokens Réels (Solana & Base)
          </h2>
        </div>
        {tokens.length > 0 && (
          <button
            onClick={clearPortfolio}
            className="text-[10px] font-mono text-rose-500 hover:underline tracking-tight"
          >
            EFFACER TOUT
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono text-xs items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">Réseau</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as Network)}
            className="w-full bg-slate-900/50 border border-slate-900 text-slate-200 rounded-xl px-3 py-3 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="solana">Solana</option>
            <option value="base">Base (EVM)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">Adresse du Contrat (CA)</label>
          <input
            type="text"
            placeholder="Adresse de contrat du token..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-900 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">Nom / Symbole</label>
          <input
            type="text"
            placeholder="Ex: BONK, DEGEN..."
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-900 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">Quantité Détenue</label>
          <input
            type="number"
            step="any"
            placeholder="Ex: 500"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-900 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-slate-100 py-3 rounded-xl font-bold tracking-wider transition-all"
          >
            <Plus className="h-4 w-4" />
            INTEGRER
          </button>
        </div>
      </form>

      {tokens.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-900/60">
          {tokens.map(t => (
            <div key={t.id} className="flex items-center gap-2 bg-slate-900/60 border border-slate-900 text-[10px] font-mono px-2.5 py-1 rounded-lg text-slate-400">
              <span className="font-bold text-slate-200">{t.symbol}</span>
              <button type="button" onClick={() => removeToken(t.id)} className="text-slate-600 hover:text-rose-400">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
