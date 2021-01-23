import { Request, Response } from 'node-fetch';
import dayjs from 'dayjs';
// import { stocksClient } from '@tuja/libs';
import { handlePriceAt } from './handlePriceAt';

declare const global: { [key: string]: unknown };

// Setup worker globals
beforeAll(async () => {
  global.fetch = jest.fn();
  global.Response = Response;
  global.EOD_API_KEY = 'test-api';
});

test('get price of ticker at historic date', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => [
      { date: '2021-01-01', close: 5 },
      { date: '2021-01-02', close: 10 },
    ],
  });
  const request = new Request(
    'http://localhost/priceAt?ticker=AAPL.US&at=2021-01-02'
  );

  // When
  const response = await handlePriceAt(request as never);

  // Then
  expect(
    global.fetch as jest.Mock
  ).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/eod/AAPL.US?from=2020-12-28&to=2021-01-02&fmt=json&api_token=test-api',
    { cf: { cacheEverything: true, cacheTtl: 2592000 } }
  );
  expect(await response.json()).toEqual({
    price: 10,
    priceInCurrency: 10,
    ticker: 'AAPL.US',
  });
  expect(response.status).toBe(200);
});

test('get price of ticker at current date', async () => {
  // Given
  const date = dayjs().format('YYYY-MM-DD');
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => ({ date, close: 10 }),
  });
  const request = new Request(
    `http://localhost/priceAt?ticker=AAPL.US&at=${date}`
  );

  // When
  const response = await handlePriceAt(request as never);

  // Then
  expect(global.fetch as jest.Mock).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/real-time/AAPL.US?fmt=json&api_token=test-api'
  );
  expect(await response.json()).toEqual({
    price: 10,
    priceInCurrency: 10,
    ticker: 'AAPL.US',
  });
  expect(response.status).toBe(200);
});

test('get price of ticker with currency conversion', async () => {
  // Given
  const date = dayjs().format('YYYY-MM-DD');
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => [{ Code: 'AAPL', Exchange: 'US', Currency: 'USD' }],
  });
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => ({ date, close: 10 }),
  });
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => ({ date, close: 0.7 }),
  });
  const request = new Request(
    `http://localhost/priceAt?ticker=AAPL.US&at=${date}&currency=GBP`
  );

  // When
  const response = await handlePriceAt(request as never);

  // Then
  expect(global.fetch as jest.Mock).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/real-time/AAPL.US?fmt=json&api_token=test-api'
  );
  expect(await response.json()).toEqual({
    price: 10,
    priceInCurrency: 7,
    ticker: 'AAPL.US',
  });
  expect(response.status).toBe(200);
});

test('error when missing ticker', async () => {
  // Given
  const request = new Request('http://localhost/priceAt');

  // When
  const response = await handlePriceAt(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing ticker');
  expect(response.status).toBe(400);
});

test('error when missing at', async () => {
  // Given
  const request = new Request('http://localhost/priceAt?ticker=AAPL.US');

  // When
  const response = await handlePriceAt(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing at');
  expect(response.status).toBe(400);
});

test('error when missing api key', async () => {
  // Given
  global.EOD_API_KEY = '';
  const request = new Request(
    'http://localhost/priceAt?ticker=test&at=2021-01-22'
  );

  // When
  const response = await handlePriceAt(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing API Key');
  expect(response.status).toBe(500);
});
