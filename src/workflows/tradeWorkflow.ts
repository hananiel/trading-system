import * as workflow from '@temporalio/workflow';
import { TradeState } from '../models/TradeState';

export interface TradeWorkflowInput {
  ticker: string;
}

export interface TradeWorkflowOutput {
  action: string;
  currentState: TradeState;
}

// Persistent workflow state
let currentState: TradeState = TradeState.WAIT;

export async function tradeWorkflow(input: TradeWorkflowInput): Promise<TradeWorkflowOutput> {
  // Initialize state if first run
  if (!currentState) {
    currentState = TradeState.WAIT;
  }
  
  // No state transitions in this feature - always stays in WAIT
  // State is persisted across workflow runs by Temporal
  
  return {
    action: 'HOLD',
    currentState
  };
}