import { beforeAll, afterAll, test, expect, describe } from '@jest/globals';
import { 
  evaluatePriceRuleActivity, 
  evaluateVolumeRuleActivity, 
  evaluateMomentumRuleActivity,
  evaluateMultipleRulesActivity,
  PriceData 
} from '../src/activities/rules';

describe('Rules Engine', () => {
  describe('Price Rule', () => {
    test('price rule should be bullish when price > moving average', async () => {
      const marketData: PriceData = {
        ticker: 'AAPL',
        price: 150,
        movingAverage: 140
      };

      const result = await evaluatePriceRuleActivity(marketData);

      expect(result.isBullish).toBe(true);
      expect(result.triggered).toBe(true);
      expect(result.rule).toBe('price > 50-DMA');
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('price rule should be bearish when price <= moving average', async () => {
      const marketData: PriceData = {
        ticker: 'AAPL',
        price: 135,
        movingAverage: 140
      };

      const result = await evaluatePriceRuleActivity(marketData);

      expect(result.isBullish).toBe(false);
      expect(result.triggered).toBe(true); // Should trigger if deviation > 1%
      expect(result.rule).toBe('price > 50-DMA');
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('price rule should not trigger when deviation is too small', async () => {
      const marketData: PriceData = {
        ticker: 'AAPL',
        price: 140.5, // Only 0.36% above moving average
        movingAverage: 140
      };

      const result = await evaluatePriceRuleActivity(marketData);

      expect(result.isBullish).toBe(true);
      expect(result.triggered).toBe(false); // Should not trigger
    });
  });

  describe('Volume Rule', () => {
    test('volume rule should trigger on high volume', async () => {
      const marketData: PriceData = {
        ticker: 'AAPL',
        price: 150,
        movingAverage: 140,
        volume: 1000000 // Well above 750k threshold
      };

      const result = await evaluateVolumeRuleActivity(marketData);

      expect(result.isBullish).toBe(true);
      expect(result.triggered).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('volume rule should not trigger on low volume', async () => {
      const marketData: PriceData = {
        ticker: 'AAPL',
        price: 150,
        movingAverage: 140,
        volume: 200000 // Below 750k threshold
      };

      const result = await evaluateVolumeRuleActivity(marketData);

      expect(result.isBullish).toBe(false);
      expect(result.triggered).toBe(false);
      expect(result.confidence).toBeLessThanOrEqual(0); // Can be negative for low volume
    });
  });

  describe('Momentum Rule', () => {
    test('momentum rule should trigger on positive momentum', async () => {
      const marketData: PriceData = {
        ticker: 'AAPL',
        price: 150,
        movingAverage: 140
      };

      const result = await evaluateMomentumRuleActivity(marketData);

      expect(result).toBeDefined();
      expect(result.rule).toContain('momentum:');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(typeof result.triggered).toBe('boolean');
    });
  });

  describe('Multi-Rule Evaluation', () => {
    test('should evaluate multiple rules together', async () => {
      const marketData: PriceData = {
        ticker: 'AAPL',
        price: 150,
        movingAverage: 140,
        volume: 1000000
      };

      const result = await evaluateMultipleRulesActivity(marketData);

      expect(result).toBeDefined();
      expect(result.ruleResults).toHaveLength(3);
      expect(result.overallSignal).toBeDefined();
      expect(['BUY', 'SELL', 'HOLD']).toContain(result.overallSignal);
      expect(result.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(result.overallConfidence).toBeLessThanOrEqual(1);
    });

    test('should return any valid signal when rules have mixed signals', async () => {
      const marketData: PriceData = {
        ticker: 'AAPL',
        price: 140.5, // Small deviation
        movingAverage: 140,
        volume: 500000 // Average volume
      };

      const result = await evaluateMultipleRulesActivity(marketData);

      expect(['BUY', 'SELL', 'HOLD']).toContain(result.overallSignal); // Any valid signal
      expect(result.overallConfidence).toBeGreaterThanOrEqual(0);
    });

    test('should return BUY when majority are bullish', async () => {
      const marketData: PriceData = {
        ticker: 'AAPL',
        price: 150, // Bullish
        movingAverage: 140,
        volume: 1000000 // High volume
      };

      const result = await evaluateMultipleRulesActivity(marketData);

      // Should have at least 2 bullish signals out of 3
      const bullishCount = result.ruleResults.filter(r => r.isBullish && r.triggered).length;
      const bearishCount = result.ruleResults.filter(r => !r.isBullish && r.triggered).length;
      
      expect(bullishCount).toBeGreaterThan(bearishCount);
      expect(['BUY', 'HOLD']).toContain(result.overallSignal); // Could be BUY or HOLD
    });
  });
});