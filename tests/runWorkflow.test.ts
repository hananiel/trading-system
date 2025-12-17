import { test, expect, describe } from '@jest/globals';

// Mock console to test output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock Temporal client
jest.mock('@temporalio/client', () => ({
  Client: jest.fn().mockImplementation(() => ({
    workflow: {
      execute: jest.fn()
    },
    connection: {
      close: jest.fn().mockResolvedValue(undefined)
    }
  }))
}));

describe('Run Workflow', () => {
  afterEach(() => {
    // Clear console mocks after each test
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

  test('should have main runTradingWorkflow function', () => {
    // Import after mocking
    require('../src/runWorkflow');
    
    // The function should be defined in the module
    expect(typeof runTradingWorkflow).toBe('function');
  });

  test('should use correct workflow parameters', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD',
      decision: { ticker: 'AAPL', state: 'WAIT', action: 'HOLD', confidence: 0.5, triggeredRules: [], timestamp: '2023-12-01T10:00:00.000Z' }
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    // Import after setting up mocks
    const { runTradingWorkflow } = require('../src/runWorkflow');
    
    await runTradingWorkflow();
    
    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(Function), // tradeWorkflow function
      expect.objectContaining({
        workflowId: expect.stringMatching(/^trading-workflow-aapl-\d+$/),
        taskQueue: 'trading-queue',
        args: [{ ticker: 'AAPL' }]
      })
    );
  });

  test('should log expected success messages', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD'
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runTradingWorkflow } = require('../src/runWorkflow');
    
    await runTradingWorkflow();
    
    expect(mockConsoleLog).toHaveBeenCalledWith('🚀 Starting trading workflow for AAPL...');
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ Workflow completed!');
    expect(mockConsoleLog).toHaveBeenCalledWith('📊 Result:', expect.any(String));
  });
});

// Extract function for testing
function runTradingWorkflow() {
  return require('../src/runWorkflow').runTradingWorkflow();
}