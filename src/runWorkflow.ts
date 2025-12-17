import { Client } from '@temporalio/client';
import { tradeWorkflow } from './workflows/tradeWorkflow';

async function runTradingWorkflow() {
  const client = new Client();

  try {
    console.log('🚀 Starting trading workflow for AAPL...');
    
    const result = await client.workflow.execute(tradeWorkflow, {
      workflowId: `trading-workflow-aapl-${Date.now()}`,
      taskQueue: 'trading-queue',
      args: [{ ticker: 'AAPL' }],
    });

    console.log('✅ Workflow completed!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Workflow failed:', error);
    throw error;
  } finally {
    await client.connection.close();
  }
}

runTradingWorkflow()
  .then(() => console.log('🎉 Demo completed successfully!'))
  .catch((err) => console.error('💥 Demo failed:', err));