import fetch from 'node-fetch';
import firebaseTest from 'firebase-functions-test';

const PORTFOLIO_ID = 'lTs48k0lPcWRtxjlpedN';
const PORTFOLIO = {
  id: 'lTs48k0lPcWRtxjlpedN',
  user: '9Lpx3JFjY5YErtjC4RowLwI6aCE3',
  name: 'Test',
  currency: 'GBP',
  cash: 815,
  activitiesStartDate: '2020-01-01',
  aliases: { 'AAPL.US': 'Apple', 'SGLN.LSE': 'Gold' },
  costBasis: { 'AAPL.US': 260, 'SGLN.LSE': 12.5 },
  targetAllocations: { 'AAPL.US': 0.5, 'SGLN.LSE': 0.5 },
  latestSnapshot: {
    cash: 815,
    cashFlow: 1100,
    date: '2020-09-09',
    dividend: 0,
    numShares: {
      'AAPL.US': 4,
      'SGLN.LSE': 1,
    },
  },
};
const PORTFOLIO_DOC = { get: async () => ({ data: () => PORTFOLIO }) };
const ACTIVITIES_QUERY = {
  orderBy(field: string, order: string) {
    if (field === 'date' && order === 'asc') {
      return this;
    }
    throw new Error(`unexpected query orderBy field=${field} order=${order}`);
  },
};
const SNAPSHOT_DOC = {};
const SNAPSHOT_NEW_DOC = {};
const SNAPSHOTS_QUERY = {
  listDocuments: () => [SNAPSHOT_DOC],
  doc: () => SNAPSHOT_NEW_DOC,
};
const SNAPSHOTS = [
  {
    cash: 340,
    cashFlow: 600,
    date: '2020-01-01',
    dividend: 0,
    numShares: { 'AAPL.US': 1 },
  },
  {
    cash: 840,
    cashFlow: 1100,
    date: '2020-06-16',
    dividend: 0,
    numShares: { 'AAPL.US': 1 },
  },
  {
    cash: 840,
    cashFlow: 1100,
    date: '2020-08-31',
    dividend: 0,
    numShares: { 'AAPL.US': 4 },
  },
  {
    cash: 815,
    cashFlow: 1100,
    date: '2020-09-09',
    dividend: 0,
    numShares: { 'AAPL.US': 4, 'SGLN.LSE': 1 },
  },
];
const DEFAULT_ACTIVITIES_DOCS = [
  {
    data: () => ({
      id: 'G9XbrVXcjCdKtILgKifX',
      date: '2020-01-01',
      type: 'Trade',
      cost: 260,
      trades: [{ ticker: 'AAPL.US', units: 1 }],
    }),
  },
  {
    data: () => ({
      id: 'QHapldYbuhY8Rs5MfbnN',
      date: '2020-01-01',
      type: 'Deposit',
      amount: 600,
    }),
  },
  {
    data: () => ({
      id: 'FVdTuNgQVkqzzNvVq8iG',
      date: '2020-06-16',
      type: 'Deposit',
      amount: 500,
    }),
  },
  {
    data: () => ({
      id: '3obnebNdqjoS7u9GXpVo',
      date: '2020-08-31',
      type: 'StockDividend',
      ticker: 'AAPL.US',
      units: 3,
    }),
  },
  {
    data: () => ({
      id: 'mJZBSCa9sGLMCOqDH1g2',
      date: '2020-09-09',
      type: 'Trade',
      cost: 25,
      trades: [{ ticker: 'SGLN.LSE', units: 1 }],
    }),
  },
];

const mockActivitiesDocs = {
  current: DEFAULT_ACTIVITIES_DOCS,
};

const mockDeleteDoc = jest.fn();
const mockSetDoc = jest.fn();
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    settings: jest.fn(),
    doc: (id: string) => {
      switch (id) {
        case `portfolios/${PORTFOLIO_ID}`:
          return PORTFOLIO_DOC;
        default:
          return {};
      }
    },
    collection: (id: string) => {
      switch (id) {
        case `portfolios/${PORTFOLIO_ID}/activities`:
          return ACTIVITIES_QUERY;
        case `portfolios/${PORTFOLIO_ID}/snapshots`:
          return SNAPSHOTS_QUERY;
        default:
          return {};
      }
    },
    runTransaction: async (cb: (t: any) => Promise<void>) =>
      cb({
        get: async (query: any) => {
          switch (query) {
            case ACTIVITIES_QUERY:
              return { docs: mockActivitiesDocs.current };
            default:
              return {};
          }
        },
        delete: mockDeleteDoc,
        set: mockSetDoc,
      }),
  }),
}));
jest.mock('node-fetch');
const mockFetch: jest.Mock = fetch as any;

