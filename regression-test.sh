#!/bin/bash

echo "🧪 Running Regression Tests"
echo "=========================="
echo ""

# Run unit tests
echo "📋 Running unit tests..."
if npm test; then
    echo "✅ Unit tests passed!"
else
    echo "❌ Unit tests failed!"
    exit 1
fi

echo ""

# Run integration demo
echo "🚀 Running integration demo..."
echo "Starting worker in background..."
timeout 30 npm run worker &
WORKER_PID=$!
echo "Worker PID: $WORKER_PID"

# Wait for worker to start
sleep 3

echo "Running workflow..."
if npm run run-workflow; then
    echo "✅ Integration demo passed!"
else
    echo "❌ Integration demo failed!"
    kill $WORKER_PID 2>/dev/null
    exit 1
fi

# Clean up worker
kill $WORKER_PID 2>/dev/null

echo ""
echo "🎉 All regression tests passed!"
echo "✅ Safe to commit!"