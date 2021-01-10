import type { TimeSeries } from './timeSeries';

export interface StockInfo {
  Ticker: string;
  Code: string;
  Exchange: string;
  Name: string;
  Type: string;
  Country: string;
  Currency: string;
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

export interface StockPrice {
  ticker: string;
  price: number;
  priceInCurrency: number;
}

export const getStocksClient = (
  fetch: (url: string) => Promise<{ json: () => Promise<any> }>,
  apiKey: string
) => ({
  search: async (query: string) => {
    const response = await fetch(
      `https://eodhistoricaldata.com/api/search/${encodeURIComponent(
        query
      )}?api_token=${apiKey}`
    );
    const result = (await response.json()).map((info: any) => {
      return {
        ...info,
        Ticker: `${info.Code}.${info.Exchange}`,
      };
    });
    return result;
  },
  livePrice: async (ticker: string) => {
    const response = await fetch(
      `https://eodhistoricaldata.com/api/real-time/${encodeURIComponent(
        ticker
      )}?fmt=json&api_token=${apiKey}`
    );
    const result = await response.json();
    return result;
  },
  history: async (ticker: string, from: string, to: string) => {
    const response = await fetch(
      `https://eodhistoricaldata.com/api/eod/${encodeURIComponent(
        ticker
      )}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
        to
      )}&fmt=json&api_token=${apiKey}`
    );
    const result = await response.json();
    return result;
  },
});
