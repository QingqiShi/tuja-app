import { getStocksClient } from '@tuja/libs';

export const handleSearch = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const query = params.get('query');

  if (!query) return new Response('Missing query', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const client = getStocksClient(
    (url: string) =>
      // cache for 30 days
      fetch(url, { cf: { cacheTtl: 2592000, cacheEverything: true } }),
    EOD_API_KEY
  );
  const results = await client.search(decodeURIComponent(query));

  const response = new Response(JSON.stringify(results), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
  response.headers.set('Cache-Control', 'max-age=2592000');
  return response;
};
