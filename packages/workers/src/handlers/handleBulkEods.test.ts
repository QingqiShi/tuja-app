import { Request, Response } from 'node-fetch';
import { handleBulkEods } from './handleBulkEods';

declare const global: { [key: string]: unknown };

// Setup worker globals
beforeAll(async () => {
  global.fetch = jest.fn();
  global.Response = Response;
  global.EOD_API_KEY = 'test-api';
});

test('get stocks historic eods', async () => {
  // Given
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => [
      { date: '2021-01-20', close: 5 },
      { date: '2021-01-21', close: 10 },
    ],
  });
  (global.fetch as jest.Mock).mockReturnValueOnce({
    json: async () => [
      { date: '2020-05-01', close: 50 },
      { date: '2020-05-02', close: 60 },
    ],
  });
  const request = new Request(
    `http://localhost/bulkEods?query=${encodeURIComponent(
      JSON.stringify([
        { ticker: 'A', from: '2021-01-20', to: '2021-01-22' },
        { ticker: 'B', from: '2020-05-01', to: '2020-05-02' },
      ])
    )}`
  );

  // When
  const response = await handleBulkEods(request as never);

  // Then
  expect(
    global.fetch as jest.Mock
  ).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/eod/A?from=2021-01-20&to=2021-01-22&fmt=json&api_token=test-api',
    { cf: { cacheEverything: true, cacheTtl: 2592000 } }
  );
  expect(
    global.fetch as jest.Mock
  ).toHaveBeenCalledWith(
    'https://eodhistoricaldata.com/api/eod/B?from=2020-05-01&to=2020-05-02&fmt=json&api_token=test-api',
    { cf: { cacheEverything: true, cacheTtl: 2592000 } }
  );
  expect(await response.json()).toEqual([
    {
      ticker: 'A',
      from: '2021-01-20',
      to: '2021-01-22',
      history: [
        { date: '2021-01-20', close: 5 },
        { date: '2021-01-21', close: 10 },
      ],
    },
    {
      ticker: 'B',
      from: '2020-05-01',
      to: '2020-05-02',
      history: [
        { date: '2020-05-01', close: 50 },
        { date: '2020-05-02', close: 60 },
      ],
    },
  ]);
  expect(response.status).toBe(200);
});

test('error when missing query', async () => {
  // Given
  const request = new Request('http://localhost/bulkEods');

  // When
  const response = await handleBulkEods(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing query');
  expect(response.status).toBe(400);
});

test.each`
  name                | query
  ${'not json'}       | ${'blahblah'}
  ${'null'}           | ${'null'}
  ${'not array'}      | ${'{"test":true}'}
  ${'missing ticker'} | ${'[{"test":true}]'}
  ${'missing from'}   | ${'[{"ticker":"AAPL.US"}]'}
  ${'missing to'}     | ${'[{"ticker":"AAPL.US","from":"2020-01-22"}]'}
`('error when query is $name', async ({ query }) => {
  // Given
  const request = new Request(
    `http://localhost/bulkEods?query=${encodeURIComponent(query)}`
  );

  // When
  const response = await handleBulkEods(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Invalid query');
  expect(response.status).toBe(400);
});

test('error when more than 6 eods', async () => {
  // Given
  const request = new Request(
    `http://localhost/bulkEods?query=${encodeURIComponent(
      JSON.stringify([
        { ticker: 'A', from: '2020-01-20', to: '2020-01-22' },
        { ticker: 'B', from: '2020-01-20', to: '2020-01-22' },
        { ticker: 'C', from: '2020-01-20', to: '2020-01-22' },
        { ticker: 'D', from: '2020-01-20', to: '2020-01-22' },
        { ticker: 'E', from: '2020-01-20', to: '2020-01-22' },
        { ticker: 'F', from: '2020-01-20', to: '2020-01-22' },
        { ticker: 'G', from: '2020-01-20', to: '2020-01-22' },
      ])
    )}`
  );

  // When
  const response = await handleBulkEods(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('No more than 6 eods');
  expect(response.status).toBe(400);
});

test('error when missing api key', async () => {
  // Given
  global.EOD_API_KEY = '';
  const request = new Request(
    `http://localhost/bulkEods?query=${encodeURIComponent(
      JSON.stringify([{ ticker: 'A', from: '2020-01-20', to: '2020-01-22' }])
    )}`
  );

  // When
  const response = await handleBulkEods(request as never);

  // Then
  expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  expect(await response.text()).toBe('Missing API Key');
  expect(response.status).toBe(500);
});
