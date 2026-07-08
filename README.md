# Degen Portfolio Advisor

Dashboard Web3 (Solana + Base) avec moteur multi-facteurs "Degen Advisor V2".

## Lancer en local
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build production
\`\`\`bash
npm run build
npm run preview
\`\`\`

## Architecture
\`\`\`
src/
├── advisor/      # Moteur d'analyse (scoring, PnL, risque, scénarios)
├── components/   # UI React
├── hooks/        # usePolling, useLocalStorage
├── mocks/        # Génération de données simulées déterministes
├── services/     # Couche Web3 (Helius / Base / Dexscreener) - mock, prête à brancher en réel
├── store/        # Store Zustand global
├── types/        # Types TypeScript partagés
└── utils/        # Formatage, validation, constantes
\`\`\`

## Passer en données réelles
Chaque fonction de \`src/services/*.ts\` contient en commentaire la vraie requête
(Helius DAS \`getAssetsByOwner\`, Moralis/Alchemy \`getWalletTokenBalances\`, Dexscreener).
Remplace le corps mock par un \`fetch\` réel + ta clé API (stockée en variable d'environnement,
jamais commitée).
