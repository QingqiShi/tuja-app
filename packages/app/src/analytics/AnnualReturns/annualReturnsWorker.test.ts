import dayjs from 'dayjs';
import { TimeSeries } from '@tuja/libs';
import AnnualReturnsWorker from './annualReturns.worker.ts?worker';
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
          [dayjs('2008-01-01', 'YYYY-MM-DD').toDate(), 100],
          [dayjs('2009-01-01', 'YYYY-MM-DD').toDate(), 120],
          [dayjs('2010-01-01', 'YYYY-MM-DD').toDate(), 102],
        ],
      }),
    },
    {
      ticker: 'VBMFX.US',
      range: { startDate, endDate },
      adjusted: new TimeSeries({
        data: [
          [dayjs('2008-01-01', 'YYYY-MM-DD').toDate(), 20],
          [dayjs('2009-01-01', 'YYYY-MM-DD').toDate(), 22],
          [dayjs('2010-01-01', 'YYYY-MM-DD').toDate(), 24.2],
        ],
      }),
    },
  ],
};

test('creates worker', () => {
  const worker = new AnnualReturnsWorker();
  expect(worker).not.toBeNull();
});

test('calculate backtest result', async () => {
  await mockCachedData(stocksData);

  const handleMessage = jest.fn();
  const worker = new AnnualReturnsWorker();
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
    data: [0.16, -0.05517241379310345],
  });
});

test('adjust for inflation', async () => {
  await mockCachedData(stocksData);

  const handleMessage = jest.fn();
  const worker = new AnnualReturnsWorker();
  worker.addEventListener('message', handleMessage);
  worker.postMessage({
    assets: [
      { ticker: 'VTSMX.US', label: 'Total stock market', percentage: 0.6 },
      { ticker: 'VBMFX.US', label: 'Total bond market', percentage: 0.4 },
    ],
    baseCurrency: 'USD',
    inflationRate: 3.65, // 1% per day
  });
  await nextTick();

  expect(handleMessage).toHaveBeenCalledWith({
    data: [0.1484, -0.06462068965517241],
  });
});

test('terminate worker', async () => {
  const handleMessage = jest.fn();
  const worker = new AnnualReturnsWorker();
  worker.addEventListener('message', handleMessage);
  worker.terminate();
  worker.postMessage({ assets: [], baseCurrency: 'USD', inflationRate: 0 });
  await nextTick();

  expect(handleMessage).not.toHaveBeenCalled();
});
