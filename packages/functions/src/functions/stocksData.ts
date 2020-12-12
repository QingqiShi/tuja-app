import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { validatePayload } from '../utils/validatePayload';
import { getCache } from '../utils/cache';

// Get EodHistoricalData API token from firebase config
const getToken = () => functions.config().eodhistoricaldata.token;

/* =====
Searching
*/

const _searchStocks = async (query: string) => {
  const searchStocksCache = await getCache('searchStocks');
  const stocksInfoCache = await getCache('stocksInfo');

  const cache = searchStocksCache.get(query);
  if (cache) {
    functions.logger.log('cache hit', { key: query });
    return cache;
  }

  functions.logger.log('cache miss', { key: query });
  const response = await fetch(
    `https://eodhistoricaldata.com/api/search/${query}?api_token=${getToken()}`
  );
  const result = (await response.json()).map((info: any) => {
    const stockInfo = {
      Ticker: `${info.Code}.${info.Exchange}`,
      ...info,
    };
    stocksInfoCache.set(stockInfo.Ticker, stockInfo);
    return stockInfo;
  });

  searchStocksCache.set(query, result);
  return result;
};

export const searchStocks = functions
  .runWith({ memory: '1GB' })
  .https.onCall(async (data) => {
    const { query } = validatePayload(data, { query: '' });
    functions.logger.log('query', { query });

    return _searchStocks(query);
  });

/* =====
Stock live price
*/

function _stocksLivePrices(tickers: string[]) {
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
    const { tickers } = validatePayload(data, { tickers: [''] });

    const livePrices = await _stocksLivePrices(tickers);
    return livePrices;
  });

/* =====
Historical data
*/

const _getHistories = async (tickers: string[], from: string, to: string) => {
  return Promise.all(
    tickers.map(async (ticker) => {
      const response = await fetch(
        `https://eodhistoricaldata.com/api/eod/${ticker}?from=${from}&to=${to}&fmt=json&api_token=${getToken()}`
      );
      const result = await response.json();
      return result;
    })
  );
};

export const stockHistory = functions
  .runWith({ memory: '1GB' })
  .https.onCall(async (data) => {
    const { ticker, from, to } = validatePayload(data, {
      ticker: '',
      from: '',
      to: '',
    });
    functions.logger.log('ticker', { ticker });

    const [result] = await _getHistories([ticker], from, to);
    return result;
  });

/* =====
Stock info
*/

const _getStockInfo = async (ticker: string) => {
  const stocksInfoCache = await getCache('stocksInfo');

  const cache = stocksInfoCache.get(ticker);
  if (cache) {
    functions.logger.log('cache hit', { key: ticker });
    return cache;
  }

  const searchResult = await _searchStocks(ticker.split('.')[0]);
  return searchResult?.find(
    ({ Ticker }: { Ticker: string }) => Ticker === ticker
  );
};

export const stocksInfo = functions
  .runWith({ memory: '1GB' })
  .https.onCall(async (data) => {
    const { tickers } = validatePayload(data, { tickers: [''] });
    functions.logger.log('tickers', { tickers });

    const results = await Promise.all(tickers.map(_getStockInfo));
    return results;
  });

/* =====
StocksPrices
*/

export const stocksPrices = functions
  .runWith({ memory: '1GB' })
  .https.onCall(async (data) => {
    const { tickers, date, currency } = validatePayload(data, {
      tickers: [''],
      date: '',
      currency: '',
    });

    const { normalizeForex, getForexPair } = await import('@tuja/libs');

    const DATE_FORMAT = 'YYYY-MM-DD';
    const { default: dayjs } = await import('dayjs');

    // Get info to figure out what currency to fetch
    console.log(tickers);
    const mappedStocksInfo = await Promise.all(tickers.map(_getStockInfo));
    const forexPairs = [
      ...new Set(
        mappedStocksInfo
          .map((info) => {
            const tickerCurrency = info.Currency;
            if (!tickerCurrency) return null;
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
      const livePrices = await _stocksLivePrices(tickersAndForexPairs);
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

    const histories = await _getHistories(
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

// TODO: use the search API to fetch stocks into?
