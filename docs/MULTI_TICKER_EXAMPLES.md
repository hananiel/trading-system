# Multi-Ticker Trading Workflow Examples

## Quick Start

### Default Demo (4 tickers in parallel)
```bash
npm run demo
```

### Custom Tickers
```bash
# Run specific tickers
npm run demo -- --tickers AAPL,MSFT,TSLA

# Run with different options
npm run demo-custom -- --tickers AAPL,GOOGL --sequential --delay 2000
```

## Advanced Usage

### Parallel Execution (Default)
Runs all tickers simultaneously for maximum performance:
```bash
ts-node src/runWorkflow.ts --tickers AAPL,GOOGL,MSFT,TSLA,META
```

### Sequential Execution
Runs tickers one by one with delays between:
```bash
ts-node src/runWorkflow.ts --tickers AAPL,GOOGL,MSFT --sequential --delay 1500
```

### Configuration Options

| Option | Description | Default |
|---------|-------------|----------|
| `--tickers` | Comma-separated list of ticker symbols | AAPL,GOOGL,MSFT,TSLA |
| `--sequential` | Run workflows sequentially (not parallel) | false (parallel) |
| `--delay` | Delay between sequential executions (ms) | 500ms |

## Sample Configurations

### High-Frequency Trading (Parallel)
```typescript
import { runTradingWorkflow } from './src/runWorkflow';

await runTradingWorkflow({
  tickers: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'META', 'NVDA'],
  parallel: true
});
```

### Swing Trading (Sequential with Delay)
```typescript
await runTradingWorkflow({
  tickers: ['AAPL', 'GOOGL', 'MSFT'],
  parallel: false,
  delay: 5000 // 5 seconds between analyses
});
```

### Small Cap Stocks
```typescript
await runTradingWorkflow({
  tickers: ['ROKU', 'PLTR', 'GME', 'AMC'],
  parallel: false,
  delay: 3000
});
```

## Output Examples

### Console Output
```
🎯 Trading Simulation Starting
📋 Tickers: AAPL, GOOGL, MSFT
⚡ Execution mode: Parallel
⏱️  Delay: 500ms

🚀 Starting trading workflow for AAPL...
🚀 Starting trading workflow for GOOGL...
🚀 Starting trading workflow for MSFT...
✅ AAPL workflow completed in 1234ms!
✅ GOOGL workflow completed in 1098ms!
✅ MSFT workflow completed in 1156ms!

📊 Trading Simulation Complete!
✅ Successful: 3/3
❌ Failed: 0/3
⏱️  Total time: 1342ms
📈 Average time per ticker: 447ms

✅ AAPL   - 1234ms
✅ GOOGL   - 1098ms  
✅ MSFT    - 1156ms

🎉 All trading workflows completed successfully!
```

### Result Structure
```typescript
{
  results: [
    {
      ticker: "AAPL",
      success: true,
      result: {
        action: "BUY",
        currentState: "WAIT",
        marketData: { /* pricing data */ },
        analysis: { /* rule analysis */ },
        decision: { /* final decision */ }
      },
      workflowId: "trading-workflow-aapl-1702889234567",
      executionTime: 1234
    }
  ],
  summary: {
    total: 3,
    successful: 3,
    failed: 0,
    totalExecutionTime: 1342
  }
}
```

## Performance Tips

1. **Parallel Execution**: Use for large ticker lists (50+ stocks)
2. **Sequential Execution**: Use when rate limiting is a concern
3. **Delay Tuning**: Adjust based on API rate limits
4. **Batch Processing**: Group tickers by market cap or sector

## Error Handling

The system gracefully handles:
- Individual workflow failures
- Network timeouts
- Invalid ticker symbols
- API rate limiting
- CSV persistence errors

Failed workflows are logged but don't stop the entire simulation.