export interface TradeDecision {
  ticker: string;
  state: string;
  action: string;
  confidence: number;
  triggeredRules: string[];
  timestamp: string;
}

export function createTradeDecision(input: {
  ticker: string;
  currentState: string;
  action: string;
  ruleResult?: {
    isBullish: boolean;
    triggered: boolean;
    rule: string;
  };
  confidence?: number;
}): TradeDecision {
  return {
    ticker: input.ticker,
    state: input.currentState,
    action: input.action,
    confidence: input.confidence || 0.5,
    triggeredRules: input.ruleResult ? [input.ruleResult.rule] : [],
    timestamp: new Date().toISOString()
  };
}