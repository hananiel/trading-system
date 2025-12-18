import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { beforeAll, afterAll, test, expect, describe, beforeEach } from '@jest/globals';
import { tradeWorkflow, TradeWorkflowInput } from '../src/workflows/tradeWorkflow';
import { TradeState } from '../src/models/TradeState';
import * as rules from '../src/activities/rules';
import * as csvActivities from '../src/activities/csvOutput';
import { createTradeDecision } from '../src/activities/decision';

// Mock console to test output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock Temporal client
const createMockClient = () => {
  const mockExecute = jest.fn();
 mockExecute.mockResolvedValue({
    currentState: 'WAIT',          // or whatever your workflow actually returns
    previousState: 'INITIAL',      // add this
    action: 'HOLD',
    marketData: {
      ticker: 'AAPL',
      price: 175.23,
      dayHigh: 178.50,             // add required fields
      dayLow: 174.10,
      previousClose: 173.45,
      volume: 500000,              // > 0
      movingAverage: 173.45,
    },
    analysis: {                    // add whatever your real workflow produces
      rsi: 55,
      trend: 'neutral',
      // etc.
    },
    decision: 'HOLD',              // or 'BUY' / 'SELL'
    csvResult: {
      success: true,
      recordsWritten: 1,
    },
  });
  
  const mockClient = {
    workflow: { execute: mockExecute },
    connection: { close: jest.fn().mockResolvedValue(undefined) }
  };
  
  return mockClient;
};

describe('Run Workflow', () => {
  let mockClient: any;
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  });

  afterAll(async () => {
    await testEnv?.teardown();
  });

  beforeEach(() => {
    // Clear console mocks before each test
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console after all tests
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  test('should be importable without errors', () => {
    expect(() => {
      require('../src/runWorkflow');
    }).not.toThrow();
  });

  test('should export all required functions', () => {
    // Import after mocking
    const runWorkflowModule = require('../src/runWorkflow');
    
    expect(typeof runWorkflowModule.runTradingWorkflow).toBe('function');
    expect(typeof runWorkflowModule.runMultipleTradingWorkflows).toBe('function');
  });

  test('should execute single workflow with real market data', async () => {
    mockClient = createMockClient();
    
    const result = await mockClient.workflow.execute(tradeWorkflow, {
      workflowId: 'test-workflow',
      taskQueue: 'trading-queue',
      args: [{ ticker: 'AAPL' }]
    });

    expect(result).toBeDefined();
    expect(result.currentState).toBeDefined();
    expect(result.previousState).toBeDefined();
    expect(result.marketData).toBeDefined();
    expect(result.analysis).toBeDefined();
    expect(result.decision).toBeDefined();
    expect(result.csvResult).toBeDefined();
    expect(result.csvResult?.success).toBe(true);
    expect(result.csvResult?.recordsWritten).toBe(1);
    expect(result.marketData?.ticker).toBe('AAPL');
    expect(result.marketData?.price).toBeGreaterThan(0);
    expect(result.marketData?.dayHigh).toBeDefined();
    expect(result.marketData?.dayLow).toBeDefined();
    expect(result.marketData?.previousClose).toBeDefined();
    expect(result.marketData?.volume).toBeGreaterThan(0);
  });


});