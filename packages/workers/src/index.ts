import type { StockInfo } from '@tuja/libs';

// Get EodHistoricalData API token from firebase config
const getToken = () => EOD_API_KEY ?? '';

const handleStockSearch = async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const query = params.get('query');

  if (!query) return new Response('Missing query', { status: 400 });

  const response = await fetch(
    `https://eodhistoricaldata.com/api/search/${query}?api_token=${getToken()}`
  );
  const result = ((await response.json()) as Omit<StockInfo, 'Ticker'>[]).map(
    (info) => {
      const stockInfo = {
        ...info,
        Ticker: `${info.Code}.${info.Exchange}`,
      };
      return stockInfo;
    }
  );

  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};

const handleRequest = async (request: Request) => {
  const url = new URL(request.url);
  if (url.pathname === '/search') return handleStockSearch(request);
  return new Response('Not Found', { status: 404 });
};

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
