# Trading System

Temporal-based staged trading workflow (TypeScript)

## Features Implemented

### ✅ Feature 1: Dummy Trade Workflow
- Minimal Temporal workflow that runs and returns placeholder decision
- Input: `ticker: string`
- Output: `{ action: "HOLD", currentState: TradeState.WAIT }`
- Deterministic and testable implementation

### ✅ Feature 2: Workflow State Machine  
- Trade state enum: `WAIT | ARMED | ENTER`
- State persistence across workflow runs
- Foundation for future state transitions

## Development Workflow

### Running Tests
```bash
npm test
```

### Running Demo
Requires two separate terminals:

**Terminal 1 (Worker):**
```bash
cd /home/hananiel/projects/trading-system && timeout 30 npm run worker
```

**Terminal 2 (Workflow):**
```bash
cd /home/hananiel/projects/trading-system && npm run run-workflow
```

### Regression Testing
Before any commit, ensure both tests and demo pass:
```bash
npm test && (cd /home/hananiel/projects/trading-system && timeout 30 npm run worker &) && sleep 3 && npm run run-workflow
```

## Architecture

- **Workflows**: Deterministic orchestration logic
- **Models**: Type definitions for data structures  
- **Tests**: Jest with Temporal testing utilities
- **Infrastructure**: Docker Compose with Temporal

## Temporal Services

- **Server**: http://localhost:7233
- **UI**: http://localhost:8233

## Tech Stack

- **Temporal**: Workflow orchestration
- **TypeScript**: Type-safe development
- **Jest**: Testing framework
- **Docker**: Infrastructure management
- **Node.js**: Runtime environment

## Development Rules

1. **TDD First**: Write failing test before implementation
2. **Deterministic Workflows**: All non-deterministic logic in activities
3. **No Regression**: Tests + demo must pass before commits
4. **One Feature at a Time**: Build incrementally