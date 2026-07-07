export type SignalType =
  | 'PARABOLIC_RUN'
  | 'GOLDEN_RULE'
  | 'HEALTHY_PULLBACK'
  | 'LIQUIDITY_TRAP'
  | 'VOLUME_EXPLOSION'
  | 'CAPITULATION'
  | 'WHALE_ACCUMULATION'
  | 'EXIT_LIQUIDITY'
  | 'FAKE_BREAKOUT'
  | 'SHORT_SQUEEZE'
  | 'DEAD_TOKEN'
  | 'STRONG_RECOVERY'
  | 'DISTRIBUTION_PHASE'
  | 'SMART_MONEY_ENTRY'
  | 'CONSOLIDATION'
  | 'PRICE_DISCOVERY';

export interface AdvisorSignal {
  type: SignalType;
  label: string;
  color: string;       
  badgeBg: string;     
  icon: string;        
  score: number;       
  explanation: string; 
  reasons: string[];   
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}
