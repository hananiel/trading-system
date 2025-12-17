// Type definitions for yahoo-finance library
declare module 'yahoo-finance' {
  export interface HistoricalData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose: number;
    volume: number;
  }

  export interface Quote {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose: number;
    volume: number;
  }

  export interface ChartResult {
    symbol: string;
    period1: string;
    interval1: string;
    range?: string;
    prePost?: boolean;
    includePrePost?: boolean;
    currency?: string;
    backtest_adjustment_start?: string;
    backtest_adjustment_end?: string;
    div_adjustment_start?: string;
    div_adjustment_end?: string;
    split_adjustment_start?: string;
    split_adjustment_end?: string;
    dividends: number[];
    capitalGains?: number;
    chart?: Quote[];
    events: any[];
    meta?: any;
    quotes?: Quote[]; // Note: 'quotes' is correct property
    quots?: Quote[]; // Note: 'quots' is typo in library
  }

  export function chart(options: {
    symbol: string;
    period1?: string;
    interval1?: string;
    range?: string;
    prePost?: boolean;
    includePrePost?: boolean;
    currency?: string;
    backtest_adjustment_start?: string;
    backtest_adjustment_end?: string;
    div_adjustment_start?: string;
    div_adjustment_end?: string;
    split_adjustment_start?: string;
    split_adjustment_end?: string;
  }): Promise<ChartResult>;
}