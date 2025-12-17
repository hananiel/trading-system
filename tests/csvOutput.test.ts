import { beforeAll, afterAll, beforeEach, test, expect, describe } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { appendDecisionToCsv, batchAppendDecisionsToCsv } from '../src/activities/csvOutput';
import { TradeDecision } from '../src/activities/decision';

const testCsvPath = path.join(__dirname, 'test-decisions.csv');

describe('CSV Output Activity', () => {
  beforeEach(() => {
    // Clean up any existing test CSV file before each test
    if (fs.existsSync(testCsvPath)) {
      fs.unlinkSync(testCsvPath);
    }
  });

  afterAll(() => {
    // Clean up test CSV file
    if (fs.existsSync(testCsvPath)) {
      fs.unlinkSync(testCsvPath);
    }
  });

  test('should create CSV file with headers and first decision', () => {
    const decision: TradeDecision = {
      ticker: 'AAPL',
      state: 'WAIT',
      action: 'HOLD',
      confidence: 0.5,
      triggeredRules: ['price > 50-DMA'],
      timestamp: '2023-12-01T10:00:00.000Z'
    };

    const result = appendDecisionToCsv(decision, testCsvPath);

    expect(result.success).toBe(true);
    expect(result.filePath).toBe(testCsvPath);
    expect(result.recordsWritten).toBe(1);
    expect(fs.existsSync(testCsvPath)).toBe(true);

    const content = fs.readFileSync(testCsvPath, 'utf8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('ticker,state,action,confidence,triggeredRules,timestamp');
    expect(lines[1]).toBe('AAPL,WAIT,HOLD,0.5,["price > 50-DMA"],"2023-12-01T10:00:00.000Z"');
  });

  test('should append to existing CSV file without headers', () => {
    // First decision
    const decision1: TradeDecision = {
      ticker: 'AAPL',
      state: 'WAIT',
      action: 'HOLD',
      confidence: 0.5,
      triggeredRules: ['price > 50-DMA'],
      timestamp: '2023-12-01T10:00:00.000Z'
    };

    const result1 = appendDecisionToCsv(decision1, testCsvPath);
    expect(result1.success).toBe(true);
    expect(result1.recordsWritten).toBe(1);

    // Second decision
    const decision2: TradeDecision = {
      ticker: 'GOOGL',
      state: 'BUY',
      action: 'BUY',
      confidence: 0.8,
      triggeredRules: ['volume > average', 'price > 20-DMA'],
      timestamp: '2023-12-01T10:01:00.000Z'
    };

    const result2 = appendDecisionToCsv(decision2, testCsvPath);
    expect(result2.success).toBe(true);
    expect(result2.recordsWritten).toBe(1);

    const content = fs.readFileSync(testCsvPath, 'utf8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(3); // header + 2 decisions
    expect(lines[0]).toBe('ticker,state,action,confidence,triggeredRules,timestamp');
    expect(lines[1]).toBe('AAPL,WAIT,HOLD,0.5,["price > 50-DMA"],"2023-12-01T10:00:00.000Z"');
    expect(lines[2]).toBe('GOOGL,BUY,BUY,0.8,["volume > average","price > 20-DMA"],"2023-12-01T10:01:00.000Z"');
  });

  test('should handle batch append of multiple decisions', () => {
    const decisions: TradeDecision[] = [
      {
        ticker: 'MSFT',
        state: 'SELL',
        action: 'SELL',
        confidence: 0.7,
        triggeredRules: ['price < 50-DMA'],
        timestamp: '2023-12-01T10:02:00.000Z'
      },
      {
        ticker: 'TSLA',
        state: 'WAIT',
        action: 'HOLD',
        confidence: 0.4,
        triggeredRules: [],
        timestamp: '2023-12-01T10:03:00.000Z'
      }
    ];

    const result = batchAppendDecisionsToCsv(decisions, testCsvPath);

    expect(result.success).toBe(true);
    expect(result.recordsWritten).toBe(2);

    const content = fs.readFileSync(testCsvPath, 'utf8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(3); // header + 2 decisions
    expect(lines[0]).toBe('ticker,state,action,confidence,triggeredRules,timestamp');
    expect(lines[1]).toBe('MSFT,SELL,SELL,0.7,["price < 50-DMA"],"2023-12-01T10:02:00.000Z"');
    expect(lines[2]).toBe('TSLA,WAIT,HOLD,0.4,[],"2023-12-01T10:03:00.000Z"');
  });

  test('should handle empty batch gracefully', () => {
    const result = batchAppendDecisionsToCsv([], testCsvPath);

    expect(result.success).toBe(true);
    expect(result.recordsWritten).toBe(0);
  });

  test('should handle decision with no triggered rules', () => {
    const decision: TradeDecision = {
      ticker: 'AMZN',
      state: 'WAIT',
      action: 'HOLD',
      confidence: 0.5,
      triggeredRules: [],
      timestamp: '2023-12-01T10:04:00.000Z'
    };

    const result = appendDecisionToCsv(decision, testCsvPath);

    expect(result.success).toBe(true);
    expect(result.recordsWritten).toBe(1);

    const content = fs.readFileSync(testCsvPath, 'utf8');
    expect(content).toContain('AMZN,WAIT,HOLD,0.5,[]');
  });

  test('should handle file system errors gracefully', () => {
    const decision: TradeDecision = {
      ticker: 'INVALID',
      state: 'WAIT',
      action: 'HOLD',
      confidence: 0.5,
      triggeredRules: [],
      timestamp: '2023-12-01T10:05:00.000Z'
    };

    // Try to write to an invalid path
    const invalidPath = '/invalid/path/that/does/not/exist/test.csv';
    const result = appendDecisionToCsv(decision, invalidPath);

    expect(result.success).toBe(false);
    expect(result.recordsWritten).toBe(0);
    expect(result.error).toBeDefined();
  });
});