import { TradeDecision } from './decision';
import * as fs from 'fs';
import * as path from 'path';

export interface CsvOutputResult {
  success: boolean;
  filePath: string;
  recordsWritten: number;
  error?: string;
}

export function appendDecisionToCsv(decision: TradeDecision, outputPath?: string): CsvOutputResult {
  try {
    const csvFilePath = outputPath || path.join(process.cwd(), 'trade-decisions.csv');
    
    // Check if file exists to determine if we need headers
    const fileExists = fs.existsSync(csvFilePath);
    
    // Create CSV row
    const csvRow = [
      decision.ticker,
      decision.state,
      decision.action,
      decision.confidence.toString(),
      JSON.stringify(decision.triggeredRules),
      `"${decision.timestamp}"`
    ].join(',');
    
    // Create header row if file doesn't exist
    const header = 'ticker,state,action,confidence,triggeredRules,timestamp';
    
    // Append to file (create if doesn't exist)
    const dataToWrite = fileExists ? `\n${csvRow}` : `${header}\n${csvRow}`;
    
    fs.appendFileSync(csvFilePath, dataToWrite, 'utf8');
    
    return {
      success: true,
      filePath: csvFilePath,
      recordsWritten: 1
    };
  } catch (error) {
    return {
      success: false,
      filePath: outputPath || 'trade-decisions.csv',
      recordsWritten: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function batchAppendDecisionsToCsv(decisions: TradeDecision[], outputPath?: string): CsvOutputResult {
  try {
    const csvFilePath = outputPath || path.join(process.cwd(), 'trade-decisions.csv');
    
    // Check if file exists to determine if we need headers
    const fileExists = fs.existsSync(csvFilePath);
    
    if (decisions.length === 0) {
      return {
        success: true,
        filePath: csvFilePath,
        recordsWritten: 0
      };
    }
    
    // Create CSV rows
    const csvRows = decisions.map(decision => [
      decision.ticker,
      decision.state,
      decision.action,
      decision.confidence.toString(),
      JSON.stringify(decision.triggeredRules),
      `"${decision.timestamp}"`
    ].join(','));
    
    // Create header row if file doesn't exist
    const header = 'ticker,state,action,confidence,triggeredRules,timestamp';
    
    // Append to file (create if doesn't exist)
    const dataToWrite = fileExists ? `\n${csvRows.join('\n')}` : `${header}\n${csvRows.join('\n')}`;
    
    fs.appendFileSync(csvFilePath, dataToWrite, 'utf8');
    
    return {
      success: true,
      filePath: csvFilePath,
      recordsWritten: decisions.length
    };
  } catch (error) {
    return {
      success: false,
      filePath: outputPath || 'trade-decisions.csv',
      recordsWritten: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}