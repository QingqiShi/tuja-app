import dayjs from 'dayjs';
import { TimeSeries } from '@tuja/libs';
import BacktestWorker from './backtest.worker.ts?worker';
import { mockCachedData, nextTick } from '../../testUtils';

const startDate = dayjs('1970-01-01', 'YYYY-MM-DD').toDate();
const endDate = new Date();
const stocksData: any = {
  stocksInfo: [
    {
      Ticker: 'VTSMX.US',
      Name: 'VANGUARD TOTAL STOCK MARKET INDEX FUND INVESTOR SHARES',
      Code: 'VTSMX',
      Country: 'USA',
      Exchange: 'US',
      Currency: 'USD',
    },
    {
      Ticker: 'VBMFX.US',
      Name: 'VANGUARD TOTAL BOND MARKET INDEX FUND INVESTOR SHARES',
      Code: 'VBMFX',
      Country: 'USA',
      Exchange: 'US',
      Currency: 'USD',
    },
  ],
  stocksHistory: [
    {
      ticker: 'VTSMX.US',
      range: { startDate, endDate },
      adjusted: new TimeSeries({
        data: [
          [dayjs('2021-06-09', 'YYYY-MM-DD').toDate(), 100],
          [dayjs('2021-06-10', 'YYYY-MM-DD').toDate(), 120],
          [dayjs('2021-06-11', 'YYYY-MM-DD').toDate(), 108],
        ],
      }),
    },
    {
      ticker: 'VBMFX.US',
      range: { startDate, endDate },
      adjusted: new TimeSeries({
        data: [
          [dayjs('2021-06-09', 'YYYY-MM-DD').toDate(), 20],
          [dayjs('2021-06-10', 'YYYY-MM-DD').toDate(), 20.2],
          [dayjs('2021-06-11', 'YYYY-MM-DD').toDate(), 20.604],
        ],
      }),
    },
  ],
};

test('creates worker', () => {
  const worker = new BacktestWorker();
  expect(worker).not.toBeNull();
});

test('calculate backtest result', async () => {
  await mockCachedData(stocksData);

  const handleMessage = jest.fn();
  const worker = new BacktestWorker();
  worker.addEventListener('message', handleMessage);
  worker.postMessage({
    assets: [
      { ticker: 'VTSMX.US', label: 'Total stock market', percentage: 0.6 },
      { ticker: 'VBMFX.US', label: 'Total bond market', percentage: 0.4 },
    ],
    baseCurrency: 'USD',
    inflationRate: 0,
  });
  await nextTick();

  expect(handleMessage).toHaveBeenCalledWith({
    data: {
      data: [
        [dayjs('2021-06-09', 'YYYY-MM-DD').toDate(), 1],
        [dayjs('2021-06-10', 'YYYY-MM-DD').toDate(), 1.124],
        [dayjs('2021-06-11', 'YYYY-MM-DD').toDate(), 1.06008],
      ],
    },
  });
});

test('adjust for inflation', async () => {
  await mockCachedData(stocksData);

  const handleMessage = jest.fn();
  const worker = new BacktestWorker();
  worker.addEventListener('message', handleMessage);
  worker.postMessage({
    assets: [
      { ticker: 'VTSMX.US', label: 'Total stock market', percentage: 0.6 },
      { ticker: 'VBMFX.US', label: 'Total bond market', percentage: 0.4 },
    ],
    baseCurrency: 'USD',
    inflationRate: 3.65, // roughly 1% per day
  });
  await nextTick();

  expect(handleMessage).toHaveBeenCalledWith({
    data: {
      data: [
        [dayjs('2021-06-09', 'YYYY-MM-DD').toDate(), 1],
        [dayjs('2021-06-10', 'YYYY-MM-DD').toDate(), 1.1193659265454607],
        [dayjs('2021-06-11', 'YYYY-MM-DD').toDate(), 1.051356936151896],
      ],
    },
  });
});

test('terminate worker', async () => {
  const handleMessage = jest.fn();
  const worker = new BacktestWorker();
  worker.addEventListener('message', handleMessage);
  worker.terminate();
  worker.postMessage({ assets: [], baseCurrency: 'USD', inflationRate: 0 });
  await nextTick();

  expect(handleMessage).not.toHaveBeenCalled();
});
