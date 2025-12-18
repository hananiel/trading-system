import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey', 'ripHistorical']
});

export interface MarketData {
  ticker: string;
  price: number;
  movingAverage: number;
  volume: number;
  timestamp: string;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
}

export interface MarketDataInput {
  ticker: string;
}

// Real market data activity using Yahoo Finance API
export async function getMarketDataActivity(input: MarketDataInput): Promise<MarketData> {
  try {
    console.log(`📊 Fetching real market data for ${input.ticker}...`);
    
    // Fetch current and historical data from Yahoo Finance
    const [currentQuote, historicalData] = await Promise.all([
      getCurrentQuote(input.ticker),
      getHistoricalData(input.ticker, 50) // 50 days for moving average
    ]);
    
    if (!currentQuote || !historicalData) {
      throw new Error(`Failed to fetch market data for ${input.ticker}`);
    }
    
    // Calculate 50-day moving average from historical data
    const movingAverage = calculateMovingAverage(historicalData, 50);
    
    // Get volume from current quote or historical
    const volume = currentQuote.volume || getAverageVolume(historicalData, 30);
    
    const marketData: MarketData = {
      ticker: input.ticker,
      price: currentQuote.price,
      dayHigh: currentQuote.dayHigh || currentQuote.price,
      dayLow: currentQuote.dayLow || currentQuote.price,
      previousClose: currentQuote.previousClose || currentQuote.price,
      movingAverage: Math.round(movingAverage * 100) / 100,
      volume: volume,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Real data fetched for ${input.ticker}: $${marketData.price.toFixed(2)} (MA50: $${marketData.movingAverage.toFixed(2)})`);
    
    return marketData;
    
  } catch (error) {
    console.error(`❌ Failed to fetch real market data for ${input.ticker}:`, error);
    
    // Fallback to simulated data if API fails
    console.warn(`⚠️ Using fallback simulated data for ${input.ticker}`);
    return getSimulatedMarketData(input.ticker);
  }
}

async function getCurrentQuote(ticker: string): Promise<{
  price: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  volume: number;
  ask?: number;
  bid?: number;
  marketCap?: number;
} | null> {
  try {
    const result = await yahooFinance.quote(ticker);
    
    if (!result) {
      return null;
    }
    
    const quote = result as any;
    return {
      price: quote.regularMarketPrice || 0,
      dayHigh: quote.regularMarketDayHigh || 0,
      dayLow: quote.regularMarketDayLow || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      volume: quote.regularMarketVolume || 0,
      ask: quote.regularMarketAsk || 0,
      bid: quote.regularMarketBid || 0,
      marketCap: quote.marketCap || 0
    };
  } catch (error) {
    console.error(`Error fetching current quote for ${ticker}:`, error);
    return null;
  }
}

async function getHistoricalData(ticker: string, days: number): Promise<Array<{
  close: number;
  volume?: number;
}>> {
  try {
    // Calculate date range for historical data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const result = await yahooFinance.historical(ticker, {
      period1: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      period2: endDate.toISOString().split('T')[0],
      interval: '1d'
    }) as any[];
    
    if (!result || result.length === 0) {
      throw new Error(`No historical data for ${ticker}`);
    }
    
    return result.map((quote: any) => ({
      close: quote.close,
      volume: quote.volume
    }));
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    throw error;
  }
}

function calculateMovingAverage(historicalData: Array<{ close: number }>, period: number): number {
  if (historicalData.length < period) {
    return historicalData[historicalData.length - 1].close;
  }
  
  const relevantData = historicalData.slice(-period);
  const sum = relevantData.reduce((acc, item) => acc + item.close, 0);
  return sum / period;
}

function getAverageVolume(historicalData: Array<{ close: number; volume?: number }>, days: number): number {
  const relevantData = historicalData.slice(-days);
  const volumeData = relevantData.filter(item => item.volume && item.volume > 0);
  
  if (volumeData.length === 0) {
    return 1000000; // Fallback average
  }
  
  const totalVolume = volumeData.reduce((acc, item) => acc + (item.volume || 0), 0);
  return Math.round(totalVolume / volumeData.length);
}

// Fallback function for simulated data (same as original implementation)
function getSimulatedMarketData(ticker: string): MarketData {
  const basePrices: Record<string, number> = {
    'AAPL': 150,
    'GOOGL': 2800,
    'MSFT': 350,
    'TSLA': 250,
    'AMZN': 3200,
    'META': 200,
    'NVDA': 450
  };
  
  const basePrice = basePrices[ticker] || 100;
  const priceVariation = (Math.random() - 0.5) * basePrice * 0.02;
  const currentPrice = basePrice + priceVariation;
  const trend = Math.random() > 0.5 ? 1.02 : 0.98;
  const movingAverage = currentPrice * trend;
  const volume = Math.floor(Math.random() * 1000000) + 100000;
  
  return {
    ticker,
    price: Math.round(currentPrice * 100) / 100,
    dayHigh: Math.round(currentPrice * 1.01 * 100) / 100,
    dayLow: Math.round(currentPrice * 0.99 * 100) / 100,
    previousClose: Math.round(currentPrice * 0.98 * 100) / 100,
    movingAverage: Math.round(movingAverage * 100) / 100,
    volume,
    timestamp: new Date().toISOString()
  };
}