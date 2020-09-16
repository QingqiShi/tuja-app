import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

import NodeCache = require('node-cache');

const getToken = () => functions.config().eodhistoricaldata.token;

const searchStocksCache = new NodeCache();

export const searchStocks = functions.https.onCall(async (data) => {
  const { query } = data;
  if (typeof query !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You need to provide a search query'
    );
  }

  console.log('searchStocks', query);

  const cache = searchStocksCache.get(query);
  if (cache) {
    console.log(`searchStocksCache hit for ${query}`);
    return cache;
  }

  console.log(`searchStocksCache miss for ${query}, fetching`);
  const response = await fetch(
    `https://eodhistoricaldata.com/api/search/${query}?api_token=${getToken()}`
  );
  const result = await response.json();
  searchStocksCache.set(query, result);

  return result;
});

export const stockLivePrice = functions.https.onCall(async (data) => {
  const { ticker } = data;
  if (typeof ticker !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You need to provide a ticker symbol'
    );
  }

  const response = await fetch(
    `https://eodhistoricaldata.com/api/real-time/${ticker}?fmt=json&api_token=${getToken()}`
  );
  const result = await response.json();

  return result;
});

const stockHistoryCache = new NodeCache({ stdTTL: 43200 });

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

  console.log('stockHistory', ticker, from, to);

  const cacheKey = `${ticker}-${from}-${to}`;
  const cache = stockHistoryCache.get(cacheKey);
  if (cache) {
    console.log(`stockHistoryCache hit for ${cacheKey}`);
    return cache;
  }

  console.log(`stockHistoryCache miss for ${cacheKey}, fetching`);
  const response = await fetch(
    `https://eodhistoricaldata.com/api/eod/${ticker}?from=${from}&to=${to}&fmt=json&api_token=${getToken()}`
  );
  const result = await response.json();
  stockHistoryCache.set(cacheKey, result);

  return result;
});

const exchangeTickersCache = new NodeCache({ stdTTL: 43200 });

async function fetchExchangeTickers(exchange: string) {
  const cache = exchangeTickersCache.get(exchange);
  if (cache) {
    console.log(`exchangeTickersCache hit for ${exchange}`);
    return cache;
  }

  console.log(`exchangeTickersCache miss for ${exchange}, fetching`);
  const response = await fetch(
    `https://eodhistoricaldata.com/api/exchange-symbol-list/${exchange}?fmt=json&api_token=${getToken()}`
  );
  const result: any[] = await response.json();

  // Convert it to a map for fast random access
  const map: any = {};
  result.forEach((detail) => {
    map[detail.Code] = detail;
  });

  exchangeTickersCache.set(exchange, map);
  return map;
}

export const getStocksInfo = functions.https.onCall(async (data) => {
  const { tickers } = data;
  if (!Array.isArray(tickers)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You need to provide an array of tickers'
    );
  }

  console.log('getStocksInfo', tickers);

  const [firstTicker, ...restTickers] = tickers;
  const exchanges = [...new Set(tickers.map((ticker) => ticker.split('.')[1]))];

  const stockLivePrices = (async () =>
    fetch(
      `https://eodhistoricaldata.com/api/real-time/${firstTicker}?${
        restTickers.length ? `s=${restTickers.join(',')}&` : ''
      }fmt=json&api_token=${getToken()}`
    ))();
  const exchangeTickers = Promise.all(
    exchanges.map((exchange) => fetchExchangeTickers(exchange))
  );

  // Wait for all api calls to finish
  const [stockLivePricesResponse, exchangeTickersResults] = await Promise.all([
    stockLivePrices,
    exchangeTickers,
  ]);

  const stockLivePricesResult = await stockLivePricesResponse.json();

  const results = tickers.map((ticker) => {
    const [symbol, exchange] = ticker.split('.');
    const exchangeIndex = exchanges.indexOf(exchange);
    const livePrice = Array.isArray(stockLivePricesResult)
      ? stockLivePricesResult.find(
          ({ code }: { code: string }) => code === ticker
        )
      : stockLivePricesResult;

    const detail = exchangeTickersResults[exchangeIndex][symbol];

    return {
      Ticker: ticker,
      ...detail,
      Quote: livePrice.close,
      QuoteTimestamp: livePrice.timestamp,
      PrevClose: livePrice.previousClose,
      Change: livePrice.change,
      ChangePercent: livePrice.change_p,
    };
  });

  return results;
});
