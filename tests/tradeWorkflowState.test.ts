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
  const worker = await  Worker.create({
    workflowsPath: require.resolve('../src/workflows/tradeWorkflow'),
    activities: require.resolve('../src/activities'),
    taskQueue: 'test',
  });
  const client = testEnv.nativeConnection;

  await worker.runUntil(async () => {
    const workflow = await testEnv.client.workflow.start(tradeWorkflow, {
      workflowId: 'test-trade-workflow-state',
      taskQueue: 'test',
      args: [{ ticker: 'AAPL' } as TradeWorkflowInput]
    });

    const result = await workflow.result();
    
    expect(result).toBeDefined();
    expect(result.currentState).toBe(TradeState.WAIT);
    expect(result.ruleResult).toBeDefined();
  });
});