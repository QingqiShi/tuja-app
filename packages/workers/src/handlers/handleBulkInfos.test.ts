import { Request, Response } from 'node-fetch';
import { handleBulkInfos } from './handleBulkInfos';

declare const global: { [key: string]: unknown };

// Setup worker globals
beforeEach(async () => {
  global.fetch = jest.fn();
  global.Response = Response;
  global.EOD_API_KEY = 'test-api';
});

test('get stocks infos', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    json: async () => [
      { Code: 'A', Exchange: 'Foo', Currency: 'A-C' },
      { Code: 'B', Exchange: 'Bar', Currency: 'B-C' },
      { Code: 'C', Exchange: 'Baz', Currency: 'C-C' },
    ],
  });
  const request = new Request(
    'http://localhost/bulkInfos?tickers=C.Baz,B.Bar,A.Foo'
  );

  // When
  const response = await handleBulkInfos(request as never);

  // Then
  expect(
    global.fetch as jest.Mock
  ).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/C.Baz?api_token=test-api',
    { cf: { cacheEverything: true, cacheTtl: 2592000 } }
  );
  expect(
    global.fetch as jest.Mock
  ).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/B.Bar?api_token=test-api',
    { cf: { cacheEverything: true, cacheTtl: 2592000 } }
  );
  expect(
    global.fetch as jest.Mock
  ).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/A.Foo?api_token=test-api',
    { cf: { cacheEverything: true, cacheTtl: 2592000 } }
  );
  expect(await response.json()).toEqual([
    { Ticker: 'C.Baz', Code: 'C', Exchange: 'Baz', Currency: 'C-C' },
    { Ticker: 'B.Bar', Code: 'B', Exchange: 'Bar', Currency: 'B-C' },
    { Ticker: 'A.Foo', Code: 'A', Exchange: 'Foo', Currency: 'A-C' },
  ]);
  expect(response.status).toBe(200);
});

test('correct previous close price', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValue({
    json: async () => [
      { Code: 'IHHG', Exchange: 'LSE', Currency: 'GBP', previousClose: 200 },
    ],
  });
  const request = new Request('http://localhost/bulkInfos?tickers=IHHG.LSE');

  // When
  const response = await handleBulkInfos(request as never);

  // Then
  expect(
    global.fetch as jest.Mock
  ).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/IHHG.LSE?api_token=test-api',
    { cf: { cacheEverything: true, cacheTtl: 2592000 } }
  );
  expect(await response.json()).toEqual([
    {
      Ticker: 'IHHG.LSE',
      Code: 'IHHG',
      Exchange: 'LSE',
      Currency: 'GBP',
      previousClose: 2,
    },
  ]);
  expect(response.status).toBe(200);
});

test('error when missing tickers', async () => {
  // Given
  const request = new Request('http://localhost/bulkInfos');

  // When
  const response = await handleBulkInfos(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing tickers');
  expect(response.status).toBe(400);
});

test('error when tickers not a list', async () => {
  // Given
  const request = new Request('http://localhost/bulkInfos?tickers=');

  // When
  const response = await handleBulkInfos(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing tickers');
  expect(response.status).toBe(400);
});

test('error when more than 6 tickers', async () => {
  // Given
  const request = new Request(
    'http://localhost/bulkInfos?tickers=A,B,C,D,E,F,G'
  );

  // When
  const response = await handleBulkInfos(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('No more than 6 tickers');
  expect(response.status).toBe(400);
});

test('error when missing api key', async () => {
  // Given
  global.EOD_API_KEY = '';
  const request = new Request('http://localhost/bulkInfos?tickers=A,B,C');

  // When
  const response = await handleBulkInfos(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing API Key');
  expect(response.status).toBe(500);
});

test('get overridden stocks infos', async () => {
  // Given
  const request = new Request('http://localhost/bulkInfos?tickers=VVAL.LSE');

  // When
  const response = await handleBulkInfos(request as never);

  // Then
  expect(await response.json()).toEqual([
    {
      Code: 'VVAL',
      Country: 'UK',
      Currency: 'GBP',
      Exchange: 'LSE',
      ISIN: 'IE00BYYR0B57',
      Name: 'Vanguard Global Value Factor UCITS ETF Shares USD Acc',
      Ticker: 'VVAL.LSE',
      Type: 'ETF',
      previousClose: 0,
    },
  ]);
  expect(response.status).toBe(200);
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
});
