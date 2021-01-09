import { getStocksClient } from '@tuja/libs';

export const handleInfo = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const ticker = params.get('ticker');

  if (!ticker) return new Response('Missing ticker', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const client = getStocksClient(
    (url: string) =>
      // cache for 30 days
      fetch(url, { cf: { cacheTtl: 2592000, cacheEverything: true } }),
    EOD_API_KEY
  );

  // Search using the first part of the ticker then search through the results
  const results = await client.search(ticker.split('.')[0]);
  const info = results.find(
    ({ Ticker }: { Ticker: string }) => Ticker === ticker
  );

  if (info) {
    const response = new Response(JSON.stringify(info), {
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    });
    response.headers.set('Cache-Control', 'max-age=2592000');
    return response;
  } else {
    return new Response('Cannot find ticker', { status: 404 });
  }
};
