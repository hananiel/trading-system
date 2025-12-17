import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { beforeAll, afterAll, test, expect } from '@jest/globals';
import { tradeWorkflow, TradeWorkflowInput, TradeWorkflowOutput } from '../src/workflows/tradeWorkflow';

let testEnv: TestWorkflowEnvironment;

beforeAll(async () => {
  testEnv = await TestWorkflowEnvironment.createTimeSkipping();
});

afterAll(async () => {
  await testEnv?.teardown();
});

test('tradeWorkflow should complete and return HOLD', async () => {
  const worker = await Worker.create({
    connection: testEnv.nativeConnection,
    taskQueue: 'test',
    workflowsPath: require.resolve('../src/workflows/tradeWorkflow'),
  });

  await worker.runUntil(async () => {
    const workflow = await testEnv.client.workflow.start(tradeWorkflow, {
      workflowId: 'test-trade-workflow',
      taskQueue: 'test',
      args: [{ ticker: 'AAPL' } as TradeWorkflowInput]
    });

    const result = await workflow.result();
    
    expect(result).toBeDefined();
    expect(result.action).toBe('HOLD');
  });
});