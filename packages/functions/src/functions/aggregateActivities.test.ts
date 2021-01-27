import fetch from 'node-fetch';
import firebaseTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';

jest.mock('node-fetch');
const mockFetch: jest.Mock = fetch as any;

const PORTFOLIO_ID = 'taGTIPHwuIlJzVtGs5Zg';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:5002';
const firebase = firebaseTest({
  databaseURL: 'http://localhost:5002/?ns=portfolio-mango',
  projectId: 'portfolio-mango',
});

let aggregateActivities: Function;
beforeAll(() => {
  firebase.mockConfig({ eodhistoricaldata: { token: 'test-api' } });
  const functions = require('../index');
  aggregateActivities = firebase.wrap(functions.aggregateActivities);
});

afterAll(async () => {
  firebase.cleanup();

  const portfolioDocRef = admin.firestore().doc(`portfolios/${PORTFOLIO_ID}`);
  const portfolio = (await portfolioDocRef.get()).data();
  await portfolioDocRef.set({
    ...portfolio,
    costBasis: {
      'AAPL.US': 91.96821932209735,
      'HMCH.LSE': 8.026445817894404,
      'IUS3.XETRA': 50.31748859651136,
      'IUSA.LSE': 26.838623591801067,
      'IWDP.LSE': 17.98286489135723,
      'MSFT.US': 162.907668,
      'NG.LSE': 0,
      'SGLN.LSE': 27.452687390548178,
      'UAA.US': 0,
      'VVAL.LSE': 22.415,
    },
  });
});

test('skip triggered function based on activity field', async () => {
  // Given
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'test',
      type: 'Deposit',
      date: '2020-10-29',
      amount: 1000,
      skipTrigger: true,
    },
    `portfolios/${PORTFOLIO_ID}/activities/test`
  );
  const change = firebase.makeChange({ data: () => undefined }, afterSnap);

  // When
  await aggregateActivities(change, {
    params: { portfolioId: PORTFOLIO_ID },
  });

  // Then
  const portfolioDoc = await admin
    .firestore()
    .doc(`portfolios/${PORTFOLIO_ID}`)
    .get();
  const portfolio = portfolioDoc.data();
  expect(portfolio?.costBasis).toMatchSnapshot();
  expect(portfolio?.latestSnapshot).toMatchSnapshot();
});

test('add new trade activity with single ticker', async () => {
  // Given
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'test',
      type: 'Trade',
      date: '2020-10-29',
      trades: [{ ticker: 'TSLA.US', units: 2 }],
      cost: 600,
    },
    `portfolios/${PORTFOLIO_ID}/activities/test`
  );
  const change = firebase.makeChange({ data: () => undefined }, afterSnap);

  // When
  await aggregateActivities(change, {
    params: { portfolioId: PORTFOLIO_ID },
  });

  // Then
  const portfolioDoc = await admin
    .firestore()
    .doc(`portfolios/${PORTFOLIO_ID}`)
    .get();
  const portfolio = portfolioDoc.data();
  expect(portfolio?.costBasis).toMatchSnapshot();
  expect(portfolio?.latestSnapshot).toMatchSnapshot();
});

test('add new trade activity with multiple tickers', async () => {
  // Given
  mockFetch.mockReturnValueOnce({
    json: async () => ({ priceInCurrency: 200 }),
  });
  mockFetch.mockReturnValueOnce({
    json: async () => ({ priceInCurrency: 100 }),
  });
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'test',
      type: 'Trade',
      date: '2020-10-29',
      trades: [
        { ticker: 'TSLA.US', units: 2 },
        { ticker: 'AAPL.US', units: 1 },
      ],
      cost: 600,
    },
    `portfolios/${PORTFOLIO_ID}/activities/test`
  );
  const change = firebase.makeChange({ data: () => undefined }, afterSnap);

  // When
  await aggregateActivities(change, {
    params: { portfolioId: PORTFOLIO_ID },
  });

  // Then
  const portfolioDoc = await admin
    .firestore()
    .doc(`portfolios/${PORTFOLIO_ID}`)
    .get();
  const portfolio = portfolioDoc.data();
  expect(portfolio?.costBasis).toMatchSnapshot();
  expect(portfolio?.latestSnapshot).toMatchSnapshot();
  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.tuja.app/priceAt?ticker=TSLA.US&at=2020-10-29&currency=GBP'
  );
  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.tuja.app/priceAt?ticker=AAPL.US&at=2020-10-29&currency=GBP'
  );
});

test('add new trade activity to clear holdings and costs', async () => {
  // Given
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'test',
      type: 'Trade',
      date: '2020-10-29',
      trades: [{ ticker: 'AAPL.US', units: -2.3911587 }],
      cost: -200,
    },
    `portfolios/${PORTFOLIO_ID}/activities/test`
  );
  const change = firebase.makeChange({ data: () => undefined }, afterSnap);

  // When
  await aggregateActivities(change, {
    params: { portfolioId: PORTFOLIO_ID },
  });

  // Then
  const portfolioDoc = await admin
    .firestore()
    .doc(`portfolios/${PORTFOLIO_ID}`)
    .get();
  const portfolio = portfolioDoc.data();
  expect(portfolio?.costBasis).toMatchSnapshot();
  expect(portfolio?.latestSnapshot).toMatchSnapshot();
});
