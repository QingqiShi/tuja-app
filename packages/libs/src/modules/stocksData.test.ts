import { stocksClient } from './stocksData';

const API_KEY = 'test_api_key';

// This test need to be run first
test('returns undefined if no options has ever been set', async () => {
  const client = stocksClient({});
  expect(await client.search('test')).toBeUndefined();
  expect(await client.livePrice('test')).toBeUndefined();
  expect(await client.info('test')).toBeUndefined();
  expect(await client.history('test', 'a', 'b')).toBeUndefined();
  expect(await client.priceAt('test', 'at', 'currency')).toBeUndefined();
});

// This test need to be run second
test('returns undefined if no options has ever been set', async () => {
  const client = stocksClient();
  expect(await client.search('test')).toBeUndefined();
  expect(await client.livePrice('test')).toBeUndefined();
  expect(await client.info('test')).toBeUndefined();
  expect(await client.history('test', 'a', 'b')).toBeUndefined();
  expect(await client.priceAt('test', 'at', 'currency')).toBeUndefined();
});

test('returns undefined if fetch not provided', async () => {
  const client = stocksClient({
    fetch: undefined,
    cachedFetch: undefined,
    apiKey: API_KEY,
  });
  expect(await client.search('test')).toBeUndefined();
  expect(await client.livePrice('test')).toBeUndefined();
  expect(await client.info('test')).toBeUndefined();
  expect(await client.history('test', 'a', 'b')).toBeUndefined();
  expect(await client.priceAt('test', 'at', 'currency')).toBeUndefined();
});

test('returns undefined if apiKey not provided', async () => {
  const client = stocksClient({
    fetch: jest.fn(),
    cachedFetch: jest.fn(),
    apiKey: undefined,
  });
  expect(await client.search('test')).toBeUndefined();
  expect(await client.livePrice('test')).toBeUndefined();
  expect(await client.info('test')).toBeUndefined();
  expect(await client.history('test', 'a', 'b')).toBeUndefined();
  expect(await client.priceAt('test', 'at', 'currency')).toBeUndefined();
});

test('search uses cached fetch and returns with Ticker', async () => {
  const fetch = jest.fn();
  const cachedFetch = jest.fn(async () => ({
    json: async () =>
      [
        {
          Code: 'AAPL',
          Exchange: 'US',
          Name: 'Apple',
          Type: 'Stock',
          Country: 'US',
          Currency: 'USD',
        },
      ] as any,
  }));
  const { search } = stocksClient({ fetch, cachedFetch, apiKey: API_KEY });

  const resultWithTicker = {
    Ticker: 'AAPL.US',
    Code: 'AAPL',
    Exchange: 'US',
    Name: 'Apple',
    Type: 'Stock',
    Country: 'US',
    Currency: 'USD',
  };
  expect(await search('test')).toEqual([resultWithTicker]);
  expect(fetch).not.toHaveBeenCalled();
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/test?api_token=test_api_key'
  );
});

test('livePrice uses uncached fetch', async () => {
  const mockResult = {};
  const fetch = jest.fn(async () => ({ json: async () => mockResult as any }));
  const cachedFetch = jest.fn();
  const { livePrice } = stocksClient({ fetch, cachedFetch, apiKey: API_KEY });

  expect(await livePrice('test')).toEqual(mockResult);
  expect(cachedFetch).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/real-time/test?fmt=json&api_token=test_api_key'
  );
});

test('history uses cached fetch and passes dates to data provider', async () => {
  const mockResult = [{}, {}] as any;
  const fetch = jest.fn();
  const cachedFetch = jest.fn(async () => ({ json: async () => mockResult }));
  const { history } = stocksClient({ fetch, cachedFetch, apiKey: API_KEY });

  expect(await history('test.us', '2021-01-15', '2021-01-16')).toEqual(
    mockResult
  );
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/eod/test.us?from=2021-01-15&to=2021-01-16&fmt=json&api_token=test_api_key'
  );
  expect(fetch).not.toHaveBeenCalled();
});

test('info uses cached fetch to searche for stock symbols', async () => {
  const mockResult = [
    { Code: 'test', Exchange: 'us' },
    { Code: 'other', Exchange: 'lse' },
  ] as any;
  const fetch = jest.fn();
  const cachedFetch = jest.fn(async () => ({ json: async () => mockResult }));
  const { info } = stocksClient({ fetch, cachedFetch, apiKey: API_KEY });

  expect(await info('test.us')).toEqual({
    ...mockResult[0],
    Ticker: 'test.us',
  });
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/test?api_token=test_api_key'
  );
  expect(fetch).not.toHaveBeenCalled();
});

test('priceAt today with currency exchange', async () => {
  const mockSearchResult = [
    { Code: 'test', Exchange: 'us', Currency: 'USD' },
  ] as any;
  const mockTickerPriceResult = { close: 100 } as any;
  const mockForexPriceResult = { close: 0.7 } as any;
  const fetch = jest.fn(async (url) => ({
    json: async () =>
      url ===
      'https://eodhistoricaldata.com/api/real-time/test.us?fmt=json&api_token=test_api_key'
        ? mockTickerPriceResult
        : mockForexPriceResult,
  }));
  const cachedFetch = jest.fn(async () => ({
    json: async () => mockSearchResult,
  }));
  const { priceAt } = stocksClient({ fetch, cachedFetch, apiKey: API_KEY });

  expect(await priceAt('test.us', new Date(), 'GBP')).toEqual({
    ticker: 'test.us',
    price: 100,
    priceInCurrency: 70,
  });
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/test?api_token=test_api_key'
  );
  expect(fetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/real-time/test.us?fmt=json&api_token=test_api_key'
  );
  expect(fetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/real-time/USDGBP.FOREX?fmt=json&api_token=test_api_key'
  );
});

