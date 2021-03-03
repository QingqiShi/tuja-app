import 'fake-indexeddb/auto';
import type { MessageData } from './processor.worker';

let listenerType: string;
let messageHandler: (ev: { data: MessageData }) => any;
const postMessage = jest.fn();

beforeAll(() => {
  const mockAddEventListener = jest.fn();
  global.addEventListener = mockAddEventListener;
  global.postMessage = postMessage;
  require('./processor.worker');
  listenerType = mockAddEventListener.mock.calls[0][0];
  messageHandler = mockAddEventListener.mock.calls[0][1];
});

test('subscribe to message events', () => {
  expect(listenerType).toBe('message');
});

describe('handle invalid inputs', () => {
  test.each`
    name               | data
    ${'empty object'}  | ${{}}
    ${'other type'}    | ${{ type: 'other' }}
    ${'no payload'}    | ${{ type: 'process-portfolio' }}
    ${'empty payload'} | ${{ type: 'process-portfolio', payload: {} }}
  `('handle invalid input - $name', ({ data }) => {
    messageHandler({ data });
    expect(postMessage).toHaveBeenCalledWith(null);
  });
});

describe('happy path', () => {
  test('process empty snapshots', async () => {
    await messageHandler({
      data: {
        type: 'process-portfolio',
        payload: {
          snapshots: { xxx: [] },
          baseCurrency: 'GBP',
          startDate: new Date(),
          endDate: new Date(),
        },
      },
    });
    expect(postMessage).toHaveBeenCalledWith({
      type: 'process-portfolio',
      payload: {
        valueSeries: { data: [] },
        cashFlowSeries: { data: [] },
        gainSeries: { data: [] },
        monthlyDividends: { data: [] },
        portfolio: {
          id: 'xxx',
          valueSeries: { data: [] },
          cashFlowSeries: { data: [] },
          twrrSeries: { data: [] },
          gainSeries: { data: [] },
          monthlyDividends: { data: [] },
          totalHoldingsValue: 0,
          holdings: {},
        },
      },
    });
  });

  test('single portfolio and single snapshot', async () => {
    const snapshots = [
      {
        cash: 10,
        cashFlow: 4996,
        date: new Date(1612742400000),
        dividend: 0,
        numShares: {
          'IUSA.LSE': 1,
        },
      },
    ];
    await messageHandler({
      data: {
        type: 'process-portfolio',
        payload: {
          snapshots: { xxx: snapshots },
          baseCurrency: 'GBP',
          startDate: new Date(1612756000000),
          endDate: new Date(1612856000000),
          portfolioId: 'xxx',
        },
      },
    });

    const valueSeries = {
      data: [
        [new Date('2021-02-08T00:00:00.000Z'), 38.2775],
        [new Date('2021-02-09T00:00:00.000Z'), 38.238749999999996],
      ],
    };
    const cashFlowSeries = {
      data: [
        [new Date('2021-02-08T00:00:00.000Z'), 4996],
        [new Date('2021-02-09T00:00:00.000Z'), 4996],
      ],
    };
    const gainSeries = {
      data: [
        [new Date('2021-02-08T00:00:00.000Z'), 0],
        [new Date('2021-02-09T00:00:00.000Z'), -0.03874999999970896],
      ],
    };
    const monthlyDividends = { data: [] };
    expect(postMessage).toHaveBeenCalledWith({
      type: 'process-portfolio',
      payload: {
        valueSeries,
        cashFlowSeries,
        gainSeries,
        monthlyDividends,
        portfolio: {
          id: 'xxx',
          valueSeries,
          cashFlowSeries,
          gainSeries,
          twrrSeries: { data: [[new Date('2021-02-08T00:00:00.000Z'), 0]] },
          monthlyDividends,
          totalHoldingsValue: 28.238749999999996,
          lastSnapshot: snapshots[0],
          holdings: {
            'IUSA.LSE': {
              info: {
                Code: 'IUSA',
                Country: 'UK',
                Currency: 'GBX',
                Exchange: 'LSE',
                ISIN: 'IE0031442068',
                Name: 'iShares Core S&P 500 UCITS ETF USD Dist',
                Ticker: 'IUSA.LSE',
                Type: 'ETF',
                previousClose: 2777.375,
                previousCloseDate: '2021-03-02',
              },
              livePrice: {
                change: -7.5,
                change_p: -0.2693,
                close: 2777.375,
                code: 'IUSA.LSE',
                date: new Date('2021-03-02T16:29:00.000Z'),
                gmtoffset: 0,
                high: 2797.25,
                low: 2772.71,
                open: 2787.9331,
                previousClose: 2784.875,
                timestamp: 1614702540,
                volume: 287103,
              },
              units: 1,
              value: 28.23875,
            },
          },
        },
      },
    });
  });
});
