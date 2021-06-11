import dayjs from 'dayjs';
import { TimeSeries } from '@tuja/libs';
import {
  fetchStockHistories,
  fetchStockInfos,
  fetchStockLivePrices,
  fetchStockLogo,
  fetchStockSearch,
  fetchStocksPrices,
} from './apiClient';

describe('fetchStockInfos', () => {
  test('make network call', async () => {
    const result = await fetchStockInfos(['IUSA.LSE']);
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/bulkInfos?tickers=IUSA.LSE'
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ Ticker: 'IUSA.LSE' });
  });

  test('batch requests', async () => {
    const result = await fetchStockInfos([
      'IWDP.LSE',
      'AAPL.US',
      'IUSA.LSE',
      'IUS3.XETRA',
      'SGLN.LSE',
      'HMCH.LSE',
      'T.US',
      'USSC.LSE',
      'VWRL.LSE',
    ]);
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/bulkInfos?tickers=IWDP.LSE,AAPL.US,IUSA.LSE,IUS3.XETRA,SGLN.LSE,HMCH.LSE'
    );
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/bulkInfos?tickers=T.US,USSC.LSE,VWRL.LSE'
    );
    expect(result).toHaveLength(9);
    expect(result[0]).toMatchObject({ Ticker: 'IWDP.LSE' });
    expect(result[5]).toMatchObject({ Ticker: 'HMCH.LSE' });
    expect(result[6]).toMatchObject({ Ticker: 'T.US' });
    expect(result[8]).toMatchObject({ Ticker: 'VWRL.LSE' });
  });
});

describe('fetchStockLivePrices', () => {
  test('make network call', async () => {
    const result = await fetchStockLivePrices(['IUSA.LSE']);
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/bulkLivePrices?tickers=IUSA.LSE'
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: 'IUSA.LSE',
      timestamp: 1614702540,
      gmtoffset: 0,
      open: 2787.9331,
      high: 2797.25,
      low: 2772.71,
      close: 2777.375,
      volume: 287103,
      previousClose: 2784.875,
      change: -7.5,
      change_p: -0.2693,
    });
  });

  test('batch requests', async () => {
    const result = await fetchStockLivePrices([
      'IWDP.LSE',
      'AAPL.US',
      'IUSA.LSE',
      'IUS3.XETRA',
      'SGLN.LSE',
      'HMCH.LSE',
      'T.US',
      'USSC.LSE',
      'VWRL.LSE',
    ]);
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/bulkLivePrices?tickers=IWDP.LSE,AAPL.US,IUSA.LSE,IUS3.XETRA,SGLN.LSE,HMCH.LSE'
    );
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/bulkLivePrices?tickers=T.US,USSC.LSE,VWRL.LSE'
    );
    expect(result).toHaveLength(9);
    expect(result[0]).toMatchObject({ code: 'IWDP.LSE' });
    expect(result[5]).toMatchObject({ code: 'HMCH.LSE' });
    expect(result[6]).toMatchObject({ code: 'T.US' });
    expect(result[8]).toMatchObject({ code: 'VWRL.LSE' });
  });
});

