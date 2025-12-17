import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { beforeAll, afterAll, test, expect } from '@jest/globals';
import { tradeWorkflow, TradeWorkflowInput } from '../src/workflows/tradeWorkflow';
import { TradeState } from '../src/models/TradeState';

let testEnv: TestWorkflowEnvironment;

beforeAll(async () => {
  testEnv = await TestWorkflowEnvironment.createTimeSkipping();
});

afterAll(async () => {
  await testEnv?.teardown();
});

test('tradeWorkflow should start in WAIT state', async () => {
  const worker = await Worker.create({
    connection: testEnv.nativeConnection,
    taskQueue: 'test',
    workflowsPath: require.resolve('../src/workflows/tradeWorkflow'),
  });

  await worker.runUntil(async () => {
    const workflow = await testEnv.client.workflow.start(tradeWorkflow, {
      workflowId: 'test-trade-workflow-state',
      taskQueue: 'test',
      args: [{ ticker: 'AAPL' } as TradeWorkflowInput]
    });

    const result = await workflow.result();
    
    expect(result).toBeDefined();
    expect(result.currentState).toBe(TradeState.WAIT);
  });
});

test('tradeWorkflow should persist state across workflow runs', async () => {
  const worker = await Worker.create({
    connection: testEnv.nativeConnection,
    taskQueue: 'test',
    workflowsPath: require.resolve('../src/workflows/tradeWorkflow'),
  });

  await worker.runUntil(async () => {
    // First workflow execution
    const workflow1 = await testEnv.client.workflow.start(tradeWorkflow, {
      workflowId: 'test-trade-workflow-persistence',
      taskQueue: 'test',
      args: [{ ticker: 'AAPL' } as TradeWorkflowInput]
    });

    const result1 = await workflow1.result();
    expect(result1.currentState).toBe(TradeState.WAIT);

    // Second workflow execution with same ID should maintain state
    const workflow2 = await testEnv.client.workflow.start(tradeWorkflow, {
      workflowId: 'test-trade-workflow-persistence',
      taskQueue: 'test',
      args: [{ ticker: 'AAPL' } as TradeWorkflowInput]
    });

    const result2 = await workflow2.result();
    expect(result2.currentState).toBe(TradeState.WAIT);
  });
});