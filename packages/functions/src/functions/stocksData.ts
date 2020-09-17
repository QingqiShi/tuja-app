import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import NodeCache from 'node-cache';

// Get EodHistoricalData API token from firebase config
const getToken = () => functions.config().eodhistoricaldata.token;

/* =====
Searching
*/

const searchStocksCache = new NodeCache();

export const searchStocks = functions.https.onCall(async (data) => {
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
  const result = await response.json();

  searchStocksCache.set(query, result);
  return result;
});

/* =====
Stock live price
*/

export const stockLivePrice = functions.https.onCall(async (data) => {
  const { ticker } = data;
  if (typeof ticker !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You need to provide a ticker symbol'
    );
  }

  functions.logger.log('ticker', { ticker });

  const response = await fetch(
    `https://eodhistoricaldata.com/api/real-time/${ticker}?fmt=json&api_token=${getToken()}`
  );
  const result = await response.json();

  return result;
});

/* =====
Historical data
*/

const stockHistoryCache = new NodeCache();

export const stockHistory = functions.https.onCall(async (data) => {
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
  const response = await fetch(
    `https://eodhistoricaldata.com/api/eod/${ticker}?from=${from}&to=${to}&fmt=json&api_token=${getToken()}`
  );
  const result = await response.json();

  stockHistoryCache.set(cacheKey, result);
  return result;
});

/* =====
Stock info
*/

// Cache exchange tickers for 1 day
const exchangeTickersCache = new NodeCache({ stdTTL: 86400 });

interface ExchangeMap {
  [ticker: string]: { Code: string };
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

  const result = (await response.json()) as { Code: string }[];

  // Convert it to a map for fast random access
  const map: ExchangeMap = {};
  result.forEach((detail) => {
    map[detail.Code] = detail;
  });

  exchangeTickersCache.set(exchange, map);
  return map;
}

export const stocksInfo = functions
  .runWith({ memory: '512MB' })
  .https.onCall(async (data) => {
    const { tickers } = data;
    if (!Array.isArray(tickers)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'You need to provide an array of tickers'
      );
    }

    functions.logger.log('tickers', { tickers });

    const exchanges = [
      ...new Set(tickers.map((ticker) => ticker.split('.')[1])),
    ];

    const exchangeTickersMaps = await Promise.all(
      exchanges.map((exchange) => fetchExchangeTickers(exchange))
    );
    const exchangeMap: {
      [exchange: string]: typeof exchangeTickersMaps[0];
    } = exchanges.reduce(
      (map, exchange, i) => ({ ...map, [exchange]: exchangeTickersMaps[i] }),
      {}
    );

    const results = tickers.map((ticker) => {
      const [symbol, exchange] = ticker.split('.');
      return { Ticker: ticker, ...exchangeMap[exchange][symbol] };
    });

    return results;
  });
