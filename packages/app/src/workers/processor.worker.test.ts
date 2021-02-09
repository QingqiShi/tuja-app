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
