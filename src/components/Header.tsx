import React from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { formatPrice, formatPercentage } from '../utils/format';
import { RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const { tokens, isLoading, refreshPortfolio, wallets } = usePortfolioStore();

  const totalValueUSD = tokens.reduce((acc, t) => acc + t.balance * t.marketData.currentPrice, 0);
  const totalCostUSD = tokens.reduce((acc, t) => acc + t.balance * t.entryPrice, 0);
  
  const totalProfitLossUSD = totalValueUSD - totalCostUSD;
  const totalProfitLossPercentage = totalCostUSD > 0 ? (totalProfitLossUSD / totalCostUSD) * 100 : 0;

  const isPositive = totalProfitLossUSD >= 0;
  const hasWallets = wallets.solana || wallets.base;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <span className="font-black text-sm text-black tracking-tighter">DG</span>
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-100 tracking-wide">DEGEN PORTFOLIO</h1>
          <p className="text-xs text-cyan-400/70 font-mono font-medium">Momentum Advisor v1.0</p>
        </div>
      </div>

      {hasWallets && (
        <div className="flex items-center gap-8 font-mono bg-slate-900/30 border border-slate-900/80 rounded-xl px-6 py-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Net Worth</span>
            <span className="text-xl font-bold text-slate-100 tracking-tight">
              {formatPrice(totalValueUSD)}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-slate-900" />

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total PnL</span>
            <span className={`text-sm font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>
              {formatPrice(totalProfitLossUSD)} ({formatPercentage(totalProfitLossPercentage)})
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={refreshPortfolio}
          disabled={isLoading || !hasWallets}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border font-mono transition-all duration-300
            ${isLoading 
              ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed' 
              : !hasWallets
                ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/30 hover:shadow-[0_0_10px_rgba(34,211,238,0.15)]'
            }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          {isLoading ? 'SYNCING...' : 'REFRESH'}
        </button>
      </div>
    </header>
  );
};
