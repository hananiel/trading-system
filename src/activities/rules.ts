export interface PriceData {
  ticker: string;
  price: number;
  movingAverage: number;
  volume?: number;
}

export interface RuleResult {
  isBullish: boolean;
  triggered: boolean;
  rule: string;
  confidence?: number;
}

export interface MultiRuleResult {
  ruleResults: RuleResult[];
  overallSignal: 'BUY' | 'SELL' | 'HOLD';
  overallConfidence: number;
}

// Enhanced rule evaluation with multiple indicators
export async function evaluatePriceRuleActivity(data: PriceData): Promise<RuleResult> {
  const isBullish = data.price > data.movingAverage;
  const priceDiff = Math.abs((data.price - data.movingAverage) / data.movingAverage);
  const confidence = Math.min(priceDiff * 100, 100); // Confidence based on price deviation
  
  return {
    isBullish,
    triggered: priceDiff > 0.01, // Trigger only if price deviates > 1%
    rule: 'price > 50-DMA',
    confidence: Math.round(confidence * 100) / 100
  };
}

// Volume analysis rule
export async function evaluateVolumeRuleActivity(data: PriceData): Promise<RuleResult> {
  const avgVolume = 500000; // Simulated average volume
  const volume = data.volume || 0;
  const isHighVolume = volume > avgVolume * 1.5; // 50% above average
  
  return {
    isBullish: isHighVolume,
    triggered: isHighVolume,
    rule: `volume > ${avgVolume * 1.5} (high volume)`,
    confidence: Math.min((volume / avgVolume - 1) * 100, 100)
  };
}

// Momentum rule (price change)
export async function evaluateMomentumRuleActivity(data: PriceData): Promise<RuleResult> {
  const priceChange = (Math.random() - 0.5) * 0.05; // ±2.5% change simulation
  const isBullishMomentum = priceChange > 0.01; // > 1% momentum
  
  return {
    isBullish: isBullishMomentum,
    triggered: Math.abs(priceChange) > 0.005, // > 0.5% change
    rule: `momentum: ${(priceChange * 100).toFixed(2)}%`,
    confidence: Math.abs(priceChange) * 2000
  };
}

// Multi-rule evaluation for comprehensive analysis
export async function evaluateMultipleRulesActivity(data: PriceData): Promise<MultiRuleResult> {
  const [priceRule, volumeRule, momentumRule] = await Promise.all([
    evaluatePriceRuleActivity(data),
    evaluateVolumeRuleActivity(data),
    evaluateMomentumRuleActivity(data)
  ]);
  
  const ruleResults = [priceRule, volumeRule, momentumRule];
  const triggeredRules = ruleResults.filter(r => r.triggered);
  
  // Calculate overall signal based on triggered rules
  let overallSignal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let overallConfidence = 0;
  
  if (triggeredRules.length > 0) {
    const bullishCount = triggeredRules.filter(r => r.isBullish).length;
    const bearishCount = triggeredRules.filter(r => !r.isBullish).length;
    
    if (bullishCount > bearishCount) {
      overallSignal = 'BUY';
      overallConfidence = bullishCount / triggeredRules.length;
    } else if (bearishCount > bullishCount) {
      overallSignal = 'SELL';
      overallConfidence = bearishCount / triggeredRules.length;
    } else {
      overallSignal = 'HOLD';
      overallConfidence = 0.3; // Low confidence for conflicting signals
    }
  }
  
  return {
    ruleResults,
    overallSignal,
    overallConfidence: Math.round(overallConfidence * 100) / 100
  };
}