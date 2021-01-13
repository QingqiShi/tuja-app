import {
  activityToDb,
  activityFromDb,
  snapshotToDb,
  snapshotFromDb,
  snapshotBatchToDb,
  snapshotBatchFromDb,
  updateSnapshot,
  batchSnapshots,
  activityLabels,
} from './activities';

const timestamp = 1610491121494;
const date = new Date(1610491121494);
const dateDiffDay = new Date(1610323200000);
const dbDate = '2021-01-12';
const dateNoTime = new Date(date);
dateNoTime.setHours(0);
dateNoTime.setMinutes(0);
dateNoTime.setSeconds(0);
dateNoTime.setMilliseconds(0);

test('activityToDb', () => {
  expect(
    activityToDb({
      type: 'Deposit' as const,
      date,
      amount: 5,
      createdAt: date,
      updatedAt: date,
    })
  ).toEqual({
    type: 'Deposit' as const,
    date: dbDate,
    amount: 5,
    createdAt: timestamp,
    updatedAt: timestamp,
    skipTrigger: false,
  });
});

test('activityFromDb', () => {
  expect(
    activityFromDb({
      type: 'Deposit' as const,
      date: dbDate,
      amount: 5,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  ).toEqual({
    type: 'Deposit' as const,
    date: dateNoTime,
    amount: 5,
    createdAt: date,
    updatedAt: date,
  });
});

test('activityFromDb without createdAt and updatedAt', () => {
  expect(
    activityFromDb({
      type: 'Deposit' as const,
      date: dbDate,
      amount: 5,
    })
  ).toEqual({
    type: 'Deposit' as const,
    date: dateNoTime,
    amount: 5,
    createdAt: undefined,
    updatedAt: undefined,
  });
});

test('snapshotToDb', () => {
  expect(
    snapshotToDb({
      date,
      cashFlow: 5,
      cash: 100,
      dividend: 0,
      numShares: { 'AAPL.US': 1 },
    })
  ).toEqual({
    date: dbDate,
    cashFlow: 5,
    cash: 100,
    dividend: 0,
    numShares: { 'AAPL.US': 1 },
  });
});

test('snapshotFromDb', () => {
  expect(
    snapshotFromDb({
      date: dbDate,
      cashFlow: 5,
      cash: 100,
      dividend: 0,
      numShares: { 'AAPL.US': 1 },
    })
  ).toEqual({
    date: dateNoTime,
    cashFlow: 5,
    cash: 100,
    dividend: 0,
    numShares: { 'AAPL.US': 1 },
  });
});

test('snapshotBatchToDb', () => {
  expect(
    snapshotBatchToDb({
      startDate: date,
      endDate: date,
      snapshots: [
        {
          date,
          cashFlow: 5,
          cash: 100,
          dividend: 0,
          numShares: { 'AAPL.US': 1 },
        },
      ],
    })
  ).toEqual({
    startDate: dbDate,
    endDate: dbDate,
    snapshots: [
      {
        date: dbDate,
        cashFlow: 5,
        cash: 100,
        dividend: 0,
        numShares: { 'AAPL.US': 1 },
      },
    ],
  });
});

test('snapshotBatchFromDb', () => {
  expect(
    snapshotBatchFromDb({
      startDate: dbDate,
      endDate: dbDate,
      snapshots: [
        {
          date: dbDate,
          cashFlow: 5,
          cash: 100,
          dividend: 0,
          numShares: { 'AAPL.US': 1 },
        },
      ],
    })
  ).toEqual({
    startDate: dateNoTime,
    endDate: dateNoTime,
    snapshots: [
      {
        date: dateNoTime,
        cashFlow: 5,
        cash: 100,
        dividend: 0,
        numShares: { 'AAPL.US': 1 },
      },
    ],
  });
});

test.each([
  ['deposit', { type: 'Deposit' as const, date, amount: 0 }],
  ['dividend', { type: 'Dividend' as const, date, amount: 0 }],
  [
    'stock dividend',
    { type: 'StockDividend' as const, date, ticker: 'AAPL.US', units: 0 },
  ],
  ['trade', { type: 'Trade' as const, date, trades: [], cost: 0 }],
])('updateSnapshot same day keeps dividend for type %s', (_, activity) => {
  expect(
    updateSnapshot(activity as any, {
      date,
      cash: 0,
      cashFlow: 0,
      numShares: {},
      dividend: 5,
    })
  ).toEqual({ date, cash: 0, cashFlow: 0, numShares: {}, dividend: 5 });
});

test.each([
  ['deposit', { type: 'Deposit' as const, date, amount: 0 }],
  ['dividend', { type: 'Dividend' as const, date, amount: 0 }],
  [
    'stock dividend',
    { type: 'StockDividend' as const, date, ticker: 'AAPL.US', units: 0 },
  ],
  ['trade', { type: 'Trade' as const, date, trades: [], cost: 0 }],
])(
  'updateSnapshot different day resets dividend for type %s',
  (_, activity) => {
    expect(
      updateSnapshot(activity as any, {
        date: dateDiffDay,
        cash: 0,
        cashFlow: 0,
        numShares: {},
        dividend: 5,
      })
    ).toEqual({ date, cash: 0, cashFlow: 0, numShares: {}, dividend: 0 });
  }
);

test('updateSnapshot accumulates trades', () => {
  expect(
    updateSnapshot(
      {
        type: 'Trade' as const,
        date,
        trades: [
          { ticker: 'AAPL.US', units: 2 },
          { ticker: 'IUSA.LSE', units: 4 },
          { ticker: 'FB.US', units: 0 },
        ],
        cost: 100,
      },
      {
        date,
        cash: 100,
        cashFlow: 0,
        numShares: { 'IUSA.LSE': 1 },
        dividend: 5,
      }
    )
  ).toEqual({
    date,
    cash: 0,
    cashFlow: 0,
    numShares: { 'AAPL.US': 2, 'IUSA.LSE': 5 },
    dividend: 5,
  });
});

test('updateSnapshot accumulates existing stock dividends', () => {
  expect(
    updateSnapshot(
      { type: 'StockDividend' as const, date, ticker: 'AAPL.US', units: 3 },
      { date, cash: 0, cashFlow: 0, numShares: { 'AAPL.US': 1 }, dividend: 0 }
    )
  ).toEqual({
    date,
    cash: 0,
    cashFlow: 0,
    dividend: 0,
    numShares: { 'AAPL.US': 4 },
  });
});

test('updateSnapshot records new stock dividends', () => {
  expect(
    updateSnapshot(
      { type: 'StockDividend' as const, date, ticker: 'AAPL.US', units: 3 },
      { date, cash: 0, cashFlow: 0, numShares: {}, dividend: 0 }
    )
  ).toEqual({
    date,
    cash: 0,
    cashFlow: 0,
    dividend: 0,
    numShares: { 'AAPL.US': 3 },
  });
});

test('updateSnapshot handles invalid activity types', () => {
  expect(
    updateSnapshot({ type: 'Invalid' } as any, {
      date,
      cash: 5,
      cashFlow: 10,
      numShares: { 'AAPL.US': 5 },
      dividend: 5,
    })
  ).toEqual({
    date,
    cash: 5,
    cashFlow: 10,
    numShares: { 'AAPL.US': 5 },
    dividend: 5,
  });
});

test('batchSnapshots groups snapshots', () => {
  const snapshot = {
    date,
    cash: 5,
    cashFlow: 10,
    numShares: { 'AAPL.US': 5 },
    dividend: 5,
  };
  const oldSnapshot = { ...snapshot, date: dateDiffDay };
  const batches = batchSnapshots(
    [oldSnapshot, snapshot, snapshot, snapshot, snapshot],
    2
  );
  expect(batches).toHaveLength(3);
  expect(batches[2].snapshots).toHaveLength(1);
  expect(batches[0].startDate).toEqual(dateDiffDay);
  expect(batches[0].endDate).toEqual(date);
});

test('batchSnapshots default size', () => {
  const snapshot = {
    date,
    cash: 5,
    cashFlow: 10,
    numShares: { 'AAPL.US': 5 },
    dividend: 5,
  };
  const batches = batchSnapshots([snapshot, snapshot]);
  expect(batches).toHaveLength(1);
  expect(batches[0].snapshots).toHaveLength(2);
});

test('activityLabels', () => {
  expect(activityLabels({ type: 'Deposit' } as any)).toBe('Deposit');
  expect(activityLabels({ type: 'StockDividend' } as any)).toBe(
    'Stock Dividend'
  );
  expect(activityLabels({ type: 'Dividend' } as any)).toBe('Cash Dividend');
  expect(activityLabels({ type: 'Trade', cost: 50 } as any)).toBe('Buy');
  expect(activityLabels({ type: 'Trade', cost: 0 } as any)).toBe('Buy');
  expect(activityLabels({ type: 'Trade', cost: -50 } as any)).toBe('Sell');
});
