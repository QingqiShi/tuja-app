import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import NodeCache from 'node-cache';
import { normalizeForex, exchangeCurrency, getForexPair } from '@tuja/forex';

// Get EodHistoricalData API token from firebase config
const getToken = () => functions.config().eodhistoricaldata.token;

/* =====
Searching
*/

const searchStocksCache = new NodeCache();

export const searchStocks = functions
  .runWith({ memory: '1GB' })
  .https.onCall(async (data) => {
    const { query } = data;
    if (typeof query !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide a search query'
      );
    }

    functions.logger.log('query', { query });

    const cache = searchStocksCache.get(query);
    if (cache) {
      functions.logger.log('cache hit', { key: query });
      return cache;
    }

    functions.logger.log('cache miss', { key: query });
    const response = await fetch(
      `https://eodhistoricaldata.com/api/search/${query}?api_token=${getToken()}`
    );
    const result = (await response.json()).map((info: any) => ({
      Ticker: `${info.Code}.${info.Exchange}`,
      ...info,
    }));

    searchStocksCache.set(query, result);
    return result;
  });

/* =====
Stock live price
*/

function getLivePrices(tickers: string[]) {
  const token = getToken();
  return Promise.all(
    tickers.map(async (ticker) => {
      functions.logger.log('ticker', { ticker });
      const response = await fetch(
        `https://eodhistoricaldata.com/api/real-time/${ticker}?fmt=json&api_token=${token}`
      );
      return response.json();
    })
  );
}

export const stockLivePrice = functions
  .runWith({ memory: '1GB' })
  .https.onCall(async (data) => {
    const { tickers } = data;
    if (!Array.isArray(tickers)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide an array of ticker symbols'
      );
    }

    const livePrices = await getLivePrices(tickers);
    return livePrices;
  });

/* =====
Historical data
*/

const stockHistoryCache = new NodeCache();

function getHistories(tickers: string[], from: string, to: string) {
  return Promise.all(
    tickers.map(async (ticker) => {
      const response = await fetch(
        `https://eodhistoricaldata.com/api/eod/${ticker}?from=${from}&to=${to}&fmt=json&api_token=${getToken()}`
      );
      return response.json();
    })
  );
}

export const stockHistory = functions
  .runWith({ memory: '1GB' })
  .https.onCall(async (data) => {
    const { ticker, from, to } = data;
    if (typeof ticker !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide a ticker symbol'
      );
    }
    if (typeof from !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide a from date'
      );
    }
    if (typeof to !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide a to date'
      );
    }

    functions.logger.log('ticker', { ticker });

    const cacheKey = `${ticker}-${from}-${to}`;
    const cache = stockHistoryCache.get(cacheKey);
    if (cache) {
      functions.logger.log('cache hit', { key: cacheKey });
      return cache;
    }

    functions.logger.log('cache miss', { key: cacheKey });
    const [result] = await getHistories([ticker], from, to);

    stockHistoryCache.set(cacheKey, result);
    return result;
  });

/* =====
Stock info
*/

// Cache exchange tickers for 1 day
const exchangeTickersCache = new NodeCache({ stdTTL: 86400 });

interface ExchangeMap {
  [ticker: string]: { Code: string; Currency: string };
}

async function fetchExchangeTickers(exchange: string) {
  const cache = exchangeTickersCache.get(exchange);
  if (cache) {
    functions.logger.log('cache hit', { key: exchange });
    return cache as ExchangeMap;
  }

  functions.logger.log('cache miss', { key: exchange });
  const response = await fetch(
    `https://eodhistoricaldata.com/api/exchange-symbol-list/${exchange}?fmt=json&api_token=${getToken()}`
  );

  const result = (await response.json()) as {
    Code: string;
    Currency: string;
  }[];

  // Convert it to a map for fast random access
  const map: ExchangeMap = {};
  result.forEach((detail) => {
    map[detail.Code] = detail;
  });

  exchangeTickersCache.set(exchange, map);
  return map;
}

async function getExchangeMap(tickers: string[]) {
  const exchanges = [...new Set(tickers.map((ticker) => ticker.split('.')[1]))];

  const exchangeTickersMaps = await Promise.all(
    exchanges.map((exchange) => fetchExchangeTickers(exchange))
  );
  const exchangeMap: {
    [exchange: string]: typeof exchangeTickersMaps[0];
  } = exchanges.reduce(
    (map, exchange, i) => ({ ...map, [exchange]: exchangeTickersMaps[i] }),
    {}
  );

  return exchangeMap;
}

export const stocksInfo = functions
  .runWith({ memory: '1GB' })
  .https.onCall(async (data) => {
    const { tickers } = data;
    if (!Array.isArray(tickers)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide an array of tickers'
      );
    }

    functions.logger.log('tickers', { tickers });

    const exchangeMap = await getExchangeMap(tickers);
    const results = tickers.map((ticker) => {
      const [symbol, exchange] = ticker.split('.');
      return { Ticker: ticker, ...exchangeMap[exchange][symbol] };
    });

    return results;
  });

/* =====
StocksPrices
*/

export const stocksPrices = functions
  .runWith({ memory: '1GB' })
  .https.onCall(async (data) => {
    const { tickers, date, currency } = data;
    if (!Array.isArray(tickers)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide an array of ticker symbols'
      );
    }
    if (typeof date !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide a date'
      );
    }
    if (typeof currency !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide a base currency'
      );
    }

    const DATE_FORMAT = 'YYYY-MM-DD';
    const { default: dayjs } = await import('dayjs');

    // Get info to figure out what currency to fetch
    const exchangeMap = await getExchangeMap(tickers);
    const forexPairs = [
      ...new Set(
        tickers
          .map((ticker) => {
            const [symbol, exchange] = ticker.split('.');
            const tickerCurrency = exchangeMap[exchange][symbol]?.Currency;
            const { currency: normalized } = normalizeForex(tickerCurrency);
            if (normalized === currency) return null;
            return normalized;
          })
          .filter((c): c is string => !!c)
          .map((c) => getForexPair(c, currency))
      ),
    ];

    const d = dayjs(date, DATE_FORMAT);
    const today = dayjs();

    const tickersAndForexPairs = [...tickers, ...forexPairs];

    if (d.isSame(today, 'day')) {
      const livePrices = await getLivePrices(tickersAndForexPairs);
      return tickersAndForexPairs.reduce(
        (map, ticker, i) => ({
          ...map,
          [ticker]:
            livePrices[i].close !== 'NA'
              ? livePrices[i].close
              : livePrices[i].previousClose,
        }),
        {}
      );
    }

    const histories = await getHistories(
      tickersAndForexPairs,
      d.subtract(5, 'day').format(DATE_FORMAT),
      d.format(DATE_FORMAT)
    );
    return tickersAndForexPairs.reduce(
      (map, ticker, i) => ({
        ...map,
        [ticker]: histories[i][histories[i].length - 1].close,
      }),
      {}
    );
  });
