import { Client } from '@temporalio/client';
import { tradeWorkflow } from './workflows/tradeWorkflow';

export interface TradingWorkflowConfig {
  tickers: string[];
  parallel?: boolean;
  delay?: number; // Delay between workflow executions in ms
}

export interface MultiTradingResult {
  results: Array<{
    ticker: string;
    success: boolean;
    result?: any;
    error?: string;
    workflowId: string;
    executionTime: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalExecutionTime: number;
  };
}

export async function runSingleTradingWorkflow(ticker: string, client: Client): Promise<{
  ticker: string;
  success: boolean;
  result?: any;
  error?: string;
  workflowId: string;
  executionTime: number;
}> {
  const startTime = Date.now();
  const workflowId = `trading-workflow-${ticker.toLowerCase()}-${startTime}`;
  
  try {
    console.log(`🚀 Starting trading workflow for ${ticker}...`);
    
    const result = await client.workflow.execute(tradeWorkflow, {
      workflowId,
      taskQueue: 'trading-queue',
      args: [{ ticker }],
    });

    const executionTime = Date.now() - startTime;
    console.log(`✅ ${ticker} workflow completed in ${executionTime}ms!`);
    
    return {
      ticker,
      success: true,
      result,
      workflowId,
      executionTime
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ ${ticker} workflow failed:`, error);
    
    return {
      ticker,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      workflowId,
      executionTime
    };
  }
}

export async function runMultipleTradingWorkflows(config: TradingWorkflowConfig): Promise<MultiTradingResult> {
  const client = new Client();
  const { tickers, parallel = true, delay = 100 } = config;
  
  try {
    console.log(`\n🎯 Trading Simulation Starting`);
    console.log(`📋 Tickers: ${tickers.join(', ')}`);
    console.log(`⚡ Execution mode: ${parallel ? 'Parallel' : 'Sequential'}`);
    console.log(`⏱️  Delay: ${delay}ms\n`);

    const startTime = Date.now();
    let results: MultiTradingResult['results'] = [];

    if (parallel) {
      // Run all workflows in parallel
      const promises = tickers.map(ticker => runSingleTradingWorkflow(ticker, client));
      results = await Promise.all(promises);
    } else {
      // Run workflows sequentially with delay
      for (const ticker of tickers) {
        const result = await runSingleTradingWorkflow(ticker, client);
        results.push(result);
        
        // Add delay between executions (except for last one)
        if (ticker !== tickers[tickers.length - 1]) {
          console.log(`⏳ Waiting ${delay}ms before next workflow...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const totalExecutionTime = Date.now() - startTime;
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    const summary = {
      total: results.length,
      successful,
      failed,
      totalExecutionTime
    };

    console.log(`\n📊 Trading Simulation Complete!`);
    console.log(`✅ Successful: ${successful}/${results.length}`);
    console.log(`❌ Failed: ${failed}/${results.length}`);
    console.log(`⏱️  Total time: ${totalExecutionTime}ms`);
    console.log(`📈 Average time per ticker: ${Math.round(totalExecutionTime / results.length)}ms\n`);

    // Print individual results
    results.forEach(({ ticker, success, executionTime, error }) => {
      const status = success ? '✅' : '❌';
      const timeInfo = `${executionTime}ms`;
      const errorInfo = error ? ` (${error})` : '';
      console.log(`${status} ${ticker.padEnd(6)} - ${timeInfo.padStart(8)}${errorInfo}`);
    });

    return { results, summary };

  } finally {
    await client.connection.close();
  }
}

// Default configuration for demo
export async function runTradingWorkflow(config?: Partial<TradingWorkflowConfig>): Promise<void> {
  const defaultTickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
  const finalConfig: TradingWorkflowConfig = {
    tickers: defaultTickers,
    parallel: true,
    delay: 500,
    ...config
  };

  try {
    const result = await runMultipleTradingWorkflows(finalConfig);
    console.log('\n🎉 All trading workflows completed successfully!');
    
    // Optional: Save results to a summary file
    const summaryData = {
      timestamp: new Date().toISOString(),
      config: finalConfig,
      results: result.results,
      summary: result.summary
    };
    
    console.log('📄 Summary data ready for persistence');
    // In a real implementation, you might save this to a file or database
    
  } catch (error) {
    console.error('💥 Trading simulation failed:', error);
    process.exit(1);
  }
}

// Run with default configuration if called directly
if (require.main === module) {
  // Check command line arguments for custom configuration
  const args = process.argv.slice(2);
  const config: Partial<TradingWorkflowConfig> = {};
  
  if (args.includes('--sequential')) {
    config.parallel = false;
  }
  
  if (args.includes('--delay')) {
    const delayIndex = args.indexOf('--delay') + 1;
    if (delayIndex < args.length) {
      config.delay = parseInt(args[delayIndex]);
    }
  }
  
  if (args.includes('--tickers')) {
    const tickersIndex = args.indexOf('--tickers') + 1;
    if (tickersIndex < args.length) {
      config.tickers = args[tickersIndex].split(',');
    }
  }
  
  runTradingWorkflow(config);
}