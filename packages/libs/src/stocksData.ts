import type { TimeSeries } from './timeSeries';

export interface StockInfo {
  Ticker: string;
  Code: string;
  Name: string;
  Country: string;
  Exchange: string;
  Currency: string;
  Type?: string;
}

export interface StockHistory {
  ticker: string;
  close: TimeSeries;
  adjusted: TimeSeries;
  range: { startDate: Date; endDate: Date };
}

export interface StockLivePrice {
  date: Date;
  code: string;
  close: number | 'NA';
  previousClose: number;
  timestamp?: number;
  open?: number | 'NA';
  high?: number | 'NA';
  low?: number | 'NA';
  volume?: number;
  change?: number | 'NA';
  change_p?: number | 'NA';
}
