import { getStocksClient } from '@tuja/libs';

export const handleBulkInfos = async (
  request: Request
): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const tickers = params.get('tickers')?.split(',');

  if (!tickers || !tickers.length)
    return new Response('Missing tickers', { status: 400 });
  if (tickers.length > 6)
    return new Response('No more than 6 tickers', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  // cache for 30 days
  const client = getStocksClient(
    (url: string) =>
      fetch(url, { cf: { cacheTtl: 2592000, cacheEverything: true } }),
    EOD_API_KEY
  );
  const infos = await Promise.all(
    tickers.map(async (ticker) => {
      const results = await client.search(ticker.split('.')[0]);
      return results.find(
        ({ Ticker }: { Ticker: string }) => Ticker === ticker
      );
    })
  );

  return new Response(JSON.stringify(infos), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
