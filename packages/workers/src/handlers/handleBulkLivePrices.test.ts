import { Request, Response } from 'node-fetch';
import { handleBulkLivePrices } from './handleBulkLivePrices';

declare const global: { [key: string]: unknown };

// Setup worker globals
beforeAll(async () => {
  global.fetch = jest.fn();
  global.Response = Response;
  global.EOD_API_KEY = 'test-api';
});

test('get stocks live prices', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => ({ date: '2021-01-22', code: 'B.Bar', close: 10 }),
  });
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => ({ date: '2021-01-22', code: 'A.Foo', close: 15 }),
  });
  const request = new Request(
    'http://localhost/bulkLivePrices?tickers=B.Bar,A.Foo'
  );

  // When
  const response = await handleBulkLivePrices(request as never);

  // Then
  expect(global.fetch as jest.Mock).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/real-time/B.Bar?fmt=json&api_token=test-api'
  );
  expect(global.fetch as jest.Mock).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/real-time/A.Foo?fmt=json&api_token=test-api'
  );
  expect(await response.json()).toEqual([
    { date: '2021-01-22', code: 'B.Bar', close: 10 },
    { date: '2021-01-22', code: 'A.Foo', close: 15 },
  ]);
  expect(response.status).toBe(200);
});

test('correct previous close and change amount', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => ({
      date: '2021-01-22',
      code: 'VUKE.LSE',
      close: 6,
      previousClose: 400,
    }),
  });
  const request = new Request(
    'http://localhost/bulkLivePrices?tickers=VUKE.LSE'
  );

  // When
  const response = await handleBulkLivePrices(request as never);

  // Then
  expect(global.fetch as jest.Mock).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/real-time/VUKE.LSE?fmt=json&api_token=test-api'
  );
  expect(await response.json()).toEqual([
    {
      date: '2021-01-22',
      code: 'VUKE.LSE',
      close: 6,
      previousClose: 4,
      change: 2,
      change_p: 50,
    },
  ]);
  expect(response.status).toBe(200);
});

test('error when missing tickers', async () => {
  // Given
  const request = new Request('http://localhost/bulkLivePrices');

  // When
  const response = await handleBulkLivePrices(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing tickers');
  expect(response.status).toBe(400);
});

test('error when tickers not a list', async () => {
  // Given
  const request = new Request('http://localhost/bulkLivePrices?tickers=');

  // When
  const response = await handleBulkLivePrices(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing tickers');
  expect(response.status).toBe(400);
});

test('error when more than 6 tickers', async () => {
  // Given
  const request = new Request(
    'http://localhost/bulkLivePrices?tickers=A,B,C,D,E,F,G'
  );

  // When
  const response = await handleBulkLivePrices(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('No more than 6 tickers');
  expect(response.status).toBe(400);
});

test('error when missing api key', async () => {
  // Given
  global.EOD_API_KEY = '';
  const request = new Request('http://localhost/bulkLivePrices?tickers=A,B,C');

  // When
  const response = await handleBulkLivePrices(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing API Key');
  expect(response.status).toBe(500);
});
