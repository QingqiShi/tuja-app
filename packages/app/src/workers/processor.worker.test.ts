import 'fake-indexeddb/auto';

let listenerType: string;
let messageHandler: (ev: { data: any }) => any;
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

test('process empty snapshots', async () => {
  await messageHandler({
    data: {
      type: 'process-portfolio',
      payload: {
        snapshots: [],
        baseCurrency: 'GBP',
        startDate: new Date(),
        endDate: new Date(),
        benchmark: null,
        portfolioId: 'xxx',
      },
    },
  });
  expect(postMessage).toHaveBeenCalledWith({
    payload: {
      benchmarkSeries: undefined,
      cashFlowSeries: { data: [] },
      gainSeries: { data: [] },
      holdings: {},
      id: 'xxx',
      lastSnapshot: undefined,
      monthlyDividends: { data: [] },
      totalHoldingsValue: 0,
      twrrSeries: { data: [] },
      valueSeries: { data: [] },
    },
    type: 'process-portfolio',
  });
});

test('happy path', async () => {
  await messageHandler({
    data: {
      type: 'process-portfolio',
      payload: {
        snapshots: [
          {
            cash: 416.2,
            cashFlow: 4996,
            date: new Date(1612656000000),
            dividend: 0,
            numShares: {
              'MSFT.US': 1,
            },
          },
          {
            cash: 216.2,
            cashFlow: 4996,
            date: new Date(1612742400000),
            dividend: 0,
            numShares: {
              'MSFT.US': 1,
              'AAPL.US': 1,
            },
          },
        ],
        baseCurrency: 'GBP',
        startDate: new Date(1612656000000),
        endDate: new Date(1612978120286),
        benchmark: null,
        portfolioId: 'xxx',
      },
    },
  });
  expect(postMessage).toHaveBeenCalledWith({
    payload: {
      benchmarkSeries: undefined,
      cashFlowSeries: {
        data: [
          [new Date('2021-02-07T00:00:00.000Z'), 4996],
          [new Date('2021-02-08T00:00:00.000Z'), 4996],
          [new Date('2021-02-09T00:00:00.000Z'), 4996],
          [new Date('2021-02-10T00:00:00.000Z'), 4996],
        ],
      },
      gainSeries: {
        data: [
          [new Date('2021-02-07T00:00:00.000Z'), 0],
          [new Date('2021-02-08T00:00:00.000Z'), -100.45388999999977],
          [new Date('2021-02-09T00:00:00.000Z'), -101.68188999999984],
          [new Date('2021-02-10T00:00:00.000Z'), -103.12082399999963],
        ],
      },
      monthlyDividends: { data: [] },
      twrrSeries: {
        data: [
          [new Date('2021-02-07T00:00:00.000Z'), 0],
          [new Date('2021-02-08T00:00:00.000Z'), -0.16946616231216005],
          [new Date('2021-02-09T00:00:00.000Z'), -0.17153780381175088],
          [new Date('2021-02-10T00:00:00.000Z'), -0.17396529191400834],
        ],
      },
      valueSeries: {
        data: [
          [new Date('2021-02-07T00:00:00.000Z'), 592.766654],
          [new Date('2021-02-08T00:00:00.000Z'), 492.31276399999996],
          [new Date('2021-02-09T00:00:00.000Z'), 491.084764],
          [new Date('2021-02-10T00:00:00.000Z'), 489.64583],
        ],
      },
      holdings: {
        'AAPL.US': {
          info: {
            Code: 'AAPL',
            Country: 'USA',
            Currency: 'USD',
            Exchange: 'US',
            ISIN: 'US0378331005',
            Name: 'Apple Inc',
            Ticker: 'AAPL.US',
            Type: 'Common Stock',
            previousClose: 135.37,
            previousCloseDate: '2021-02-12',
          },
          livePrice: {
            change: 0.24,
            change_p: 0.1776,
            close: 135.37,
            code: 'AAPL.US',
            date: new Date('2021-02-12T21:00:00.000Z'),
            gmtoffset: 0,
            high: 135.51,
            low: 133.6921,
            open: 134.35,
            previousClose: 135.13,
            timestamp: 1613163600,
            volume: 60145130,
          },
          units: 1,
          value: 97.88696999999999,
        },
        'MSFT.US': {
          info: {
            Code: 'MSFT',
            Country: 'USA',
            Currency: 'USD',
            Exchange: 'US',
            ISIN: 'US5949181045',
            Name: 'Microsoft Corporation',
            Ticker: 'MSFT.US',
            Type: 'Common Stock',
            previousClose: 244.99,
            previousCloseDate: '2021-02-12',
          },
          livePrice: {
            change: 0.5,
            change_p: 0.2045,
            close: 244.99,
            code: 'MSFT.US',
            date: new Date('2021-02-12T21:00:00.000Z'),
            gmtoffset: 0,
            high: 245.29,
            low: 242.74,
            open: 243.9332,
            previousClose: 244.49,
            timestamp: 1613163600,
            volume: 16561079,
          },
          units: 1,
          value: 175.55885999999998,
        },
      },
      id: 'xxx',
      lastSnapshot: {
        cash: 216.2,
        cashFlow: 4996,
        date: new Date('2021-02-08T00:00:00.000Z'),
        dividend: 0,
        numShares: {
          'AAPL.US': 1,
          'MSFT.US': 1,
        },
      },
      totalHoldingsValue: 273.44583,
    },
    type: 'process-portfolio',
  });
});
