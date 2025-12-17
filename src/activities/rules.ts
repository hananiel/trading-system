export interface PriceData {
  ticker: string;
  price: number;
  movingAverage: number;
  volume?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
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
  
  // Enhanced rule logic with previous close comparison
  const previousClose = data.previousClose || data.movingAverage;
  const gapFromPreviousClose = (data.price - previousClose) / previousClose;
  
  let ruleDescription = 'price > 50-DMA';
  if (gapFromPreviousClose > 0.02) {
    ruleDescription += ' + gap up';
  } else if (gapFromPreviousClose < -0.02) {
    ruleDescription += ' + gap down';
  }
  
  return {
    isBullish,
    triggered: priceDiff > 0.01, // Trigger only if price deviates > 1%
    rule: ruleDescription,
    confidence: Math.round(confidence * 100) / 100
  };
}

// Volume analysis rule
export async function evaluateVolumeRuleActivity(data: PriceData): Promise<RuleResult> {
  // Dynamic volume analysis based on market cap
  const avgVolumeByTicker: Record<string, number> = {
    'AAPL': 50_000_000,    // Large cap
    'GOOGL': 20_000_000,    // Large cap  
    'MSFT': 25_000_000,    // Large cap
    'TSLA': 100_000_000,   // Mid cap (high volatility)
    'AMZN': 60_000_000,    // Large cap
    'META': 30_000_000,    // Large cap
    'NVDA': 40_000_000     // Large cap
  };
  
  const avgVolume = avgVolumeByTicker[data.ticker] || 1_000_000;
  const volume = data.volume || 0;
  const volumeRatio = volume / avgVolume;
  
  // Multi-threshold analysis
  let isHighVolume = volume > avgVolume * 1.2; // 20% above average
  let isLowVolume = volume < avgVolume * 0.5; // 50% below average
  let isBullish = true; // Higher volume often indicates institutional interest
  
  // Volume analysis logic
  if (isLowVolume) {
    isBullish = false; // Low volume can indicate lack of interest
  } else if (volume > avgVolume * 2.0) {
    isBullish = true; // Very high volume confirms institutional buying
  }
  
  const triggered = isHighVolume || isLowVolume;
  let ruleDescription = `volume ratio: ${(volumeRatio * 100).toFixed(1)}%`;
  
  if (isHighVolume) {
    ruleDescription += ' (high volume)';
  } else if (isLowVolume) {
    ruleDescription += ' (low volume)';
  } else {
    ruleDescription += ' (normal volume)';
  }
  
  return {
    isBullish,
    triggered,
    rule: ruleDescription,
    confidence: Math.min(Math.abs(volumeRatio - 1) * 100, 100)
  };
}

// Momentum rule (price change)
export async function evaluateMomentumRuleActivity(data: PriceData): Promise<RuleResult> {
  const previousClose = data.previousClose || data.price;
  const priceChange = (data.price - previousClose) / previousClose;
  const isBullishMomentum = priceChange > 0.01; // > 1% momentum
  
  return {
    isBullish: isBullishMomentum,
    triggered: Math.abs(priceChange) > 0.005, // > 0.5% change
    rule: `momentum: ${(priceChange * 100).toFixed(2)}%`,
    confidence: Math.min(Math.abs(priceChange) * 1000, 100)
  };
}

