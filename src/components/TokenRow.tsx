import React, { useState } from 'react';
import { Token } from '../types/token';
import { usePortfolioStore } from '../store/portfolioStore';
import { formatPrice, formatLargeNumber, formatPercentage } from '../utils/format';
import { analyzeTokenMomentum } from '../advisor/analyzeTokenMomentum';
import { Edit2, Check, X, Flame, Coins, ShieldAlert, TrendingUp, Zap, Skull, Anchor, CircleDot } from 'lucide-react';

interface TokenRowProps {
  token: Token;
}

const IconMap: Record<string, React.ComponentType<any>> = {
  Flame, Coins, ShieldAlert, TrendingUp, Zap, Skull, Anchor, CircleDot
};

export const TokenRow: React.FC<TokenRowProps> = ({ token }) => {
  const updateEntryPrice = usePortfolioStore((state) => state.updateEntryPrice);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(token.entryPrice.toString());

  const currentPrice = token.marketData.currentPrice;
  const tokenValueUSD = token.balance * currentPrice;
  const pnlPercentage = ((currentPrice - token.entryPrice) / token.entryPrice) * 100;
  const athDropPercentage = ((token.marketData.ath - currentPrice) / token.marketData.ath) * 100;

  const signal = analyzeTokenMomentum(token);
  const SignalIcon = IconMap[signal.icon] || CircleDot;

  const handleSave = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      updateEntryPrice(token.id, parsed);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(token.entryPrice.toString());
    setIsEditing(false);
  };

  return (
    <tr className="border-b border-slate-900/60 bg-slate-950/20 hover:bg-slate-900/30 transition-colors font-mono text-xs">
      <td className="px-6 py-4 flex items-center gap-3">
        <div className="relative">
          <div className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-300 shadow-inner">
            {token.symbol.substring(0, 2)}
          </div>
          <span className={`absolute -bottom-1 -right-1 text-[8px] font-extrabold px-1 rounded border ${
            token.network === 'solana' 
              ? 'bg-purple-950/80 border-purple-800 text-purple-400' 
              : 'bg-cyan-950/80 border-cyan-800 text-cyan-400'
          }`}>
            {token.network === 'solana' ? 'SOL' : 'BASE'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-200 tracking-wide">{token.symbol}</span>
          <span className="text-[10px] text-slate-500 max-w-[100px] truncate">{token.name}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-300">{token.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
          <span className="text-[10px] text-slate-500">{formatPrice(tokenValueUSD)}</span>
        </div>
      </td>

      <td className="px-6 py-4 text-slate-300 font-medium">
        {formatPrice(currentPrice)}
      </td>

      <td className="px-6 py-4">
        {isEditing ? (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 max-w-[130px]">
            <input
              type="number"
              step="any"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full bg-transparent text-xs text-cyan-400 focus:outline-none pl-1 font-bold"
              autoFocus
            />
            <button onClick={handleSave} className="text-emerald-400 hover:text-emerald-300 p-0.5">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleCancel} className="text-rose-400 hover:text-rose-300 p-0.5">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="group flex items-center gap-2 text-slate-400">
            <span>{formatPrice(token.entryPrice)}</span>
            <button 
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-cyan-400 transition-opacity p-0.5"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </td>

      <td className={`px-6 py-4 font-bold ${pnlPercentage >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
        {formatPercentage(pnlPercentage)}
      </td>

      <td className="px-6 py-4 text-slate-400">
        <div className="flex flex-col">
          <span>{formatLargeNumber(token.marketData.volume24h)}</span>
          <span className={`text-[10px] ${token.marketData.volumeChange1h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            1h: {formatPercentage(token.marketData.volumeChange1h)}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-slate-400">
        {formatLargeNumber(token.marketData.liquidity)}
      </td>

      <td className="px-6 py-4 text-rose-400/80">
        -{athDropPercentage.toFixed(1)}%
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border tracking-wider"
            style={{ backgroundColor: signal.badgeBg, borderColor: `${signal.color}30`, color: signal.color }}
          >
            <SignalIcon className="h-3 w-3" />
            <span className="uppercase">{signal.label}</span>
          </div>

          <div className={`h-6 w-8 rounded flex items-center justify-center text-[10px] font-black border font-mono
            ${signal.score >= 75 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
              : signal.score >= 45 
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' 
                : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
            }`}
          >
            {signal.score}
          </div>
        </div>
      </td>
    </tr>
  );
};
