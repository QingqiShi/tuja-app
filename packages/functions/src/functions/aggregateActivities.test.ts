import fetch from 'node-fetch';
import firebaseTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';

jest.mock('node-fetch');
const mockFetch: jest.Mock = fetch as any;

const PORTFOLIO_ID = 'lTs48k0lPcWRtxjlpedN';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:5002';

let firebase: ReturnType<typeof firebaseTest>;
let aggregateActivities: Function;
beforeEach(() => {
  firebase = firebaseTest({
    databaseURL: 'http://localhost:5002/?ns=portfolio-mango',
    projectId: 'portfolio-mango',
  });
  firebase.mockConfig({ eodhistoricaldata: { token: 'test-api' } });
  aggregateActivities = firebase.wrap(require('../index').aggregateActivities);

  jest
    .spyOn(require('firebase-functions').logger, 'log')
    .mockImplementation(() => {
      /* Do nothing */
    });
});

afterEach(async () => {
  firebase.cleanup();

  const portfolioDocRef = admin.firestore().doc(`portfolios/${PORTFOLIO_ID}`);
  const portfolio = (await portfolioDocRef.get()).data();
  await portfolioDocRef.set({
    ...portfolio,
    costBasis: {
      'AAPL.US': 260,
      'SGLN.LSE': 12.5,
    },
  });
});

const LATEST_SNAPSHOT = {
  cash: 815,
  cashFlow: 1100,
  date: '2020-09-09',
  dividend: 0,
  numShares: {
    'AAPL.US': 4,
    'SGLN.LSE': 1,
  },
};

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
  expect(portfolio?.costBasis).toEqual({
    'AAPL.US': 260,
    'SGLN.LSE': 12.5,
  });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
});

test('handle activities that do not update cost basis', async () => {
  // Given
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'test',
      type: 'Deposit',
      date: '2020-10-29',
      amount: 500,
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
  expect(portfolio?.costBasis).toEqual({ 'AAPL.US': 260, 'SGLN.LSE': 12.5 });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
});

test('add new trade activity with single ticker', async () => {
  // Given
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'test',
      type: 'Trade',
      date: '2020-10-29',
      trades: [{ ticker: 'TSLA.US', units: 2 }],
      cost: 315.7 * 2,
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
  expect(portfolio?.costBasis).toEqual({
    'AAPL.US': 260,
    'SGLN.LSE': 12.5,
    'TSLA.US': 315.7,
  });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
});

test('add new trade activity with multiple tickers', async () => {
  // Given
  mockFetch.mockReturnValueOnce({
    // TSLA
    json: async () => ({ priceInCurrency: 315.7 }),
  });
  mockFetch.mockReturnValueOnce({
    // AAPL, half of curren cost
    json: async () => ({ priceInCurrency: 130 }),
  });
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'test',
      type: 'Trade',
      date: '2020-10-29',
      trades: [
        { ticker: 'TSLA.US', units: 2 },
        { ticker: 'AAPL.US', units: 4 },
      ],
      cost: 315.7 * 2 + 4 * 130,
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
  expect(portfolio?.costBasis).toEqual({
    'SGLN.LSE': 12.5,
    'AAPL.US': 195,
    'TSLA.US': 315.7,
  });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
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
      trades: [{ ticker: 'AAPL.US', units: -4 }], // Sell all
      cost: -500,
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
  expect(portfolio?.costBasis).toEqual({ 'AAPL.US': 0, 'SGLN.LSE': 12.5 });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
});

test('update existing trade activity', async () => {
  // Given
  mockFetch.mockReturnValue({
    json: async () => ({ priceInCurrency: 100 }),
  });
  const beforeSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'mJZBSCa9sGLMCOqDH1g2',
      type: 'Trade',
      date: '2020-09-09',
      cost: 25,
      trades: [{ ticker: 'SGLN.LSE', units: 1 }],
    },
    `portfolios/${PORTFOLIO_ID}/activities/mJZBSCa9sGLMCOqDH1g2`
  );
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'mJZBSCa9sGLMCOqDH1g2',
      type: 'Trade',
      date: '2020-09-09',
      cost: 75,
      trades: [{ ticker: 'SGLN.LSE', units: 3 }],
    },
    `portfolios/${PORTFOLIO_ID}/activities/mJZBSCa9sGLMCOqDH1g2`
  );
  const change = firebase.makeChange(beforeSnap, afterSnap);

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
  expect(portfolio?.costBasis).toEqual({ 'AAPL.US': 260, 'SGLN.LSE': 25 });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
});

