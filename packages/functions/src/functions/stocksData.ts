import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

const getToken = () => functions.config().eodhistoricaldata.token;

export const searchStocks = functions.https.onCall(async (data) => {
  const { query } = data;
  if (typeof query !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You need to provide a search query'
    );
  }

  const response = await fetch(
    `https://eodhistoricaldata.com/api/search/${query}?api_token=${getToken()}`
  );
  const result = await response.json();

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

  const response = await fetch(
    `https://eodhistoricaldata.com/api/eod/${ticker}?from=${from}&to=${to}&fmt=json&api_token=${getToken()}`
  );
  const result = await response.json();

  return result;
});

export const getStocksInfo = functions.https.onCall(async (data) => {
  const { tickers } = data;
  if (!Array.isArray(tickers)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You need to provide an array of tickers'
    );
  }

  const dataStructure: { [exchange: string]: string[] } = {};
  tickers.forEach((ticker) => {
    const [symbol, exchange] = ticker.split('.');
    if (dataStructure[exchange]) {
      dataStructure[exchange].push(symbol);
    } else {
      dataStructure[exchange] = [symbol];
    }
  });

  const responses = await Promise.all(
    Object.keys(dataStructure).map((exchange) =>
      fetch(
        `https://eodhistoricaldata.com/api/eod-bulk-last-day/${exchange}?symbols=${dataStructure[
          exchange
        ].join(',')}&fmt=json&filter=extended&api_token=${getToken()}`
      )
    )
  );
  const results: {
    code: string;
    name: string;
    exchange_short_name: string;
  }[][] = await Promise.all(responses.map((response) => response.json()));

  return results.flatMap((x) => x);
});
