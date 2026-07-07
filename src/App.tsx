import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { WalletInput } from './components/WalletInput';
import { AdvisorCard } from './components/AdvisorCard';
import { TokenTable } from './components/TokenTable';
import { usePortfolioStore } from './store/portfolioStore';
import { Shield, LayoutGrid, Info } from 'lucide-react';

export default function App() {
  const { refreshPortfolio, wallets } = usePortfolioStore();

  useEffect(() => {
    if (wallets.solana || wallets.base) {
      refreshPortfolio();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 antialiased flex flex-col">
      {/* Barre de navigation premium et monitoring global */}
      <Header />

      {/* Zone principale de travail */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Saisie des portefeuilles */}
        <WalletInput />

        {/* Moteur algorithmique Degen Advisor */}
        <AdvisorCard />

        {/* Tableau de bord complet des tokens */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-cyan-400" />
              <h2 className="text-xs font-black text-slate-400 font-mono uppercase tracking-widest">
                Portfolio Balance Grid
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
              <Info className="h-3 w-3" />
              <span>Survolez "Avg Entry" pour modifier vos prix d'achat</span>
            </div>
          </div>
          
          <TokenTable />
        </div>
      </main>

      {/* Pied de page style Terminal Web3 */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 px-6 py-4 mt-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] text-slate-600">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-purple-500/60" />
          <span>Secured client-side execution — No private keys required.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>RPC Status: <span className="text-emerald-500 font-bold">READY (MOCK)</span></span>
          <span>© 2026 DEGEN ADVISOR INC.</span>
        </div>
      </footer>
    </div>
  );
}
