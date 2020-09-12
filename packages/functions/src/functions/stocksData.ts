import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

const getToken = () => functions.config().eodhistoricaldata.token;

export const searchStocks = functions.https.onCall(async (data, { auth }) => {
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

export const stockLivePrice = functions.https.onCall(async (data, { auth }) => {
  const { ticker } = data;
  if (typeof ticker !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You need to provide a ticker symbole'
    );
  }

  const response = await fetch(
    `https://eodhistoricaldata.com/api/real-time/${ticker}?fmt=json&api_token=${getToken()}`
  );
  const result = await response.json();

  return result;
});

export const stockHistory = functions.https.onCall(async (data, { auth }) => {
  const { ticker, from, to } = data;
  if (typeof ticker !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You need to provide a ticker symbole'
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
