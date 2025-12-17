import { test, expect, describe } from '@jest/globals';
import { TradeState, TradeStateData } from '../src/models/TradeState';

describe('TradeState Model', () => {
  test('should have all required trade states', () => {
    expect(TradeState.WAIT).toBeDefined();
    expect(TradeState.ARMED).toBeDefined();
    expect(TradeState.ENTER).toBeDefined();
  });

  test('should have correct string values for trade states', () => {
    expect(TradeState.WAIT).toBe('WAIT');
    expect(TradeState.ARMED).toBe('ARMED');
    expect(TradeState.ENTER).toBe('ENTER');
  });

  test('should allow type checking with TradeState', () => {
    const state: TradeState = TradeState.WAIT;
    expect(state).toBe('WAIT');
    
    const allStates: TradeState[] = [
      TradeState.WAIT,
      TradeState.ARMED,
      TradeState.ENTER
    ];
    
    expect(allStates).toHaveLength(3);
    expect(allStates).toContain(TradeState.WAIT);
    expect(allStates).toContain(TradeState.ARMED);
    expect(allStates).toContain(TradeState.ENTER);
  });

  test('should be usable as string literals', () => {
    function processTradeState(state: TradeState): string {
      return `Processing ${state} state`;
    }

    expect(processTradeState(TradeState.WAIT)).toBe('Processing WAIT state');
    expect(processTradeState(TradeState.ARMED)).toBe('Processing ARMED state');
    expect(processTradeState(TradeState.ENTER)).toBe('Processing ENTER state');
  });

  test('should export TradeStateData interface', () => {
    const stateData: TradeStateData = {
      currentState: TradeState.WAIT,
      previousState: TradeState.ARMED,
      timestamp: 1234567890
    };
    
    expect(stateData.currentState).toBe(TradeState.WAIT);
    expect(stateData.previousState).toBe(TradeState.ARMED);
    expect(stateData.timestamp).toBe(1234567890);
  });

  test('should work with enum iteration', () => {
    const stateValues = Object.values(TradeState);
    expect(stateValues).toContain('WAIT');
    expect(stateValues).toContain('ARMED');
    expect(stateValues).toContain('ENTER');
  });
});