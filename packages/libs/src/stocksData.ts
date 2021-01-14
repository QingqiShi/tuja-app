import dayjs from 'dayjs';
import type { TimeSeries } from './timeSeries';
import { getForexPair, normalizeForex, exchangeCurrency } from './modules/forex';

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

export const getStockInfo = async (
  client: ReturnType<typeof getStocksClient>,
  ticker: string
) => {
  const results = await client.search(ticker.split('.')[0]);
  return results.find(({ Ticker }: { Ticker: string }) => Ticker === ticker);
};

export const getStockPriceAt = async (
  client: ReturnType<typeof getStocksClient>,
  cachedClient: ReturnType<typeof getStocksClient>,
  ticker: string,
  at: string | Date,
  currency?: string
) => {
  const DATE_FORMAT = 'YYYY-MM-DD';
  const requestDate =
    typeof at === 'string' ? dayjs(at, DATE_FORMAT) : dayjs(at);

  const getStockCurrency = async (ticker: string, baseCurrency: string) => {
    const results = await cachedClient.search(ticker.split('.')[0]);
    const tickerCurrency = results.find(
      ({ Ticker }: { Ticker: string }) => Ticker === ticker
    )?.Currency;

    const tickerCurrencyNormalized =
      tickerCurrency && normalizeForex(tickerCurrency).currency;

    const forexPair =
      tickerCurrencyNormalized &&
      baseCurrency &&
      tickerCurrencyNormalized !== baseCurrency
        ? getForexPair(tickerCurrencyNormalized, baseCurrency)
        : undefined;

    return { tickerCurrency, tickerCurrencyNormalized, forexPair };
  };

  type Price = { close: number | 'NA'; previousClose: number };
  const getClosePrice = (price: Price, tickerCurrency?: string) => {
    const close = price.close !== 'NA' ? price.close : price.previousClose;
    return tickerCurrency ? normalizeForex(tickerCurrency, close).value : close;
  };

  // get info for currency exchange
  const { tickerCurrency, tickerCurrencyNormalized, forexPair } =
    (ticker && currency && (await getStockCurrency(ticker, currency))) || {};

  // return live price if today or in the future
  if (!requestDate.isBefore(dayjs(), 'day')) {
    const [price, forex] = await Promise.all([
      client.livePrice(ticker),
      forexPair ? client.livePrice(forexPair) : undefined,
    ]);
    const close = getClosePrice(price, tickerCurrency);
    return {
      ticker,
      price: close,
      priceInCurrency:
        tickerCurrencyNormalized && forex && currency
          ? exchangeCurrency(close, tickerCurrencyNormalized, currency, () =>
              getClosePrice(forex)
            )
          : close,
    };
  }

  // return historic price
  const fromDate = requestDate.subtract(5, 'day').format(DATE_FORMAT);
  const toDate = requestDate.format(DATE_FORMAT);
  const [tickerHistory, forexHistory] = await Promise.all([
    cachedClient.history(ticker, fromDate, toDate),
    forexPair ? cachedClient.history(forexPair, fromDate, toDate) : undefined,
  ]);

  const price = tickerHistory[tickerHistory.length - 1];
  const forex = forexHistory && forexHistory[forexHistory.length - 1];

  const close = getClosePrice(price, tickerCurrency);
  return {
    ticker,
    price: close,
    priceInCurrency:
      tickerCurrencyNormalized && forex && currency
        ? exchangeCurrency(close, tickerCurrencyNormalized, currency, () =>
            getClosePrice(forex)
          )
        : close,
  };
};
