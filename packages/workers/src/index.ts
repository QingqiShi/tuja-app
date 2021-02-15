import { handleSearch } from './handlers/handleSearch';
import { handlePriceAt } from './handlers/handlePriceAt';
import { handleBulkEods } from './handlers/handleBulkEods';
import { handleBulkInfos } from './handlers/handleBulkInfos';
import { handleBulkLivePrices } from './handlers/handleBulkLivePrices';
import { handleStockLogo } from './handlers/handleStockLogo';

const getResponse = async (
  request: Request,
  config: { [pathname: string]: (request: Request) => Promise<Response> }
) => {
  const pathname = new URL(request.url).pathname;

  if (pathname in config) {
    return config[pathname](request);
  }

  return new Response('Not Found', { status: 404 });
};

const handleRequest = async (request: Request) => {
  const response = await getResponse(request, {
    '/search': handleSearch,
    '/priceAt': handlePriceAt,
    '/bulkEods': handleBulkEods,
    '/bulkInfos': handleBulkInfos,
    '/bulkLivePrices': handleBulkLivePrices,
    '/stockLogo': handleStockLogo,
    '/_health': async () => new Response('OK', { status: 200 }),
  });

  response.headers.set(
    'Access-Control-Allow-Origin',
    ENVIRONMENT === 'production' ? 'https://tuja.app' : '*'
  );
  if (ENVIRONMENT === 'production') {
    response.headers.set('Vary', 'Origin');
  }
  return response;
};

addEventListener('fetch', (event) => {
  const request = event.request;
  event.respondWith(handleRequest(request));
});
