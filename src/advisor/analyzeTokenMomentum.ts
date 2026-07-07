import { Token } from '../types/token';
import { AdvisorSignal, SignalType } from '../types/advisor';
import { calculateGlobalTokenScore } from './scoreEngine';

export function analyzeTokenMomentum(token: Token): AdvisorSignal {
  const m = token.marketData;
  const score = calculateGlobalTokenScore(token);

  const pnl = ((m.currentPrice - token.entryPrice) / token.entryPrice) * 100;
  const ratioVolLiq = m.volume24h / m.liquidity;
  const athDrop = ((m.ath - m.currentPrice) / m.ath) * 100;
  const deltaVol1h = m.volumeChange1h;

  let type: SignalType = 'CONSOLIDATION';
  let label = 'Consolidation';
  let color = '#94a3b8'; 
  let badgeBg = 'rgba(148, 164, 184, 0.1)';
  let icon = 'CircleDot';
  let explanation = 'Le token se stabilise dans une range neutre. Attente de confirmation de volume.';
  let reasons: string[] = ['Volume et prix stables sur les dernières fenêtres de temps.'];
  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  // 1. L'IMPLACABLE PARABOLE
  if (pnl >= 20 && m.volume24h > 10000000 && deltaVol1h > 25 && athDrop <= 15) {
    type = 'PARABOLIC_RUN';
    label = "L'Implacable Parabole";
    color = '#00ffcc'; 
    badgeBg = 'rgba(0, 255, 204, 0.1)';
    icon = 'Flame';
    explanation = 'Momentum acheteur ultra-violent. Le token est en pleine phase de Price Discovery.';
    reasons = ['Extension haussière parabolique active.', `Accélération du volume horaire de ${deltaVol1h.toFixed(1)}%.`, 'Proche de son ATH local.'];
    confidence = 'HIGH';
  }
  // 2. RÈGLE D'OR DU DEGEN
  else if (pnl >= 100) {
    type = 'GOLDEN_RULE';
    label = "Règle d'Or du Degen";
    color = '#f59e0b'; 
    badgeBg = 'rgba(245, 158, 11, 0.1)';
    icon = 'Coins';
    explanation = 'Prenez des profits immédiatement ! Sécurisez au moins 50% de votre position initiale.';
    reasons = [`Votre PnL actuel est de +${pnl.toFixed(0)}%.`, 'Le capital initial doit être extrait pour éliminer le risque directionnel.'];
    confidence = 'HIGH';
  }
  // 4. PIÈGE DE LA LIQUIDITÉ
  else if (athDrop <= 12 && deltaVol1h < -40 && ratioVolLiq < 0.15) {
    type = 'LIQUIDITY_TRAP';
    label = 'Piège de la Liquidité';
    color = '#ef4444'; 
    badgeBg = 'rgba(239, 68, 68, 0.1)';
    icon = 'ShieldAlert';
    explanation = "Danger : Le prix est artificiellement maintenu proche de l'ATH mais le volume s'est effondré. Risque d'impossibilité de sortie.";
    reasons = ['Chute drastique de la vélocité des échanges.', `Ratio Volume/Liquidité faible (${ratioVolLiq.toFixed(3)}).`];
    confidence = 'HIGH';
  }
  // 3. REPLI SAIN EN BULL MARKET
  else if (m.volume24h > 5000000 && athDrop >= 15 && athDrop <= 35 && deltaVol1h >= -5) {
    type = 'HEALTHY_PULLBACK';
    label = 'Repli Sain en Bull Market';
    color = '#3b82f6'; 
    badgeBg = 'rgba(59, 130, 246, 0.1)';
    icon = 'TrendingUp';
    explanation = "Opportunité d'accumulation saine si le narratif fondamental reste intact.";
    reasons = [`Correction technique saine de ${athDrop.toFixed(0)}% depuis l'ATH.`, 'La structure de volume montre une résilience des acheteurs.'];
    confidence = 'MEDIUM';
  }
  // 5. CHOC DE VOLUMES HORAIRES
  else if (deltaVol1h > 100) {
    type = 'VOLUME_EXPLOSION';
    label = 'Choc de Volume Horaire';
    color = '#a855f7'; 
    badgeBg = 'rgba(168, 85, 247, 0.1)';
    icon = 'Zap';
    explanation = "Anomalie de volume horaire détectée. Une entrée d'insiders ou une news majeure est imminente.";
    reasons = [`Augmentation soudaine de +${deltaVol1h.toFixed(0)}% du volume sur les 60 dernières minutes.`];
    confidence = 'MEDIUM';
  }
  // 6. CAPITULATION / DEAD TOKEN
  else if (pnl <= -40 || athDrop > 60) {
    const isDead = deltaVol1h < -50 && m.volume24h < 20000;
    if (isDead) {
      type = 'DEAD_TOKEN';
      label = 'Dead Token / Rug';
      color = '#7f1d1d'; 
      badgeBg = 'rgba(127, 29, 29, 0.2)';
      icon = 'Skull';
      explanation = 'Le projet ne montre plus aucun signe d\'activité on-chain. Vente à perte recommandée pour recycler les poussières.';
      reasons = ['Volume 24h squelettique.', 'Perte de valeur irréversible proche du sommet.'];
      confidence = 'HIGH';
    } else {
      type = 'CAPITULATION';
      label = 'Capitulation';
      color = '#ea580c'; 
      badgeBg = 'rgba(234, 88, 12, 0.1)';
      icon = 'TrendingDown';
      explanation = 'Vente panique globale. Surveillez l\'apparition d\'un bottom de volume.';
      reasons = [`Chute sévère de -${athDrop.toFixed(0)}% par rapport aux plus hauts.`];
      confidence = 'MEDIUM';
    }
  }
  // EXTENSION : WHALE ACCUMULATION
  else if (ratioVolLiq > 0.8 && token.marketData.top10HolderShare > 65) {
    type = 'WHALE_ACCUMULATION';
    label = 'Whale Accumulation';
    color = '#22c55e'; 
    badgeBg = 'rgba(34, 197, 94, 0.1)';
    icon = 'Anchor';
    explanation = 'Les gros portefeuilles accumulent agressivement le supply disponible.';
    reasons = ['Concentration de l\'offre en augmentation.', 'Forte pression d\'achat discrète.'];
    confidence = 'MEDIUM';
  }

  return { type, label, color, badgeBg, icon, score, explanation, reasons, confidence };
}