// Market trend analysis using intraday high/low
export async function evaluateTrendRuleActivity(data: PriceData): Promise<RuleResult> {
  if (!data.dayHigh || !data.dayLow) {
    return {
      isBullish: false,
      triggered: false,
      rule: 'trend: insufficient data',
      confidence: 0
    };
  }
  
  const dayRange = data.dayHigh - data.dayLow;
  const pricePosition = (data.price - data.dayLow) / dayRange; // Position in daily range
  const isBullishTrend = pricePosition > 0.7; // In upper 30% of range
  
  // Stronger confidence if closer to extremes
  let confidence = 0;
  if (pricePosition > 0.8) {
    confidence = 80; // Near high
  } else if (pricePosition > 0.6) {
    confidence = 60; // Upper middle
  } else if (pricePosition < 0.3) {
    confidence = 75; // Near low (potential bounce)
  } else if (pricePosition < 0.5) {
    confidence = 50; // Lower middle
  } else {
    confidence = 30; // Middle range
  }
  
  let trendDescription = 'trend: ';
  if (isBullishTrend) {
    trendDescription += 'bullish (upper range)';
  } else if (pricePosition < 0.3) {
    trendDescription += 'oversold (lower range)';
  } else {
    trendDescription += 'neutral (mid-range)';
  }
  
  return {
    isBullish: isBullishTrend,
    triggered: dayRange > (data.price * 0.02), // Only trigger if meaningful range
    rule: trendDescription,
    confidence
  };
}

// Multi-rule evaluation for comprehensive analysis
export async function evaluateMultipleRulesActivity(data: PriceData): Promise<MultiRuleResult> {
  const [priceRule, volumeRule, momentumRule, trendRule] = await Promise.all([
    evaluatePriceRuleActivity(data),
    evaluateVolumeRuleActivity(data),
    evaluateMomentumRuleActivity(data),
    evaluateTrendRuleActivity(data)
  ]);
  
  const ruleResults = [priceRule, volumeRule, momentumRule, trendRule];
  const triggeredRules = ruleResults.filter(r => r.triggered);
  
  // Weight the rules by importance
  const weightedVotes = triggeredRules.map(r => {
    let weight = 1;
    if (r.rule.includes('price > 50-DMA')) weight = 1.5; // Technical analysis weight
    if (r.rule.includes('volume ratio')) weight = 1.2; // Volume confirmation
    if (r.rule.includes('momentum')) weight = 1.3; // Momentum confirmation
    if (r.rule.includes('trend')) weight = 1.4; // Trend analysis weight
    return { ...r, weight };
});
  
  // Calculate overall signal based on weighted votes
  const weightedVotes = triggeredRules.map(r => {
    let weight = 1;
    if (r.rule.includes('price > 50-DMA')) weight = 1.5; // Technical analysis weight
    if (r.rule.includes('volume ratio')) weight = 1.2; // Volume confirmation
    if (r.rule.includes('momentum')) weight = 1.3; // Momentum confirmation
    if (r.rule.includes('trend')) weight = 1.4; // Trend analysis weight
    return { ...r, weight };
  });
  
  // Calculate overall signal based on weighted votes
  let overallSignal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let overallConfidence = 0;
  
  if (triggeredRules.length > 0) {
    const bullishVotes = weightedVotes.filter(r => r.isBullish);
    const bearishVotes = weightedVotes.filter(r => !r.isBullish);
    const bullishWeight = bullishVotes.reduce((sum, r) => sum + r.weight, 0);
    const bearishWeight = bearishVotes.reduce((sum, r) => sum + r.weight, 0);
    const totalWeight = bullishWeight + bearishWeight;
    
    if (bullishWeight > bearishWeight * 1.2) { // 20% threshold for BUY
      overallSignal = 'BUY';
      overallConfidence = bullishWeight / totalWeight;
    } else if (bearishWeight > bullishWeight * 1.2) { // 20% threshold for SELL
      overallSignal = 'SELL';
      overallConfidence = bearishWeight / totalWeight;
    } else {
      overallSignal = 'HOLD';
      overallConfidence = 0.4; // Low confidence for conflicting signals
    }
  }
  }
  }
  
  // Boost confidence if multiple rules agree
  const agreementRatio = triggeredRules.length > 0 ? 
    Math.max(bullishWeight, bearishWeight) / totalWeight : 0;
  if (agreementRatio > 0.6) {
    overallConfidence = Math.min(overallConfidence * 1.3, 1); // 30% boost for high agreement
  }
  
  return {
    ruleResults,
    overallSignal,
    overallConfidence: Math.round(overallConfidence * 100) / 100
  };
}