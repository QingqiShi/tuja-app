import dayjs from 'dayjs';
import { getForexPair, normalizeForex, exchangeCurrency } from './forex';

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

let fetch:
  | (<T>(url: string) => Promise<{ json: () => Promise<T> }>)
  | undefined;
let cachedFetch: typeof fetch;
let apiKey: string = '';

const search = async (query: string) => {
  if (!cachedFetch || !apiKey) return;
  const response = await cachedFetch(
    `https://eodhistoricaldata.com/api/search/${encodeURIComponent(
      query
    )}?api_token=${apiKey}`
  );
  const result = ((await response.json()) as any[]).map((info: any) => {
    return {
      ...info,
      Ticker: `${info.Code}.${info.Exchange}`,
    } as StockInfo;
  });
  return result;
};

const livePrice = async (ticker: string) => {
  if (!fetch || !apiKey) return;
  const response = await fetch(
    `https://eodhistoricaldata.com/api/real-time/${encodeURIComponent(
      ticker
    )}?fmt=json&api_token=${apiKey}`
  );
  const result = await response.json();
  return result as StockLivePrice;
};

const history = async (ticker: string, from: string, to: string) => {
  if (!cachedFetch || !apiKey) return;
  const response = await cachedFetch(
    `https://eodhistoricaldata.com/api/eod/${encodeURIComponent(
      ticker
    )}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
      to
    )}&fmt=json&api_token=${apiKey}`
  );
  const result = await response.json();
  return result as StockHistoryItem[];
};

const info = async (ticker: string) => {
  const results = await search(ticker.split('.')[0]);
  return results?.find(({ Ticker }: { Ticker: string }) => Ticker === ticker);
};

const priceAt = async (
  ticker: string,
  at: string | Date,
  currency?: string,
  correctPrice = (price: number) => price
) => {
  const DATE_FORMAT = 'YYYY-MM-DD';
  const requestDate =
    typeof at === 'string' ? dayjs(at, DATE_FORMAT) : dayjs(at);

  const getStockCurrency = async (ticker: string, baseCurrency: string) => {
    const results = await search(ticker.split('.')[0]);
    const tickerCurrency = results?.find(
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

  const getClosePrice = (
    price: {
      close: number | 'NA';
      previousClose?: number;
      adjusted_close?: number;
    },
    tickerCurrency?: string
  ) => {
    const close =
      price.close !== 'NA'
        ? price.close
        : price.previousClose ?? price.adjusted_close ?? 0;
    return tickerCurrency ? normalizeForex(tickerCurrency, close).value : close;
  };

  // get info for currency exchange
  const { tickerCurrency, tickerCurrencyNormalized, forexPair } =
    (ticker && currency && (await getStockCurrency(ticker, currency))) || {};

  // return live price if today or in the future
  if (!requestDate.isBefore(dayjs(), 'day')) {
    const [price, forex] = await Promise.all([
      livePrice(ticker),
      forexPair ? livePrice(forexPair) : undefined,
    ]);
    if (!price) return undefined;
    const close = correctPrice(getClosePrice(price, tickerCurrency));
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
    history(ticker, fromDate, toDate),
    forexPair ? history(forexPair, fromDate, toDate) : undefined,
  ]);

  if (!tickerHistory) return;

  const price = tickerHistory[tickerHistory.length - 1];
  const forex = forexHistory && forexHistory[forexHistory.length - 1];

  const close = correctPrice(getClosePrice(price, tickerCurrency));
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

/**
 * Returns a client object which contains the methods that would talk to our
 * data api.
 *
 * Optionally, you can call it with options to set global context. For example,
 * you can inject your own fetch implementations based on environments.
 */
export const stocksClient = (options?: {
  fetch?: typeof fetch;
  cachedFetch?: typeof cachedFetch;
  apiKey?: string;
}) => {
  if (options) {
    if ('fetch' in options) {
      fetch = options.fetch;
    }
    if ('cachedFetch' in options || (!cachedFetch && 'fetch' in options)) {
      cachedFetch = options.cachedFetch ?? options.fetch;
    }
    if ('apiKey' in options) {
      apiKey = options.apiKey ?? '';
    }
  }

  return { search, livePrice, history, info, priceAt };
};
