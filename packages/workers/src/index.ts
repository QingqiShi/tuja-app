import { handleSearch } from './handlers/handleSearch';
import { handleLivePrices } from './handlers/handleLivePrices';

const handleRequest = async (request: Request) => {
  const url = new URL(request.url);

  if (url.pathname === '/search') return handleSearch(request);
  if (url.pathname === '/livePrices') return handleLivePrices(request);

  return new Response('Not Found', { status: 404 });
};

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
