import { beforeAll, afterAll, test, expect, describe } from '@jest/globals';
import { createTradeDecision } from '../src/activities/decision';

describe('Trade Decision Creation', () => {

  test('decision object should have all required fields', () => {
    const ruleResult = {
      isBullish: true,
      triggered: true,
      rule: 'price > 50-DMA'
    };
    
    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.5, ruleResult);
    
    expect(decision).toBeDefined();
    expect(decision.ticker).toBe('AAPL');
    expect(decision.state).toBe('WAIT');
    expect(decision.action).toBe('HOLD');
    expect(decision.confidence).toBe(0.5);
    expect(decision.triggeredRules).toEqual(['price > 50-DMA']);
    expect(decision.timestamp).toBeDefined();
    expect(typeof decision.timestamp).toBe('string');
  });

    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.5, ruleResult);
    
    expect(decision).toBeDefined();
    expect(decision.ticker).toBe('AAPL');
    expect(decision.state).toBe('WAIT');
    expect(decision.action).toBe('HOLD');
    expect(decision.confidence).toBe(0.5);
    expect(decision.triggeredRules).toEqual(['price > 50-DMA']);
    expect(decision.timestamp).toBeDefined();
    expect(typeof decision.timestamp).toBe('string');
  });

  test('decision object should have no triggered rules when no rule result', () => {
    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', undefined);
    
    expect(decision).toBeDefined();
    expect(decision.triggeredRules).toEqual([]);
  });

  test('decision confidence should be between 0 and 1', () => {
    const decisionBullish = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.5, { isBullish: true, triggered: true, rule: 'price > 50-DMA' });
    const decisionBearish = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.3, { isBullish: false, triggered: false, rule: 'price > 50-DMA' });
    
    expect(decisionBullish.confidence).toBeGreaterThanOrEqual(0));
    expect(decisionBullish.confidence).toBeLessThanOrEqual(1));
    expect(decisionBearish.confidence).toBeGreaterThanOrEqual(0));
    expect(decisionBearish.confidence).toBeLessThanOrEqual(1));
  });

  test('decision timestamp should be valid ISO string', () => {
    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.8, { isBullish: true, triggered: true, rule: 'price > 50-DMA' });
    
    expect(decision.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\.\d{3}Z$/);
  });
});

  test('decision object should have no triggered rules when no rule result', () => {
    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.3, undefined);
    
    expect(decision).toBeDefined();
    expect(decision.triggeredRules).toEqual([]);
  });

  test('decision confidence should be between 0 and 1', () => {
    const decisionBullish = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.8, { isBullish: true, triggered: true, rule: 'price > 50-DMA' });
    const decisionBearish = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.2, { isBullish: false, triggered: false, rule: 'price > 50-DMA' });
    
    expect(decisionBullish.confidence).toBeGreaterThanOrEqual(0));
    expect(decisionBullish.confidence).toBeLessThanOrEqual(1);
    expect(decisionBearish.confidence).toBeGreaterThanOrEqual(0));
    expect(decisionBearish.confidence).toBeLessThanOrEqual(1);
  });

  test('decision timestamp should be valid ISO string', () => {
    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.8, { isBullish: true, triggered: true, rule: 'price > 50-DMA' });
    
    expect(decision.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\.\d{3}Z$/);
  });
});

  test('decision object should have no triggered rules when no rule result', () => {
    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', undefined);
    
    expect(decision).toBeDefined();
    expect(decision.triggeredRules).toEqual([]);
  });

  test('decision confidence should be between 0 and 1', () => {
    const decisionBullish = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.5, { isBullish: true, triggered: true, rule: 'price > 50-DMA' });
    const decisionBearish = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.5, { isBullish: false, triggered: false, rule: 'price > 50-DMA' });
    
    expect(decisionBullish.confidence).toBeGreaterThanOrEqual(0));
    expect(decisionBullish.confidence).toBeLessThanOrEqual(1));
    expect(decisionBearish.confidence).toBeGreaterThanOrEqual(0));
    expect(decisionBearish.confidence).toBeLessThanOrEqual(1));
  });

  test('decision timestamp should be valid ISO string', () => {
    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', 0.5, { isBullish: true, triggered: true, rule: 'price > 50-DMA' });
    
    expect(decision.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\.\d{3}Z$/);
  });
});

  test('decision object should have no triggered rules when no rule result', () => {
    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', undefined);
    
    expect(decision).toBeDefined();
    expect(decision.triggeredRules).toEqual([]);
  });

  test('decision confidence should be between 0 and 1', () => {
    const decisionBullish = createTradeDecision('AAPL', 'WAIT', 'HOLD', { isBullish: true, triggered: true, rule: 'price > 50-DMA' });
    const decisionBearish = createTradeDecision('AAPL', 'WAIT', 'HOLD', { isBullish: false, triggered: false, rule: 'price > 50-DMA' });
    
    expect(decisionBullish.confidence).toBeGreaterThanOrEqual(0);
    expect(decisionBullish.confidence).toBeLessThanOrEqual(1);
    expect(decisionBearish.confidence).toBeGreaterThanOrEqual(0);
    expect(decisionBearish.confidence).toBeLessThanOrEqual(1);
  });

  test('decision timestamp should be valid ISO string', () => {
    const decision = createTradeDecision('AAPL', 'WAIT', 'HOLD', { isBullish: true, triggered: true, rule: 'price > 50-DMA' });
    
    expect(decision.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\.\d{3}Z$/);
  });
});

  test('decision object should have no triggered rules when no rule result', () => {
    const decision = createTradeDecision(
      { ticker: 'AAPL' },
      undefined
    );
    
    expect(decision).toBeDefined();
    expect(decision.triggeredRules).toEqual([]);
  });

  test('decision confidence should be between 0 and 1', () => {
    const decisionBullish = createTradeDecision(
      { ticker: 'AAPL' },
      { isBullish: true, triggered: true, rule: 'price > 50-DMA' }
    );
    
    const decisionBearish = createTradeDecision(
      { ticker: 'AAPL' },
      { isBullish: false, triggered: false, rule: 'price > 50-DMA' }
    );
    
    expect(decisionBullish.confidence).toBeGreaterThanOrEqual(0);
    expect(decisionBullish.confidence).toBeLessThanOrEqual(1);
    expect(decisionBearish.confidence).toBeGreaterThanOrEqual(0);
    expect(decisionBearish.confidence).toBeLessThanOrEqual(1);
  });

  test('decision timestamp should be valid ISO string', () => {
    const decision = createTradeDecision(
      { ticker: 'AAPL' },
      { isBullish: true, triggered: true, rule: 'price > 50-DMA' }
    );
    
    expect(decision.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});