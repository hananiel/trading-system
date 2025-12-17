import { test, expect, describe } from '@jest/globals';
import * as workflows from '../src/workflows/index';

describe('Workflows Index', () => {
  test('should export tradeWorkflow functions', () => {
    expect(workflows.tradeWorkflow).toBeDefined();
    expect(typeof workflows.tradeWorkflow).toBe('function');
  });

  test('should export universeWorkflow functions', () => {
    expect(workflows.universeWorkflow).toBeDefined();
    expect(typeof workflows.universeWorkflow).toBe('function');
  });

  test('should allow importing trade workflow components', () => {
    const { tradeWorkflow } = workflows;
    
    expect(tradeWorkflow).toBeDefined();
    expect(typeof tradeWorkflow).toBe('function');
  });

  test('should allow importing universe workflow components', () => {
    const { universeWorkflow } = workflows;
    
    expect(universeWorkflow).toBeDefined();
    expect(typeof universeWorkflow).toBe('function');
  });

  test('should allow importing all workflow components', () => {
    const { tradeWorkflow, universeWorkflow } = workflows;
    
    expect(tradeWorkflow).toBeDefined();
    expect(universeWorkflow).toBeDefined();
    expect(typeof tradeWorkflow).toBe('function');
    expect(typeof universeWorkflow).toBe('function');
  });

  test('should allow using trade workflow interfaces', () => {
    type TradeWorkflowInput = { ticker: string };
    type TradeWorkflowOutput = {
      action: string;
      currentState: string;
      decision?: any;
    };
    
    const input: TradeWorkflowInput = { ticker: 'AAPL' };
    const output: TradeWorkflowOutput = {
      action: 'HOLD',
      currentState: 'WAIT'
    };
    
    expect(input.ticker).toBe('AAPL');
    expect(output.action).toBe('HOLD');
  });

  test('should allow using universe workflow interfaces', () => {
    type UniverseWorkflowInput = { tickers: string[] };
    type UniverseWorkflowOutput = { results: string[] };
    
    const input: UniverseWorkflowInput = { tickers: ['AAPL', 'GOOGL'] };
    const output: UniverseWorkflowOutput = { results: ['result1', 'result2'] };
    
    expect(input.tickers).toEqual(['AAPL', 'GOOGL']);
    expect(output.results).toEqual(['result1', 'result2']);
  });
});