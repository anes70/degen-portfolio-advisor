import React, { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { analyzeTokenMomentum } from '../advisor/analyzeTokenMomentum';
import { 
  Terminal, ShieldAlert, Flame, Coins, TrendingUp, 
  Zap, Skull, Anchor, CircleDot, AlertCircle, CheckCircle 
} from 'lucide-react';

const IconMap: Record<string, React.ComponentType<any>> = {
  Flame, Coins, ShieldAlert, TrendingUp, Zap, Skull, Anchor, CircleDot
};

const SIGNAL_PRIORITY: Record<string, number> = {
  GOLDEN_RULE: 100,
  LIQUIDITY_TRAP: 90,
  DEAD_TOKEN: 80,
  PARABOLIC_RUN: 70,
  VOLUME_EXPLOSION: 60,
  HEALTHY_PULLBACK: 50,
  WHALE_ACCUMULATION: 40,
  CAPITULATION: 30,
  CONSOLIDATION: 10
};

export const AdvisorCard: React.FC = () => {
  const { tokens, isLoading } = usePortfolioStore();
  const [selectedSignalIndex, setSelectedSignalIndex] = useState<number>(0);

  if (isLoading || tokens.length === 0) return null;

  const activeAnalyses = tokens.map(token => ({
    token,
    signal: analyzeTokenMomentum(token)
  })).sort((a, b) => (SIGNAL_PRIORITY[b.signal.type] || 0) - (SIGNAL_PRIORITY[a.signal.type] || 0));

  const currentAnalysis = activeAnalyses[selectedSignalIndex] || activeAnalyses[0];
  if (!currentAnalysis) return null;

  const { token, signal } = currentAnalysis;
  const ActiveIcon = IconMap[signal.icon] || CircleDot;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
      <div className="lg:col-span-1 bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col gap-2 max-h-[420px] overflow-y-auto shadow-xl">
        <div className="flex items-center gap-2 px-2 pb-3 border-b border-slate-900">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Active Market Signals ({activeAnalyses.length})
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          {activeAnalyses.map((item, index) => {
            const ItemIcon = IconMap[item.signal.icon] || CircleDot;
            const isSelected = index === selectedSignalIndex;
            return (
              <button
                key={item.token.id}
                onClick={() => setSelectedSignalIndex(index)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between
                  ${isSelected 
                    ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-[0_0_15px_rgba(0,0,0,0.3)]' 
                    : 'bg-slate-950/40 border-transparent text-slate-500 hover:bg-slate-900/40 hover:text-slate-300'
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${item.signal.color}10`, color: item.signal.color }}>
                    <ItemIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate">{item.token.symbol}</span>
                    <span className="text-[9px] text-slate-500 tracking-tight uppercase truncate">{item.signal.label}</span>
                  </div>
                </div>
                <div className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800/60">
                  {item.signal.score}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div 
          className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-[80px] opacity-20 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: signal.color }}
        />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${signal.color}10`, borderColor: `${signal.color}20`, color: signal.color }}>
                <ActiveIcon className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-200 tracking-wide uppercase">{signal.label}</h3>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border
                    ${signal.confidence === 'HIGH' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-amber-950/40 border-amber-800 text-amber-400'}`}>
                    {signal.confidence} CONFIDENCE
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Focus actif sur le token <span className="text-cyan-400 font-bold">{token.symbol}</span> ({token.name})</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-900/40 border border-slate-900 rounded-xl px-4 py-2">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Token Score</span>
              <span className="text-lg font-black" style={{ color: signal.color }}>{signal.score}<span className="text-xs text-slate-600 font-normal">/100</span></span>
            </div>
          </div>

          <div className="mt-5 bg-slate-900/30 border border-slate-900/80 rounded-xl p-4">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Degen Advice & Action plan</span>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {signal.explanation}
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Faisceau d'indices algorithmiques</span>
            {signal.reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                <AlertCircle className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-slate-600 font-medium">
          <span className="uppercase tracking-wider">Algorithmic Engine v1.0.4</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-cyan-500/50" /> Données synchronisées on-chain</span>
        </div>
      </div>
    </div>
  );
};
