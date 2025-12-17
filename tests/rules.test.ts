import { beforeAll, afterAll, test, expect, describe } from '@jest/globals';
import { evaluatePriceRuleActivity } from '../src/activities/rules';
import { PriceData, RuleResult } from '../src/activities/rules';

describe('Rule Evaluation Activity', () => {

  test('rule evaluation should return bullish when price > moving average', async () => {
    const testData: PriceData = {
      ticker: 'AAPL',
      price: 150,
      movingAverage: 140
    };

    const result = await evaluatePriceRuleActivity(testData);
    
    expect(result).toBeDefined();
    expect(result.isBullish).toBe(true);
    expect(result.triggered).toBe(true);
    expect(result.rule).toBe('price > 50-DMA');
  });

  test('rule evaluation should return bearish when price <= moving average', async () => {
    const testData: PriceData = {
      ticker: 'AAPL',
      price: 130,
      movingAverage: 140
    };

    const result = await evaluatePriceRuleActivity(testData);
    
    expect(result).toBeDefined();
    expect(result.isBullish).toBe(false);
    expect(result.triggered).toBe(false);
    expect(result.rule).toBe('price > 50-DMA');
  });

});