describe('fetchStockHistories', () => {
  test('make network call', async () => {
    const result = await fetchStockHistories([
      {
        ticker: 'IUSA.LSE',
        from: dayjs('2021-02-08', 'YYYY-MM-DD').toDate(),
        to: dayjs('2021-02-09', 'YYYY-MM-DD').toDate(),
      },
    ]);
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/bulkEods?query=%5B%7B%22ticker%22%3A%22IUSA.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%5D'
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      ticker: 'IUSA.LSE',
      from: dayjs('2021-02-08', 'YYYY-MM-DD').toDate(),
      to: dayjs('2021-02-09', 'YYYY-MM-DD').toDate(),
      closeSeries: expect.any(TimeSeries),
      adjustedSeries: expect.any(TimeSeries),
    });
  });

  test('batch requests', async () => {
    const date = (str: string) => dayjs(str, 'YYYY-MM-DD').toDate();
    const result = await fetchStockHistories([
      { ticker: 'AAPL.US', from: date('2021-02-08'), to: date('2021-02-09') },
      { ticker: 'HMCH.LSE', from: date('2021-02-08'), to: date('2021-02-09') },
      { ticker: 'IUSA.LSE', from: date('2021-02-08'), to: date('2021-02-09') },
      { ticker: 'IWDP.LSE', from: date('2021-02-08'), to: date('2021-02-09') },
      {
        ticker: 'IUS3.XETRA',
        from: date('2021-02-08'),
        to: date('2021-02-09'),
      },
      { ticker: 'SGLN.LSE', from: date('2021-02-08'), to: date('2021-02-09') },
      { ticker: 'DIS.US', from: date('2021-02-08'), to: date('2021-02-09') },
      { ticker: 'FB.US', from: date('2021-02-08'), to: date('2021-02-09') },
    ]);
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/bulkEods?query=%5B%7B%22ticker%22%3A%22AAPL.US%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22HMCH.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22IUSA.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22IWDP.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22IUS3.XETRA%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22SGLN.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%5D'
    );
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/bulkEods?query=%5B%7B%22ticker%22%3A%22DIS.US%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22FB.US%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%5D'
    );
    expect(result).toHaveLength(8);
    expect(result[0]).toMatchObject({ ticker: 'AAPL.US' });
    expect(result[5]).toMatchObject({ ticker: 'SGLN.LSE' });
    expect(result[6]).toMatchObject({ ticker: 'DIS.US' });
    expect(result[7]).toMatchObject({ ticker: 'FB.US' });
  });
});

describe('fetchStockSearch', () => {
  test('make network call', async () => {
    const { fetch } = fetchStockSearch('Apple Inc');
    const result = await fetch();
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/search?query=Apple%20Inc',
      expect.anything()
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      Code: 'AAPL',
      Country: 'USA',
      Currency: 'USD',
      Exchange: 'US',
      ISIN: 'US0378331005',
      Name: 'Apple Inc',
      Ticker: 'AAPL.US',
      Type: 'Common Stock',
      previousClose: 126.74,
    });
  });

  test('cancel call', async () => {
    const { cancel, fetch } = fetchStockSearch('Apple Inc');
    cancel();
    expect(fetch()).rejects.toMatchObject({ message: 'fake abort error' });
  });
});

describe('fetchStocksPrices', () => {
  test('make network call', async () => {
    const { fetch } = fetchStocksPrices(
      ['AAPL.US'],
      dayjs('2021-02-08', 'YYYY-MM-DD').toDate(),
      'GBP'
    );
    const result = await fetch();
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/priceAt?ticker=AAPL.US&at=2021-02-08&currency=GBP',
      expect.anything()
    );
    expect(result).toMatchObject({
      'AAPL.US': {
        price: 127.145,
        priceInCurrency: 90.120376,
        ticker: 'AAPL.US',
      },
    });
  });

  test('make multiple network call', async () => {
    const { fetch } = fetchStocksPrices(
      ['AAPL.US', 'IUSA.LSE'],
      dayjs('2021-02-08', 'YYYY-MM-DD').toDate(),
      'GBP'
    );
    const result = await fetch();
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/priceAt?ticker=AAPL.US&at=2021-02-08&currency=GBP',
      expect.anything()
    );
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/priceAt?ticker=IUSA.LSE&at=2021-02-08&currency=GBP',
      expect.anything()
    );
    expect(result).toMatchObject({
      'AAPL.US': {
        price: 127.145,
        priceInCurrency: 90.120376,
        ticker: 'AAPL.US',
      },
      'IUSA.LSE': {
        price: 29.91625,
        priceInCurrency: 29.91625,
        ticker: 'IUSA.LSE',
      },
    });
  });

  test('cancel call', async () => {
    const { cancel, fetch } = fetchStocksPrices(
      ['AAPL.US'],
      dayjs('2021-02-08', 'YYYY-MM-DD').toDate(),
      'GBP'
    );
    cancel();
    expect(fetch()).rejects.toMatchObject({ message: 'fake abort error' });
  });
});

describe('fetchStockLogo', () => {
  test('make network call', async () => {
    const result = await fetchStockLogo('AAPL.US', 'Apple');
    expect(window.fetch).toHaveBeenCalledWith(
      'http://localhost/stockLogo?ticker=AAPL.US&name=Apple&size=108'
    );
    expect(result).toBe('data:application/octet-stream;base64,');
  });
});
