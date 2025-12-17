import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { beforeAll, afterAll, test, expect } from '@jest/globals';
import { tradeWorkflow, TradeWorkflowInput } from '../src/workflows/tradeWorkflow';
import { TradeState } from '../src/models/TradeState';
import * as rules from '../src/activities/rules';
import * as marketActivities from '../src/activities/marketData';
import * as csvActivities from '../src/activities/csvOutput';

let testEnv: TestWorkflowEnvironment;

beforeAll(async () => {
  testEnv = await TestWorkflowEnvironment.createTimeSkipping();
});

afterAll(async () => {
  await testEnv?.teardown();
});

test('tradeWorkflow should start in WAIT state', async () => {
  const worker = await  Worker.create({
    connection: testEnv.nativeConnection,
    workflowsPath: require.resolve('../src/workflows/tradeWorkflow'),
    activities: { ...rules, ...marketActivities, ...csvActivities },
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
    expect(TradeState.WAIT).toBeDefined();
    expect(result.currentState).toBeDefined();
    expect(result.previousState).toBeDefined();
    expect(result.marketData).toBeDefined();
    expect(result.analysis).toBeDefined();
    expect(result.decision).toBeDefined();
    expect(result.csvResult).toBeDefined();
    expect(result.csvResult?.success).toBe(true);
    expect(result.csvResult?.recordsWritten).toBe(1);
    expect(result.marketData?.ticker).toBe('AAPL');
    expect(result.analysis?.overallSignal).toBeDefined();
    expect(['BUY', 'SELL', 'HOLD']).toContain(result.analysis?.overallSignal);
  });
});