let firebase: ReturnType<typeof firebaseTest>;
let aggregateActivities: Function;
beforeEach(() => {
  firebase = firebaseTest();
  firebase.mockConfig({ eodhistoricaldata: { token: 'test-api' } });
  aggregateActivities = firebase.wrap(require('../index').aggregateActivities);
  jest
    .spyOn(require('firebase-functions').logger, 'log')
    .mockImplementation(() => {
      /* Do nothing */
    });
});

afterEach(() => {
  firebase.cleanup();
  mockActivitiesDocs.current = DEFAULT_ACTIVITIES_DOCS;
});

test('skip triggered function based on activity field', async () => {
  // Given
  const after = {
    data: () => ({
      id: 'test',
      type: 'Deposit',
      date: '2020-10-29',
      amount: 1000,
      skipTrigger: true,
    }),
  };

  // When
  await aggregateActivities(
    { before: { data: () => undefined }, after },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockSetDoc).not.toHaveBeenCalled();
});

test('handle activities that do not update cost basis', async () => {
  // Given
  const activity = {
    id: 'test',
    type: 'Deposit',
    date: '2020-10-29',
    amount: 500,
  };
  const after = { data: () => activity };
  mockActivitiesDocs.current = [
    ...DEFAULT_ACTIVITIES_DOCS,
    { data: () => activity },
  ];

  // When
  await aggregateActivities(
    { before: { data: () => undefined }, after },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-10-29',
    snapshots: [
      ...SNAPSHOTS,
      {
        cash: 1315,
        cashFlow: 1600,
        date: '2020-10-29',
        dividend: 0,
        numShares: { 'AAPL.US': 4, 'SGLN.LSE': 1 },
      },
    ],
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    latestSnapshot: {
      ...PORTFOLIO.latestSnapshot,
      cash: 1315,
      cashFlow: 1600,
      date: '2020-10-29',
    },
  });
});

test('add new trade activity with single ticker', async () => {
  // Given
  const activity = {
    id: 'test',
    type: 'Trade',
    date: '2020-10-29',
    trades: [{ ticker: 'TSLA.US', units: 2 }],
    cost: 315.7 * 2,
  };
  const after = { data: () => activity };
  mockActivitiesDocs.current = [
    ...DEFAULT_ACTIVITIES_DOCS,
    { data: () => activity },
  ];

  // When
  await aggregateActivities(
    { before: { data: () => undefined }, after },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-10-29',
    snapshots: [
      ...SNAPSHOTS,
      {
        cash: 183.6,
        cashFlow: 1100,
        date: '2020-10-29',
        dividend: 0,
        numShares: { 'AAPL.US': 4, 'SGLN.LSE': 1, 'TSLA.US': 2 },
      },
    ],
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    latestSnapshot: {
      cash: 183.6,
      cashFlow: 1100,
      date: '2020-10-29',
      dividend: 0,
      numShares: { 'AAPL.US': 4, 'SGLN.LSE': 1, 'TSLA.US': 2 },
    },
    costBasis: { 'AAPL.US': 260, 'SGLN.LSE': 12.5, 'TSLA.US': 315.7 },
  });
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
  const activity = {
    id: 'test',
    type: 'Trade',
    date: '2020-10-29',
    trades: [
      { ticker: 'TSLA.US', units: 2 },
      { ticker: 'AAPL.US', units: 4 },
    ],
    cost: 315.7 * 2 + 4 * 130,
  };
  const after = { data: () => activity };
  mockActivitiesDocs.current = [
    ...DEFAULT_ACTIVITIES_DOCS,
    { data: () => activity },
  ];

  // When
  await aggregateActivities(
    { before: { data: () => undefined }, after },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.tuja.app/priceAt?ticker=TSLA.US&at=2020-10-29&currency=GBP'
  );
  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.tuja.app/priceAt?ticker=AAPL.US&at=2020-10-29&currency=GBP'
  );
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-10-29',
    snapshots: [
      ...SNAPSHOTS,
      {
        cash: -336.4,
        cashFlow: 1100,
        date: '2020-10-29',
        dividend: 0,
        numShares: { 'AAPL.US': 8, 'SGLN.LSE': 1, 'TSLA.US': 2 },
      },
    ],
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    latestSnapshot: {
      cash: -336.4,
      cashFlow: 1100,
      date: '2020-10-29',
      dividend: 0,
      numShares: { 'AAPL.US': 8, 'SGLN.LSE': 1, 'TSLA.US': 2 },
    },
    costBasis: { 'AAPL.US': 195, 'SGLN.LSE': 12.5, 'TSLA.US': 315.7 },
  });
});

