export interface MarketData {
  ticker: string;
  price: number;
  movingAverage: number;
  volume: number;
  timestamp: string;
}

export interface MarketDataInput {
  ticker: string;
}

// Simulated market data activity - in real implementation would fetch from API
export async function getMarketDataActivity(input: MarketDataInput): Promise<MarketData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate realistic market data based on ticker
  const basePrices: Record<string, number> = {
    'AAPL': 150,
    'GOOGL': 2800,
    'MSFT': 350,
    'TSLA': 250,
    'AMZN': 3200,
    'META': 200,
    'NVDA': 450
  };
  
  const basePrice = basePrices[input.ticker] || 100;
  const priceVariation = (Math.random() - 0.5) * basePrice * 0.02; // ±1% variation
  const currentPrice = basePrice + priceVariation;
  
  // Generate realistic moving average (trend) 
  const trend = Math.random() > 0.5 ? 1.02 : 0.98; // Slight up or down trend
  const movingAverage = currentPrice * trend;
  
  // Random volume
  const volume = Math.floor(Math.random() * 1000000) + 100000;
  
  return {
    ticker: input.ticker,
    price: Math.round(currentPrice * 100) / 100,
    movingAverage: Math.round(movingAverage * 100) / 100,
    volume,
    timestamp: new Date().toISOString()
  };
}