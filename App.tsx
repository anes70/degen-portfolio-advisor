import React, { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { HeaderPanel } from "./components/HeaderPanel";
import { WalletInputPanel } from "./components/WalletInputPanel";
import { NetworkTabs } from "./components/NetworkTabs";
import { GlassPanel } from "./components/GlassPanel";
import { TokenTable } from "./components/TokenTable";
import { usePolling } from "./hooks/usePolling";
import { usePortfolioStore } from "./store/portfolioStore";
import { REFRESH_INTERVAL_MS } from "./utils/constants";
import type { Network } from "./types/wallet";

export default function App() {
  const [activeTab, setActiveTab] = useState<Network>("solana");
  const tokens = usePortfolioStore((s) => s.tokens);
  const loading = usePortfolioStore((s) => s.loading);
  const refreshAll = usePortfolioStore((s) => s.refreshAll);

  const pollTick = useCallback(() => {
    refreshAll();
  }, [refreshAll]);

  usePolling(pollTick, REFRESH_INTERVAL_MS);

  const counts: Record<Network, number> = { solana: tokens.solana.length, base: tokens.base.length };

  return (
    <div className="min-h-screen w-full bg-[#050507] text-slate-200 relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5">
        <HeaderPanel />
        <WalletInputPanel />

        <GlassPanel className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <NetworkTabs active={activeTab} onChange={setActiveTab} counts={counts} />
            {loading ? (
              <span className="text-xs text-cyan-400 font-mono flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Récupération on-chain en cours...
              </span>
            ) : null}
          </div>
          <TokenTable network={activeTab} />
        </GlassPanel>

        <p className="text-center text-[11px] text-slate-700 font-mono pb-4">
          Données 100% simulées à des fins de démonstration — aucune clé API réelle n'est appelée.
          Branche Helius / Moralis / Dexscreener via src/services/*.ts pour passer en production.
        </p>
      </div>
    </div>
  );
}
