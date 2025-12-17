import { Worker } from '@temporalio/worker';

async function runWorker() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    taskQueue: 'trading-queue',
  });

  console.log('🚀 Starting worker for trading workflows...');
  console.log('🎯 Task queue: trading-queue');
  
  await worker.run();
}

runWorker().catch((err) => {
  console.error('❌ Worker failed to start', err);
  process.exit(1);
});