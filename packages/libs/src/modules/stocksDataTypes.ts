export interface StockInfo {
  Ticker: string;
  Code: string;
  Exchange: string;
  Name: string;
  Type: string;
  Country: string;
  Currency: string;
  previousClose: number;
}

export interface StockHistoryItem {
  date: string;
  adjusted_close: number;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

export interface StockLivePrice {
  date: string;
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

export interface StockPrice {
  ticker: string;
  price: number;
  priceInCurrency: number;
}
