import { Worker } from '@temporalio/worker';
import * as ruleActivities from './activities/rules';
import * as csvActivities from './activities/csvOutput';

export async function runWorker() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities: {
      evaluatePriceRuleActivity: ruleActivities.evaluatePriceRuleActivity,
      appendDecisionToCsv: csvActivities.appendDecisionToCsv,
    },
    taskQueue: 'trading-queue',
  });

  console.log('🚀 Starting worker for trading workflows...');
  console.log('🎯 Task queue: trading-queue');
  console.log('📊 Activities loaded');
  
  await worker.run();
}

runWorker().catch((err) => {
  console.error('❌ Worker failed to start', err);
  process.exit(1);
});