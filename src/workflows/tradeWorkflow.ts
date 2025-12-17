import * as workflow from '@temporalio/workflow';
import { TradeState } from '../models/TradeState';
import { getMarketDataActivity } from '../activities/marketData';
import { evaluateMultipleRulesActivity } from '../activities/rules';
import { createTradeDecision } from '../activities/decision';
import { appendDecisionToCsv } from '../activities/csvOutput';

export interface TradeWorkflowInput {
  ticker: string;
}

export interface TradeWorkflowOutput {
  action: string;
  currentState: TradeState;
  previousState: TradeState;
  marketData?: {
    ticker: string;
    price: number;
    movingAverage: number;
    volume: number;
    timestamp: string;
    dayHigh?: number;
    dayLow?: number;
    previousClose?: number;
  };
  analysis?: {
    ruleResults: Array<{
      isBullish: boolean;
      triggered: boolean;
      rule: string;
      confidence?: number;
    }>;
    overallSignal: 'BUY' | 'SELL' | 'HOLD';
    overallConfidence: number;
  };
  decision?: {
    ticker: string;
    state: string;
    action: string;
    confidence: number;
    triggeredRules: string[];
    timestamp: string;
  };
  csvResult?: {
    success: boolean;
    filePath: string;
    recordsWritten: number;
    error?: string;
  };
}

// Workflow state that persists across executions
let workflowState: {
  currentState: TradeState;
  previousState: TradeState;
  executionCount: number;
} = {
  currentState: TradeState.WAIT,
  previousState: TradeState.WAIT,
  executionCount: 0
};

// State transition logic
function determineNextState(
  currentState: TradeState, 
  signal: 'BUY' | 'SELL' | 'HOLD'
): { newState: TradeState; action: string } {
  switch (currentState) {
    case TradeState.WAIT:
      if (signal === 'BUY') {
        return { newState: TradeState.ARMED, action: 'ARM_FOR_BUY' };
      } else if (signal === 'SELL') {
        return { newState: TradeState.ARMED, action: 'ARM_FOR_SELL' };
      } else {
        return { newState: TradeState.WAIT, action: 'WAIT' };
      }
      
    case TradeState.ARMED:
      if (signal === 'BUY') {
        return { newState: TradeState.ENTER, action: 'BUY' };
      } else if (signal === 'SELL') {
        return { newState: TradeState.ENTER, action: 'SELL' };
      } else {
        return { newState: TradeState.WAIT, action: 'DISARM' };
      }
      
    case TradeState.ENTER:
      // Always go back to WAIT after entering position
      return { newState: TradeState.WAIT, action: 'POSITION_ENTERED' };
      
    default:
      return { newState: TradeState.WAIT, action: 'RESET_TO_WAIT' };
  }
}

export async function tradeWorkflow(input: TradeWorkflowInput): Promise<TradeWorkflowOutput> {
  workflowState.executionCount++;
  
  // Get current market data
  const marketData = await workflow.proxyActivities({
    startToCloseTimeout: '1 minute',
  }).getMarketDataActivity({ ticker: input.ticker });
  
  // Evaluate multiple trading rules
  const analysis = await workflow.proxyActivities({
    startToCloseTimeout: '1 minute',
  }).evaluateMultipleRulesActivity(marketData);
  
  // Determine state transition and action
  const previousState = workflowState.currentState;
  const { newState, action } = determineNextState(
    workflowState.currentState, 
    analysis.overallSignal
  );
  
  // Update workflow state
  workflowState.previousState = previousState;
  workflowState.currentState = newState;
  
  // Create trade decision
  const decision = createTradeDecision({
    ticker: input.ticker,
    currentState: previousState,
    action: action,
    confidence: analysis.overallConfidence,
    ruleResult: analysis.ruleResults[0] // Primary rule for CSV compatibility
  });
  
  // Persist decision to CSV
  const csvResult = await workflow.proxyActivities({
    startToCloseTimeout: '1 minute',
  }).appendDecisionToCsv(decision);
  
  return {
    action,
    currentState: workflowState.currentState,
    previousState,
    marketData,
    analysis,
    decision,
    csvResult
  };
}