test('remove existing trade activity', async () => {
  // Given
  mockFetch.mockReturnValue({
    json: async () => ({ priceInCurrency: 100 }),
  });
  const beforeSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'mJZBSCa9sGLMCOqDH1g2',
      type: 'Trade',
      date: '2020-09-09',
      cost: 25,
      trades: [{ ticker: 'SGLN.LSE', units: 1 }],
    },
    `portfolios/${PORTFOLIO_ID}/activities/mJZBSCa9sGLMCOqDH1g2`
  );
  const change = firebase.makeChange(beforeSnap, { data: () => undefined });

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
  expect(portfolio?.costBasis).toEqual({ 'AAPL.US': 260, 'SGLN.LSE': 0 });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
});

test('remove trade activity with multiple tickers', async () => {
  // Given
  mockFetch.mockReturnValueOnce({
    json: async () => ({ priceInCurrency: 315.7 }),
  });
  mockFetch.mockReturnValueOnce({
    json: async () => ({ priceInCurrency: 130 }),
  });
  const beforeSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'test',
      type: 'Trade',
      date: '2020-10-29',
      trades: [
        { ticker: 'TSLA.US', units: 2 },
        { ticker: 'AAPL.US', units: 2 },
      ],
      cost: 315.7 * 2 + 2 * 130,
    },
    `portfolios/${PORTFOLIO_ID}/activities/test`
  );
  const change = firebase.makeChange(beforeSnap, { data: () => undefined });

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
  expect(portfolio?.costBasis).toEqual({
    'SGLN.LSE': 12.5,
    'AAPL.US': 390,
    'TSLA.US': 315.7,
  });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.tuja.app/priceAt?ticker=TSLA.US&at=2020-10-29&currency=GBP'
  );
  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.tuja.app/priceAt?ticker=AAPL.US&at=2020-10-29&currency=GBP'
  );
});

test('add new stock dividend activity', async () => {
  // Given
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'test',
      type: 'StockDividend',
      date: '2020-10-29',
      ticker: 'AAPL.US',
      units: 4, // Double the amount
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
  expect(portfolio?.costBasis).toEqual({ 'AAPL.US': 130, 'SGLN.LSE': 12.5 });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
});

test('update existing stock dividend activity', async () => {
  // Given
  const beforeSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: '3obnebNdqjoS7u9GXpVo',
      type: 'StockDividend',
      date: '2020-08-31',
      ticker: 'AAPL.US',
      units: 3,
    },
    `portfolios/${PORTFOLIO_ID}/activities/3obnebNdqjoS7u9GXpVo`
  );
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: '3obnebNdqjoS7u9GXpVo',
      type: 'StockDividend',
      date: '2020-08-31',
      ticker: 'AAPL.US',
      units: 7,
    },
    `portfolios/${PORTFOLIO_ID}/activities/3obnebNdqjoS7u9GXpVo`
  );
  const change = firebase.makeChange(beforeSnap, afterSnap);

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
  expect(portfolio?.costBasis).toEqual({ 'AAPL.US': 130, 'SGLN.LSE': 12.5 });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
});

test('stock dividend activity that clears cost basis', async () => {
  // Given
  const beforeSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: '3obnebNdqjoS7u9GXpVo',
      type: 'StockDividend',
      date: '2020-08-31',
      ticker: 'AAPL.US',
      units: 3,
    },
    `portfolios/${PORTFOLIO_ID}/activities/3obnebNdqjoS7u9GXpVo`
  );
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: '3obnebNdqjoS7u9GXpVo',
      type: 'StockDividend',
      date: '2020-08-31',
      ticker: 'AAPL.US',
      units: -1,
    },
    `portfolios/${PORTFOLIO_ID}/activities/3obnebNdqjoS7u9GXpVo`
  );
  const change = firebase.makeChange(beforeSnap, afterSnap);

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
  expect(portfolio?.costBasis).toEqual({ 'AAPL.US': 0, 'SGLN.LSE': 12.5 });
  expect(portfolio?.latestSnapshot).toEqual(LATEST_SNAPSHOT);
});
