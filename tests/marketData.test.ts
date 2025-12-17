import { test, expect, describe } from '@jest/globals';
import { getMarketDataActivity, MarketDataInput, MarketData } from '../src/activities/marketData';

describe('Market Data Activity', () => {
  test('should return realistic market data for known ticker', async () => {
    const input: MarketDataInput = { ticker: 'AAPL' };
    const result = await getMarketDataActivity(input);
    
    expect(result).toBeDefined();
    expect(result.ticker).toBe('AAPL');
    expect(result.price).toBeGreaterThan(0);
    expect(result.movingAverage).toBeGreaterThan(0);
    expect(result.volume).toBeGreaterThan(0);
    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe('string');
  });

  test('should handle unknown ticker with default values', async () => {
    const input: MarketDataInput = { ticker: 'UNKNOWN' };
    const result = await getMarketDataActivity(input);
    
    expect(result).toBeDefined();
    expect(result.ticker).toBe('UNKNOWN');
    expect(result.price).toBeGreaterThan(0);
    expect(result.movingAverage).toBeGreaterThan(0);
    expect(result.volume).toBeGreaterThan(0);
  });

  test('should return price near expected range for known tickers', async () => {
    const testCases = [
      { ticker: 'AAPL', expectedRange: [120, 180] },
      { ticker: 'GOOGL', expectedRange: [2500, 3100] },
      { ticker: 'MSFT', expectedRange: [320, 380] },
      { ticker: 'TSLA', expectedRange: [220, 280] }
    ];

    for (const testCase of testCases) {
      const input: MarketDataInput = { ticker: testCase.ticker };
      const result = await getMarketDataActivity(input);
      
      expect(result.price).toBeGreaterThanOrEqual(testCase.expectedRange[0] * 0.98);
      expect(result.price).toBeLessThanOrEqual(testCase.expectedRange[1] * 1.02);
    }
  });

  test('should generate unique timestamps', async () => {
    const input: MarketDataInput = { ticker: 'AAPL' };
    
    const result1 = await getMarketDataActivity(input);
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    const result2 = await getMarketDataActivity(input);
    
    expect(result1.timestamp).not.toBe(result2.timestamp);
  });

  test('should generate realistic volume numbers', async () => {
    const input: MarketDataInput = { ticker: 'AAPL' };
    const result = await getMarketDataActivity(input);
    
    expect(result.volume).toBeGreaterThanOrEqual(100000);
    expect(result.volume).toBeLessThanOrEqual(1100000);
  });

  test('should have consistent ticker throughout result', async () => {
    const tickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
    
    for (const ticker of tickers) {
      const input: MarketDataInput = { ticker };
      const result = await getMarketDataActivity(input);
      
      expect(result.ticker).toBe(ticker);
    }
  });

  test('should generate decimal prices properly', async () => {
    const input: MarketDataInput = { ticker: 'AAPL' };
    const result = await getMarketDataActivity(input);
    
    // Should have at most 2 decimal places
    expect(result.price).toBe(Math.round(result.price * 100) / 100);
    expect(result.movingAverage).toBe(Math.round(result.movingAverage * 100) / 100);
  });

  test('should include day high/low data', async () => {
    const input: MarketDataInput = { ticker: 'AAPL' };
    const result = await getMarketDataActivity(input);
    
    expect(result.dayHigh).toBeDefined();
    expect(result.dayLow).toBeDefined();
    expect(result.dayHigh).toBeGreaterThanOrEqual(result.price);
    expect(result.dayLow).toBeLessThanOrEqual(result.price);
    expect(result.previousClose).toBeDefined();
  });

  test('should handle API failures gracefully', async () => {
    // Mock API failure by using an invalid ticker
    const input: MarketDataInput = { ticker: 'INVALIDTICKER' };
    
    // This should fallback to simulated data
    const result = await getMarketDataActivity(input);
    
    expect(result).toBeDefined();
    expect(result.ticker).toBe('INVALIDTICKER');
    expect(result.price).toBeGreaterThan(0);
  });

  test('should log appropriate messages', async () => {
    const input: MarketDataInput = { ticker: 'AAPL' };
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    await getMarketDataActivity(input);
    
    expect(consoleSpy).toHaveBeenCalledWith('📊 Fetching real market data for AAPL...');
    
    consoleSpy.mockRestore();
  });

  test('should have proper TypeScript interface types', () => {
    const input: MarketDataInput = { ticker: 'TEST' };
    const result: Promise<MarketData> = getMarketDataActivity(input);
    
    expect(result).toBeDefined();
    expect(typeof result.then).toBe('function');
  });
});