test('add new trade activity to clear holdings and costs', async () => {
  // Given
  const activity = {
    id: 'test',
    type: 'Trade',
    date: '2020-10-29',
    trades: [{ ticker: 'AAPL.US', units: -4 }], // Sell all
    cost: -500,
  };
  const after = { data: () => activity };
  mockActivitiesDocs.current = [
    ...DEFAULT_ACTIVITIES_DOCS,
    { data: () => activity },
  ];

  // When
  await aggregateActivities(
    { before: { data: () => undefined }, after },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-10-29',
    snapshots: [
      ...SNAPSHOTS,
      {
        cash: 1315,
        cashFlow: 1100,
        date: '2020-10-29',
        dividend: 0,
        numShares: { 'AAPL.US': 0, 'SGLN.LSE': 1 },
      },
    ],
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    latestSnapshot: {
      cash: 1315,
      cashFlow: 1100,
      date: '2020-10-29',
      dividend: 0,
      numShares: { 'AAPL.US': 0, 'SGLN.LSE': 1 },
    },
    costBasis: { 'AAPL.US': 0, 'SGLN.LSE': 12.5 },
  });
});

test('update existing trade activity', async () => {
  // Given
  mockFetch.mockReturnValue({ json: async () => ({ priceInCurrency: 100 }) });
  const beforeActivity = {
    id: 'mJZBSCa9sGLMCOqDH1g2',
    type: 'Trade',
    date: '2020-09-09',
    cost: 25,
    trades: [{ ticker: 'SGLN.LSE', units: 1 }],
  };
  const afterActivity = {
    id: 'mJZBSCa9sGLMCOqDH1g2',
    type: 'Trade',
    date: '2020-09-09',
    cost: 75,
    trades: [{ ticker: 'SGLN.LSE', units: 3 }],
  };
  const before = { data: () => beforeActivity };
  const after = { data: () => afterActivity };
  mockActivitiesDocs.current = DEFAULT_ACTIVITIES_DOCS.map((doc) =>
    doc.data().id === beforeActivity.id ? after : doc
  );

  // When
  await aggregateActivities(
    { before, after },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-09-09',
    // Last snapshot updated
    snapshots: [
      ...SNAPSHOTS.slice(0, SNAPSHOTS.length - 1),
      {
        ...SNAPSHOTS[SNAPSHOTS.length - 1],
        cash: 765,
        numShares: { 'AAPL.US': 4, 'SGLN.LSE': 3 },
      },
    ],
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    costBasis: { 'AAPL.US': 260, 'SGLN.LSE': 25 },
    latestSnapshot: {
      ...PORTFOLIO.latestSnapshot,
      cash: 765,
      numShares: { 'AAPL.US': 4, 'SGLN.LSE': 3 },
    },
  });
});

test('remove existing trade activity', async () => {
  // Given
  mockFetch.mockReturnValue({ json: async () => ({ priceInCurrency: 100 }) });
  const activity = {
    id: 'mJZBSCa9sGLMCOqDH1g2',
    type: 'Trade',
    date: '2020-09-09',
    cost: 25,
    trades: [{ ticker: 'SGLN.LSE', units: 1 }],
  };
  const before = { data: () => activity };
  mockActivitiesDocs.current = DEFAULT_ACTIVITIES_DOCS.filter(
    (doc) => doc.data().id !== activity.id
  );

  // When
  await aggregateActivities(
    { before, after: { data: () => undefined } },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-08-31',
    // Last snapshot removed
    snapshots: [...SNAPSHOTS.slice(0, SNAPSHOTS.length - 1)],
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    costBasis: { 'AAPL.US': 260, 'SGLN.LSE': 0 },
    latestSnapshot: SNAPSHOTS[SNAPSHOTS.length - 2],
  });
});

test('remove trade activity with multiple tickers', async () => {
  // Given
  mockFetch.mockReturnValueOnce({
    json: async () => ({ priceInCurrency: 315.7 }),
  });
  mockFetch.mockReturnValueOnce({
    json: async () => ({ priceInCurrency: 130 }),
  });
  const activity = {
    id: 'test',
    type: 'Trade',
    date: '2020-10-29',
    trades: [
      { ticker: 'TSLA.US', units: 2 },
      { ticker: 'AAPL.US', units: 2 },
    ],
    cost: 315.7 * 2 + 2 * 130,
  };
  const before = { data: () => activity };
  mockActivitiesDocs.current = DEFAULT_ACTIVITIES_DOCS.filter(
    (doc) => doc.data().id !== activity.id
  );

  // When
  await aggregateActivities(
    { before, after: { data: () => undefined } },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.tuja.app/priceAt?ticker=TSLA.US&at=2020-10-29&currency=GBP'
  );
  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.tuja.app/priceAt?ticker=AAPL.US&at=2020-10-29&currency=GBP'
  );
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-09-09',
    snapshots: SNAPSHOTS,
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    costBasis: { 'SGLN.LSE': 12.5, 'AAPL.US': 390, 'TSLA.US': 315.7 },
  });
});

