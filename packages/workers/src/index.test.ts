import { Request, Response } from 'node-fetch';
import { handleSearch } from './handlers/handleSearch';
import { handlePriceAt } from './handlers/handlePriceAt';
import { handleBulkEods } from './handlers/handleBulkEods';
import { handleBulkInfos } from './handlers/handleBulkInfos';
import { handleBulkLivePrices } from './handlers/handleBulkLivePrices';

jest.mock('./handlers/handleSearch', () => ({ handleSearch: jest.fn() }));
jest.mock('./handlers/handlePriceAt', () => ({ handlePriceAt: jest.fn() }));
jest.mock('./handlers/handleBulkEods', () => ({ handleBulkEods: jest.fn() }));
jest.mock('./handlers/handleBulkInfos', () => ({ handleBulkInfos: jest.fn() }));
jest.mock('./handlers/handleBulkLivePrices', () => ({
  handleBulkLivePrices: jest.fn(),
}));

declare const global: { [key: string]: unknown };

// Setup worker globals
beforeAll(async () => {
  global.addEventListener = jest.fn();
  global.Response = Response;
});

// Reset default environment
beforeEach(async () => {
  global.ENVIRONMENT = 'testing';
});

// Callback
let sendFetchEvent: (event: {
  request: Request;
  respondWith: () => void;
}) => void;

// This test must come first
test('register fetch event listener', async () => {
  await import('./index');
  expect(global.addEventListener).toHaveBeenCalledWith(
    'fetch',
    expect.any(Function)
  );

  // Set up callback for future tests
  sendFetchEvent = (global.addEventListener as jest.Mock).mock.calls[0][1];
});

test('handle unknown request with not found', async () => {
  // Send an unknown request
  const responseHandler = jest.fn();
  sendFetchEvent({
    request: new Request('http://localhost/unknown'),
    respondWith: responseHandler,
  });

  // Responds with 404
  const response: Response = await responseHandler.mock.calls[0][0];
  expect(response.status).toBe(404);
  expect(await response.text()).toBe('Not Found');
});

test('allow cross origin for development', async () => {
  // Send an unknown request with development environment
  global.ENVIRONMENT = 'development';
  const responseHandler = jest.fn();
  sendFetchEvent({
    request: new Request('http://localhost/unknown'),
    respondWith: responseHandler,
  });

  // Responds headers
  const response: Response = await responseHandler.mock.calls[0][0];
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  expect(response.headers.get('Vary')).toBeNull();
});

test('allow cross origin for development', async () => {
  // Send an unknown request with development environment
  global.ENVIRONMENT = 'production';
  const responseHandler = jest.fn();
  sendFetchEvent({
    request: new Request('https://api.tuja.app/unknown'),
    respondWith: responseHandler,
  });

  // Responds headers
  const response: Response = await responseHandler.mock.calls[0][0];
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
    'https://tuja.app'
  );
  expect(response.headers.get('Vary')).toBe('Origin');
});

test('health check endpoint', async () => {
  // Send an unknown request with development environment
  global.ENVIRONMENT = 'production';
  const responseHandler = jest.fn();
  sendFetchEvent({
    request: new Request('https://api.tuja.app/_health'),
    respondWith: responseHandler,
  });

  // Responds headers
  const response: Response = await responseHandler.mock.calls[0][0];
  expect(response.status).toBe(200);
});

test.each`
  endpoint             | handler
  ${'/search'}         | ${handleSearch}
  ${'/priceAt'}        | ${handlePriceAt}
  ${'/bulkEods'}       | ${handleBulkEods}
  ${'/bulkInfos'}      | ${handleBulkInfos}
  ${'/bulkLivePrices'} | ${handleBulkLivePrices}
`('handler for $endpoint', async ({ endpoint, handler }) => {
  (handler as jest.Mock).mockReturnValue(new Response());

  // Send an unknown request with development environment
  const responseHandler = jest.fn();
  sendFetchEvent({
    request: new Request(`http://localhost${endpoint}`),
    respondWith: responseHandler,
  });

  // Responds headers
  expect(handler).toHaveBeenCalled();
  await responseHandler.mock.calls[0][0];
});
