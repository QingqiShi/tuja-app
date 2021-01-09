import { handleInfo } from './handlers/handleInfo';
import { handleSearch } from './handlers/handleSearch';
import { handleLivePrice } from './handlers/handleLivePrice';
import { handleHistoricEod } from './handlers/handleHistoricEod';

const handleRequest = async (request: Request) => {
  const url = new URL(request.url);

  if (url.pathname === '/info') return handleInfo(request);
  if (url.pathname === '/search') return handleSearch(request);
  if (url.pathname === '/livePrice') return handleLivePrice(request);
  if (url.pathname === '/historicEod') return handleHistoricEod(request);

  return new Response('Not Found', { status: 404 });
};

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