test('add new stock dividend activity', async () => {
  // Given
  const activity = {
    id: 'test',
    type: 'StockDividend',
    date: '2020-10-29',
    ticker: 'AAPL.US',
    units: 4, // Double the amount
  };
  const after = { data: () => activity };
  mockActivitiesDocs.current = [
    ...DEFAULT_ACTIVITIES_DOCS,
    { data: () => activity },
  ];

  // When
  await aggregateActivities(
    { before: { data: () => undefined }, after },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-10-29',
    snapshots: [
      ...SNAPSHOTS,
      {
        date: '2020-10-29',
        cash: 815,
        cashFlow: 1100,
        dividend: 0,
        numShares: { 'AAPL.US': 8, 'SGLN.LSE': 1 },
      },
    ],
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    costBasis: { 'SGLN.LSE': 12.5, 'AAPL.US': 130 },
    latestSnapshot: {
      date: '2020-10-29',
      cash: 815,
      cashFlow: 1100,
      dividend: 0,
      numShares: { 'AAPL.US': 8, 'SGLN.LSE': 1 },
    },
  });
});

test('update existing stock dividend activity', async () => {
  // Given
  const beforeActivity = {
    id: '3obnebNdqjoS7u9GXpVo',
    type: 'StockDividend',
    date: '2020-08-31',
    ticker: 'AAPL.US',
    units: 3,
  };
  const afterActivity = {
    id: '3obnebNdqjoS7u9GXpVo',
    type: 'StockDividend',
    date: '2020-08-31',
    ticker: 'AAPL.US',
    units: 7,
  };
  const before = { data: () => beforeActivity };
  const after = { data: () => afterActivity };
  mockActivitiesDocs.current = DEFAULT_ACTIVITIES_DOCS.map((doc) =>
    doc.data().id === beforeActivity.id ? after : doc
  );

  // When
  await aggregateActivities(
    { before, after },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-09-09',
    // Last snapshot updated
    snapshots: [
      ...SNAPSHOTS.slice(0, SNAPSHOTS.length - 2),
      {
        ...SNAPSHOTS[SNAPSHOTS.length - 2],
        numShares: { 'AAPL.US': 8 },
      },
      {
        ...SNAPSHOTS[SNAPSHOTS.length - 1],
        numShares: { 'AAPL.US': 8, 'SGLN.LSE': 1 },
      },
    ],
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    costBasis: { 'AAPL.US': 130, 'SGLN.LSE': 12.5 },
    latestSnapshot: {
      ...PORTFOLIO.latestSnapshot,
      numShares: { 'AAPL.US': 8, 'SGLN.LSE': 1 },
    },
  });
});

test('stock dividend activity that clears cost basis', async () => {
  // Given
  const beforeActivity = {
    id: '3obnebNdqjoS7u9GXpVo',
    type: 'StockDividend',
    date: '2020-08-31',
    ticker: 'AAPL.US',
    units: 3,
  };
  const afterActivity = {
    id: '3obnebNdqjoS7u9GXpVo',
    type: 'StockDividend',
    date: '2020-08-31',
    ticker: 'AAPL.US',
    units: -1,
  };
  const before = { data: () => beforeActivity };
  const after = { data: () => afterActivity };
  mockActivitiesDocs.current = DEFAULT_ACTIVITIES_DOCS.map((doc) =>
    doc.data().id === beforeActivity.id ? after : doc
  );

  // When
  await aggregateActivities(
    { before, after },
    { params: { portfolioId: PORTFOLIO_ID } }
  );

  // Then
  expect(mockDeleteDoc).toHaveBeenCalledWith(SNAPSHOT_DOC);
  expect(mockSetDoc).toHaveBeenCalledWith(SNAPSHOT_NEW_DOC, {
    startDate: '2020-01-01',
    endDate: '2020-09-09',
    // Last snapshot updated
    snapshots: [
      ...SNAPSHOTS.slice(0, SNAPSHOTS.length - 2),
      {
        ...SNAPSHOTS[SNAPSHOTS.length - 2],
        numShares: { 'AAPL.US': 0 },
      },
      {
        ...SNAPSHOTS[SNAPSHOTS.length - 1],
        numShares: { 'AAPL.US': 0, 'SGLN.LSE': 1 },
      },
    ],
  });
  expect(mockSetDoc).toHaveBeenCalledWith(PORTFOLIO_DOC, {
    ...PORTFOLIO,
    costBasis: { 'AAPL.US': 0, 'SGLN.LSE': 12.5 },
    latestSnapshot: {
      ...PORTFOLIO.latestSnapshot,
      numShares: { 'AAPL.US': 0, 'SGLN.LSE': 1 },
    },
  });
});
