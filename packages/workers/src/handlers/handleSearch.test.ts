import { Request, Response } from 'node-fetch';
import { handleSearch } from './handleSearch';

declare const global: { [key: string]: unknown };

// Setup worker globals
beforeAll(async () => {
  global.fetch = jest.fn();
  global.Response = Response;
  global.EOD_API_KEY = 'test-api';
});

test('search', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    json: async () => [
      { Code: 'AAPL', Exchange: 'US' },
      { Code: 'Foo', Exchange: 'Bar' },
    ],
  });
  const request = new Request('http://localhost/search?query=apple');

  // When
  const response = await handleSearch(request as never);

  // Then
  expect(
    global.fetch as jest.Mock
  ).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/apple?api_token=test-api',
    { cf: { cacheEverything: true, cacheTtl: 2592000 } }
  );
  expect(await response.json()).toEqual([
    { Ticker: 'AAPL.US', Code: 'AAPL', Exchange: 'US' },
    { Ticker: 'Foo.Bar', Code: 'Foo', Exchange: 'Bar' },
  ]);
  expect(response.status).toBe(200);
});

test('error when missing query', async () => {
  // Given
  const request = new Request('http://localhost/search');

  // When
  const response = await handleSearch(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing query');
  expect(response.status).toBe(400);
});

test('error when missing api key', async () => {
  // Given
  global.EOD_API_KEY = '';
  const request = new Request('http://localhost/search?query=test');

  // When
  const response = await handleSearch(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing API Key');
  expect(response.status).toBe(500);
});
