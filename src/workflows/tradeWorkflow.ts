import * as workflow from '@temporalio/workflow';
import { TradeState } from '../models/TradeState';
import { evaluatePriceRuleActivity } from '../activities/rules';
import { createTradeDecision } from '../activities/decision';

export interface TradeWorkflowInput {
  ticker: string;
}

export interface TradeWorkflowOutput {
  action: string;
  currentState: TradeState;
  ruleResult?: {
    isBullish: boolean;
    triggered: boolean;
    rule: string;
  };
  decision?: {
    ticker: string;
    state: string;
    action: string;
    confidence: number;
    triggeredRules: string[];
    timestamp: string;
  };
}

// Persistent workflow state
let currentState: TradeState = TradeState.WAIT;

export async function tradeWorkflow(input: TradeWorkflowInput): Promise<TradeWorkflowOutput> {
  // Initialize state if first run
  if (!currentState) {
    currentState = TradeState.WAIT;
  }
  
  // Dummy market data for testing - in future will come from activities
  const dummyMarketData = {
    ticker: input.ticker,
    price: 145,
    movingAverage: 140
  };

  // Evaluate rule using activity
  const ruleResult = await workflow.proxyActivities({
    startToCloseTimeout: '1 minute',
  }).evaluatePriceRuleActivity(dummyMarketData);
  
  // Create trade decision based on rule result
  const decision = createTradeDecision({
    ticker: input.ticker,
    currentState,
    action: 'HOLD',
    ruleResult
  });
  
  return {
    action: 'HOLD',
    currentState,
    ruleResult,
    decision
  };
}