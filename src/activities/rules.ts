export interface PriceData {
  ticker: string;
  price: number;
  movingAverage: number;
}

export interface RuleResult {
  isBullish: boolean;
  triggered: boolean;
  rule: string;
}

// Real Activity: Price > 50-DMA rule evaluation
export async function evaluatePriceRuleActivity(data: PriceData): Promise<RuleResult> {
  const isBullish = data.price > data.movingAverage;
  
  return {
    isBullish,
    triggered: isBullish, // Only triggered when rule condition is met
    rule: 'price > 50-DMA'
  };
}