import { Token } from '../types/token';

export function calculateGlobalTokenScore(token: Token): number {
  const m = token.marketData;
  const athDrop = ((m.ath - m.currentPrice) / m.ath) * 100;

  // 1. Momentum prix/volume (20%)
  let momentumScore = 50;
  if (m.volumeChange1h > 50) momentumScore += 30;
  if (m.volumeChange1h < -30) momentumScore -= 20;
  if (athDrop < 10) momentumScore += 20;
  momentumScore = Math.max(0, Math.min(100, momentumScore));

  // 2. Liquidité (10%)
  let liquidityScore = 0;
  if (m.liquidity > 1000000) liquidityScore = 100;
  else if (m.liquidity > 250000) liquidityScore = 75;
  else if (m.liquidity > 50000) liquidityScore = 40;
  else liquidityScore = 15;

  // 3. Activité on-chain (15%)
  let activityScore = Math.min(100, (m.txCount24h / 1500) * 100);

  // 4. Distribution holders (10%)
  let holderScore = 100 - m.top10HolderShare; 

  // 5. Âge du token (5%)
  let ageScore = 0;
  if (m.ageInDays > 180) ageScore = 100;
  else if (m.ageInDays > 30) ageScore = 75;
  else if (m.ageInDays > 7) ageScore = 40;
  else ageScore = 15;

  // 6. Volume transactions (10%)
  let volumeScore = 0;
  if (m.volume24h > 5000000) volumeScore = 100;
  else if (m.volume24h > 1000000) volumeScore = 80;
  else if (m.volume24h > 100000) volumeScore = 50;
  else volumeScore = 20;

  // 7. Développement projet (10%)
  let devScore = Math.min(100, (m.githubCommits30d / 40) * 100);

  // 8. Présence sociale / Narratif (10%)
  let socialScore = m.socialSentimentScore;

  // 9. Risques techniques (5%)
  let techRiskScore = 100 - m.rugPullRiskScore;

  // 10. Confiance globale (10%)
  let trustScore = (liquidityScore + devScore + holderScore) / 3;

  // Somme pondérée finale selon tes specs d'importance
  const totalScore =
    (momentumScore * 0.20) +
    (liquidityScore * 0.10) +
    (activityScore * 0.15) +
    (holderScore * 0.10) +
    (ageScore * 0.05) +
    (volumeScore * 0.10) +
    (devScore * 0.10) +
    (socialScore * 0.10) +
    (techRiskScore * 0.05) +
    (trustScore * 0.10);

  return Math.round(totalScore);
}
