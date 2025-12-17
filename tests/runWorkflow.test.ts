import { test, expect, describe } from '@jest/globals';

// Mock console to test output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock Temporal client
jest.mock('@temporalio/client', () => ({
  Client: jest.fn().mockImplementation(() => ({
    workflow: {
      execute: jest.fn().mockResolvedValue({
        currentState: 'WAIT',
        action: 'HOLD'
      })
    },
    connection: {
      close: jest.fn().mockResolvedValue(undefined)
    }
  }))
}));

describe('Run Workflow', () => {
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
    expect(typeof runWorkflowModule.runSingleTradingWorkflow).toBe('function');
    expect(typeof runWorkflowModule.runMultipleTradingWorkflows).toBe('function');
  });

  test('should use correct workflow parameters for single execution', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD'
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runSingleTradingWorkflow } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    await runSingleTradingWorkflow('AAPL', mockClient);
    
    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(Function), // tradeWorkflow function
      expect.objectContaining({
        workflowId: expect.stringMatching(/^trading-workflow-aapl-\d+$/),
        taskQueue: 'trading-queue',
        args: [{ ticker: 'AAPL' }]
      })
    );
  });

  test('should handle multiple workflows in parallel', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD'
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    await runMultipleTradingWorkflows({
      tickers: ['AAPL', 'GOOGL'],
      parallel: true
    });
    
    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        taskQueue: 'trading-queue',
        args: [{ ticker: 'AAPL' }]
      })
    );
    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        taskQueue: 'trading-queue',
        args: [{ ticker: 'GOOGL' }]
      })
    );
  });

  test('should handle multiple workflows sequentially', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD'
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    await runMultipleTradingWorkflows({
      tickers: ['AAPL', 'GOOGL'],
      parallel: false,
      delay: 0 // No delay for test
    });
    
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  test('should return proper result structure', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn()
      .mockResolvedValueOnce({ currentState: 'WAIT', action: 'HOLD' })
      .mockResolvedValueOnce({ currentState: 'ARMED', action: 'BUY' });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    const result = await runMultipleTradingWorkflows({
      tickers: ['AAPL', 'GOOGL'],
      parallel: true
    });
    
    expect(result).toBeDefined();
    expect(result.results).toHaveLength(2);
    expect(result.summary).toBeDefined();
    expect(result.summary.total).toBe(2);
    expect(result.summary.successful).toBe(2);
    expect(result.summary.failed).toBe(0);
    expect(result.results[0]).toMatchObject({
      ticker: 'AAPL',
      success: true,
      executionTime: expect.any(Number)
    });
  });

  test('should handle workflow failures gracefully', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn()
      .mockResolvedValueOnce({ currentState: 'WAIT', action: 'HOLD' })
      .mockRejectedValueOnce(new Error('Workflow failed'));
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    const result = await runMultipleTradingWorkflows({
      tickers: ['AAPL', 'GOOGL'],
      parallel: true
    });
    
    expect(result.results).toHaveLength(2);
    expect(result.summary.successful).toBe(1);
    expect(result.summary.failed).toBe(1);
    expect(result.results[1].success).toBe(false);
    expect(result.results[1].error).toBeDefined();
  });

  test('should log expected messages for multiple workflows', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD'
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    await runMultipleTradingWorkflows({
      tickers: ['AAPL'],
      parallel: true
    });
    
    expect(mockConsoleLog).toHaveBeenCalledWith('🎯 Trading Simulation Starting');
    expect(mockConsoleLog).toHaveBeenCalledWith('📋 Tickers: AAPL');
    expect(mockConsoleLog).toHaveBeenCalledWith('⚡ Execution mode: Parallel');
    expect(mockConsoleLog).toHaveBeenCalledWith('📊 Trading Simulation Complete!');
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ Successful: 1/1');
  });
});

describe('Run Workflow', () => {
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
    expect(typeof runWorkflowModule.runSingleTradingWorkflow).toBe('function');
    expect(typeof runWorkflowModule.runMultipleTradingWorkflows).toBe('function');
  });

  test('should use correct workflow parameters for single execution', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD'
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runSingleTradingWorkflow } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    await runSingleTradingWorkflow('AAPL', mockClient);
    
    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(Function), // tradeWorkflow function
      expect.objectContaining({
        workflowId: expect.stringMatching(/^trading-workflow-aapl-\d+$/),
        taskQueue: 'trading-queue',
        args: [{ ticker: 'AAPL' }]
      })
    );
  });

  test('should handle multiple workflows in parallel', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD'
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    await runMultipleTradingWorkflows({
      tickers: ['AAPL', 'GOOGL'],
      parallel: true
    });
    
    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        taskQueue: 'trading-queue',
        args: [{ ticker: 'AAPL' }]
      })
    );
    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        taskQueue: 'trading-queue',
        args: [{ ticker: 'GOOGL' }]
      })
    );
  });

  test('should handle multiple workflows sequentially', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD'
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    await runMultipleTradingWorkflows({
      tickers: ['AAPL', 'GOOGL'],
      parallel: false,
      delay: 0 // No delay for test
    });
    
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  test('should return proper result structure', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn()
      .mockResolvedValueOnce({ currentState: 'WAIT', action: 'HOLD' })
      .mockResolvedValueOnce({ currentState: 'ARMED', action: 'BUY' });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    const result = await runMultipleTradingWorkflows({
      tickers: ['AAPL', 'GOOGL'],
      parallel: true
    });
    
    expect(result).toBeDefined();
    expect(result.results).toHaveLength(2);
    expect(result.summary).toBeDefined();
    expect(result.summary.total).toBe(2);
    expect(result.summary.successful).toBe(2);
    expect(result.summary.failed).toBe(0);
    expect(result.results[0]).toMatchObject({
      ticker: 'AAPL',
      success: true,
      executionTime: expect.any(Number)
    });
  });

  test('should handle workflow failures gracefully', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn()
      .mockResolvedValueOnce({ currentState: 'WAIT', action: 'HOLD' })
      .mockRejectedValueOnce(new Error('Workflow failed'));
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    const result = await runMultipleTradingWorkflows({
      tickers: ['AAPL', 'GOOGL'],
      parallel: true
    });
    
    expect(result.results).toHaveLength(2);
    expect(result.summary.successful).toBe(1);
    expect(result.summary.failed).toBe(1);
    expect(result.results[1].success).toBe(false);
    expect(result.results[1].error).toBeDefined();
  });

  test('should log expected messages for multiple workflows', async () => {
    const { Client } = require('@temporalio/client');
    const mockExecute = jest.fn().mockResolvedValue({
      currentState: 'WAIT',
      action: 'HOLD'
    });
    
    Client.mockImplementation(() => ({
      workflow: { execute: mockExecute },
      connection: { close: jest.fn().mockResolvedValue(undefined) }
    }));

    const { runMultipleTradingWorkflows } = require('../src/runWorkflow');
    const mockClient = new (Client as any)();
    
    await runMultipleTradingWorkflows({
      tickers: ['AAPL'],
      parallel: true
    });
    
    expect(mockConsoleLog).toHaveBeenCalledWith('🎯 Trading Simulation Starting');
    expect(mockConsoleLog).toHaveBeenCalledWith('📋 Tickers: AAPL');
    expect(mockConsoleLog).toHaveBeenCalledWith('⚡ Execution mode: Parallel');
    expect(mockConsoleLog).toHaveBeenCalledWith('📊 Trading Simulation Complete!');
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ Successful: 1/1');
  });
});