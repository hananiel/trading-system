# Trading System

Temporal-based advanced trading workflow with real-time market data integration

## Features

### 📊 Real-Time Market Data Integration
- **Yahoo Finance API Integration**: Fetches live market data for real trading decisions
- **Enhanced Market Data**: Price, volume, day high/low, moving averages, bid/ask, market cap
- **Robust Fallback System**: Automatic fallback to simulated data when API unavailable
- **Multi-Ticker Support**: Parallel data fetching for multiple symbols

### 🧠 Advanced Trading Rules Engine
- **4 Sophisticated Rules**: Price action, volume analysis, momentum detection, trend analysis
- **Weighted Voting System**: Consensus-based decisions with confidence scoring
- **Dynamic Thresholds**: Rule parameters adapt to market conditions
- **Rule Confidence Metrics**: Each rule provides probability-based scoring

### 🔄 Multi-Workflow Execution
- **Parallel Processing**: Execute multiple trading workflows simultaneously
- **Sequential Mode**: Configurable delays between executions
- **Performance Tracking**: Execution time metrics and success rates
- **Error Resilience**: Individual workflow failures don't affect others

### 💾 Data Export & Persistence
- **CSV Export**: Automatic logging of trading decisions with timestamps
- **Structured Output**: Complete trade analysis with rule results
- **Historical Analysis**: Track decision patterns and outcomes
- **Performance Metrics**: Win rates, profit/loss tracking ready

### ⚡ Production-Ready Architecture
- **Temporal Workflows**: Reliable, scalable workflow orchestration
- **Activity-Based Design**: Non-deterministic operations isolated
- **TypeScript Safety**: Full type coverage and validation
- **Comprehensive Testing**: 63 passing tests with edge case coverage

## Supported Tickers

- **Major Tech Stocks**: AAPL, GOOGL, MSFT, TSLA, AMZN, META, NVDA
- **Dynamic Volume Analysis**: Automatic volume baseline calculation per ticker
- **Custom Tickers**: Support for any valid market symbol

## Quick Start

### Prerequisites
- Node.js and npm
- Docker and Docker Compose
- Temporal server (via Docker)

### Installation
```bash
cd /home/hananiel/projects/trading-system
npm install
```

### Development Services
Start Temporal infrastructure:
```bash
npm run start-temporal
```

### Running Tests
```bash
npm test
```

### Demo Execution

**Single Ticker:**
```bash
npm run demo
```

**Multiple Tickers (Parallel):**
```bash
npm run demo-parallel
```

**Sequential Execution with Delays:**
```bash
npm run demo-sequential
```

**Custom Configuration:**
```bash
npm run demo-custom
```

## Architecture

### Workflow States
- **WAIT**: Initial state, monitoring market
- **ANALYZE**: Processing market data through rules engine
- **DECIDE**: Final trading decision based on rule consensus
- **EXECUTE**: Trade execution (simulated)
- **HOLD**: Maintain current position

### Rule Engine Logic
1. **Price Rule**: Detects breakouts above/below moving averages
2. **Volume Rule**: Identifies unusual volume patterns
3. **Momentum Rule**: Calculates price momentum indicators
4. **Trend Rule**: Analyzes longer-term price trends

### Decision Matrix
- **BUY Signal**: ≥3 bullish rules OR high confidence consensus
- **SELL Signal**: ≥3 bearish rules OR strong negative momentum
- **HOLD Signal**: Mixed signals or insufficient confidence

## Configuration

### Environment Variables
```bash
# Market data source (yahoo-finance/simulated)
MARKET_DATA_SOURCE=yahoo-finance

# Default execution mode (parallel/sequential)
DEFAULT_EXECUTION_MODE=parallel

# Workflow timeout in milliseconds
WORKFLOW_TIMEOUT=30000
```

### Trading Parameters
- **Moving Average Period**: 50 days (configurable)
- **Volume Thresholds**: Dynamic per ticker
- **Confidence Thresholds**: Rule-dependent
- **Execution Delays**: Configurable for sequential mode

## Monitoring & Debugging

### Temporal Web UI
- **Server**: http://localhost:7233
- **Workflows**: View workflow execution history
- **Activities**: Debug individual activity runs
- **Metrics**: Performance and error tracking

### Logging
- **Verbose Market Data**: Real-time API responses and fallbacks
- **Rule Analysis**: Detailed rule evaluation results
- **Decision Tracking**: Complete audit trail of trading decisions
- **Performance Metrics**: Execution timing and success rates

## Tech Stack

- **Temporal.io**: Workflow orchestration and state management
- **Yahoo Finance API**: Real-time market data provider
- **TypeScript**: Type-safe development with comprehensive coverage
- **Jest**: Testing framework with Temporal integration
- **Node.js**: Runtime environment with async/await
- **Docker**: Infrastructure and service management

## Production Considerations

### Scalability
- **Horizontal Scaling**: Multiple worker instances supported
- **Load Balancing**: Temporal handles workflow distribution
- **Rate Limiting**: Built-in API request throttling
- **Resource Management**: Efficient memory and CPU usage

### Reliability
- **Circuit Breakers**: Automatic fallback on API failures
- **Retry Logic**: Exponential backoff for transient errors
- **State Persistence**: Workflow state survives restarts
- **Error Handling**: Comprehensive error categorization

### Security
- **API Key Management**: Environment-based configuration
- **Input Validation**: Type-safe parameter handling
- **Error Sanitization**: No sensitive data leakage
- **Audit Logging**: Complete transaction trail