import { stocksClient } from '@tuja/libs';
import { correctPrice } from '../utils/correctPrice';
import priceCorrection from '../constants/priceCorrection.json';

export const handlePriceAt = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const ticker = params.get('ticker');
  const at = params.get('at');
  const currency = params.get('currency');

  if (!ticker) return new Response('Missing ticker', { status: 400 });
  if (!at) return new Response('Missing at', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const client = stocksClient({
    fetch,
    cachedFetch: (url: string) =>
      // cache for 30 days
      fetch(url, { cf: { cacheTtl: 2592000, cacheEverything: true } }),
    apiKey: EOD_API_KEY,
  });
  const correction = priceCorrection[ticker as keyof typeof priceCorrection];

  const price = await client.priceAt(
    ticker,
    at,
    currency ?? undefined,
    correction && ((price) => correctPrice(price, correction))
  );

  return new Response(JSON.stringify(price), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