test('priceAt today without close price', async () => {
  const mockSearchResult = [
    { Code: 'test', Exchange: 'us', Currency: 'USD' },
  ] as any;
  const mockTickerPriceResult = { close: 'NA', previousClose: 100 } as any;
  const fetch = jest.fn(async () => ({
    json: async () => mockTickerPriceResult,
  }));
  const cachedFetch = jest.fn(async () => ({
    json: async () => mockSearchResult,
  }));
  const { priceAt } = stocksClient({ fetch, cachedFetch, apiKey: API_KEY });

  expect(await priceAt('test.us', new Date(), 'USD')).toEqual({
    ticker: 'test.us',
    price: 100,
    priceInCurrency: 100,
  });
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/test?api_token=test_api_key'
  );
  expect(fetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/real-time/test.us?fmt=json&api_token=test_api_key'
  );
});

test('priceAt historic date will fetch range of dates', async () => {
  const mockSearchResult = [
    { Code: 'test', Exchange: 'us', Currency: 'USD' },
  ] as any;
  const mockTickerPriceResult = [{ close: 50 }, { close: 100 }] as any;
  const fetch = jest.fn();
  const cachedFetch = jest.fn(async (url) => ({
    json: async () => {
      switch (url) {
        case 'https://eodhistoricaldata.com/api/eod/test.us?from=2020-12-05&to=2020-12-10&fmt=json&api_token=test_api_key':
          return mockTickerPriceResult;
        default:
          return mockSearchResult;
      }
    },
  }));
  const { priceAt } = stocksClient({ fetch, cachedFetch, apiKey: API_KEY });

  expect(await priceAt('test.us', '2020-12-10', 'USD')).toEqual({
    ticker: 'test.us',
    price: 100,
    priceInCurrency: 100,
  });
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/test?api_token=test_api_key'
  );
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/eod/test.us?from=2020-12-05&to=2020-12-10&fmt=json&api_token=test_api_key'
  );
  expect(fetch).not.toHaveBeenCalled();
});

test('priceAt historic date with currency exchange', async () => {
  const mockSearchResult = [
    { Code: 'test', Exchange: 'us', Currency: 'USD' },
  ] as any;
  const mockTickerPriceResult = [{ close: 50 }, { close: 100 }] as any;
  const mockForexPriceResult = [{ close: 0.2 }, { close: 0.7 }] as any;
  const fetch = jest.fn();
  const cachedFetch = jest.fn(async (url) => ({
    json: async () => {
      switch (url) {
        case 'https://eodhistoricaldata.com/api/eod/test.us?from=2020-12-05&to=2020-12-10&fmt=json&api_token=test_api_key':
          return mockTickerPriceResult;
        case 'https://eodhistoricaldata.com/api/eod/USDGBP.FOREX?from=2020-12-05&to=2020-12-10&fmt=json&api_token=test_api_key':
          return mockForexPriceResult;
        default:
          return mockSearchResult;
      }
    },
  }));
  const { priceAt } = stocksClient({ fetch, cachedFetch, apiKey: API_KEY });

  expect(await priceAt('test.us', '2020-12-10', 'GBP')).toEqual({
    ticker: 'test.us',
    price: 100,
    priceInCurrency: 70,
  });
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/test?api_token=test_api_key'
  );
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/eod/test.us?from=2020-12-05&to=2020-12-10&fmt=json&api_token=test_api_key'
  );
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/eod/USDGBP.FOREX?from=2020-12-05&to=2020-12-10&fmt=json&api_token=test_api_key'
  );
  expect(fetch).not.toHaveBeenCalled();
});

test('priceAt historic date without close price', async () => {
  const mockSearchResult = [
    { Code: 'test', Exchange: 'us', Currency: 'USD' },
  ] as any;
  const mockTickerPriceResult = [
    { close: 'NA', adjusted_close: 20 },
    { close: 'NA', adjusted_close: 100 },
  ] as any;
  const fetch = jest.fn();
  const cachedFetch = jest.fn(async (url) => ({
    json: async () => {
      switch (url) {
        case 'https://eodhistoricaldata.com/api/eod/test.us?from=2020-12-05&to=2020-12-10&fmt=json&api_token=test_api_key':
          return mockTickerPriceResult;
        default:
          return mockSearchResult;
      }
    },
  }));
  const { priceAt } = stocksClient({ fetch, cachedFetch, apiKey: API_KEY });

  expect(await priceAt('test.us', '2020-12-10', 'USD')).toEqual({
    ticker: 'test.us',
    price: 100,
    priceInCurrency: 100,
  });
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/search/test?api_token=test_api_key'
  );
  expect(cachedFetch).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/eod/test.us?from=2020-12-05&to=2020-12-10&fmt=json&api_token=test_api_key'
  );
  expect(fetch).not.toHaveBeenCalled();
});
