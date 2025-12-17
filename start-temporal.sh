#!/bin/bash

echo "🚀 Starting Temporal Trading System Demo"
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Temporal services
echo "📦 Starting Temporal services..."
docker-compose up -d

# Wait for Temporal to be ready
echo "⏳ Waiting for Temporal to be ready..."
sleep 10

# Check if Temporal is responsive
echo "🔍 Checking Temporal connection..."
if curl -s http://localhost:7233 > /dev/null; then
    echo "✅ Temporal server is ready!"
else
    echo "❌ Temporal server is not responding. Please check the logs."
    docker-compose logs temporal
    exit 1
fi

# Check UI
if curl -s http://localhost:8233 > /dev/null; then
    echo "✅ Temporal UI is ready!"
else
    echo "❌ Temporal UI is not responding."
    exit 1
fi

echo ""
echo "🎯 Temporal Services Started:"
echo "   - Temporal Server: http://localhost:7233"
echo "   - Temporal UI: http://localhost:8233 ✨"
echo ""
echo "💡 To run the trading workflow:"
echo "   1. Start the worker: npm run worker"
echo "   2. Run workflow: npm run run-workflow"
echo ""
echo "🖥️  Open Temporal UI in your browser to see workflows!"
echo "🛑 To stop everything: docker-compose down"