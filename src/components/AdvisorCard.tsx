import React, { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { analyzeTokenMomentum } from '../advisor/analyzeTokenMomentum';
import { Terminal, Flame, Coins, ShieldAlert, TrendingUp, Zap, Skull, Anchor, CircleDot, AlertCircle, CheckCircle } from 'lucide-react';

const IconMap: Record<string, React.ComponentType<any>> = {
  Flame, Coins, ShieldAlert, TrendingUp, Zap, Skull, Anchor, CircleDot
};

export const AdvisorCard: React.FC = () => {
  const { tokens, isLoading } = usePortfolioStore();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (isLoading || tokens.length === 0) {
    return (
      <div className="w-full bg-slate-950 border border-slate-900 rounded-2xl p-6 text-center font-mono text-xs text-slate-500 uppercase tracking-widest">
        ⚡ En attente d'analyse de marché... Écrivez des adresses pour activer l'Advisor.
      </div>
    );
  }

  const activeAnalyses = tokens.map(token => ({
    token,
    signal: analyzeTokenMomentum(token)
  }));

  const current = activeAnalyses[selectedIndex] || activeAnalyses[0];
  const ActiveIcon = IconMap[current.signal.icon] || CircleDot;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
      {/* Colonne Gauche : Liste des signaux */}
      <div className="lg:col-span-1 bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col gap-2 shadow-xl">
        <div className="flex items-center gap-2 px-2 pb-3 border-b border-slate-900">
          <Terminal className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Radars de Momentum ({activeAnalyses.length})
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          {activeAnalyses.map((item, index) => {
            const ItemIcon = IconMap[item.signal.icon] || CircleDot;
            return (
              <button
                key={item.token.id}
                onClick={() => setSelectedIndex(index)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between
                  ${index === selectedIndex 
                    ? 'bg-slate-900 border-cyan-500/30 text-slate-100 shadow-md shadow-cyan-950/20' 
                    : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:bg-slate-900/30'
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${item.signal.color}15`, color: item.signal.color }}>
                    <ItemIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-200">{item.token.symbol}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-tight font-semibold truncate">{item.signal.label}</span>
                  </div>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-950 border border-slate-800" style={{ color: item.signal.color }}>
                  {item.signal.score}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colonne Droite : Fenêtre de Conseil IA détaillée */}
      <div className="lg:col-span-2 bg-slate-900/20 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${current.signal.color}10`, borderColor: `${current.signal.color}20`, color: current.signal.color }}>
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-100 tracking-wide uppercase">{current.signal.label}</h3>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                    ANALYSE ALGO
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Diagnostic en temps réel pour <span className="text-cyan-400 font-bold">{current.token.symbol}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-900 rounded-xl px-4 py-2">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Score Global</span>
              <span className="text-lg font-black" style={{ color: current.signal.color }}>{current.signal.score}<span className="text-xs text-slate-600 font-normal">/100</span></span>
            </div>
          </div>

          <div className="mt-5 bg-slate-950/80 border border-slate-900 rounded-xl p-4">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Plan d'action Degen Advisor</span>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {current.signal.explanation}
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Indicateurs On-Chain relevés</span>
            {current.signal.reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <AlertCircle className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-slate-600">
          <span className="uppercase tracking-wider">Algorithmic Engine v1.0.4</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-500" /> Flux DexScreener Live</span>
        </div>
      </div>
    </div>
  );
};
