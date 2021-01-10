import { handleInfo } from './handlers/handleInfo';
import { handleSearch } from './handlers/handleSearch';
import { handleLivePrice } from './handlers/handleLivePrice';
import { handlePriceAt } from './handlers/handlePriceAt';
import { handleHistoricEod } from './handlers/handleHistoricEod';
import { handleBulkLivePrices } from './handlers/handleBulkLivePrices';

const handleRequest = async (request: Request) => {
  const url = new URL(request.url);

  if (url.pathname === '/info') return handleInfo(request);
  if (url.pathname === '/search') return handleSearch(request);
  if (url.pathname === '/livePrice') return handleLivePrice(request);
  if (url.pathname === '/historicEod') return handleHistoricEod(request);
  if (url.pathname === '/priceAt') return handlePriceAt(request);
  if (url.pathname === '/api/bulkLivePrices') return handleBulkLivePrices(request);

  return new Response('Not Found', { status: 404 });
};

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
