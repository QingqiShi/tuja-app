import { stocksClient } from '../utils/stocksClient';
import { correctPrice } from '../utils/correctPrice';
import priceCorrection from '../constants/priceCorrection.json';

export const handleBulkEods = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const query = params.get('query');

  if (!query) return new Response('Missing query', { status: 400 });
  let parsedQuery: { ticker: string; from: string; to: string }[] | null = null;

  // Parse query as JSON and validate it
  try {
    parsedQuery = JSON.parse(decodeURIComponent(query));
    if (
      !parsedQuery ||
      !Array.isArray(parsedQuery) ||
      parsedQuery.some((q) => !q.ticker || !q.from || !q.to)
    ) {
      throw new Error();
    }
    if (parsedQuery.length > 6) {
      return new Response('No more than 6 eods', { status: 400 });
    }
  } catch {
    return new Response('Invalid query', { status: 400 });
  }

  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  // cache for 30 days
  const client = stocksClient({
    fetch,
    cachedFetch: (url: string) =>
      fetch(url, { cf: { cacheTtl: 2592000, cacheEverything: true } }),
    apiKey: EOD_API_KEY,
  });
  const histories = await Promise.all(
    parsedQuery.map(async ({ ticker, from, to }) => {
      const history = await client.history(ticker, from, to);

      const correction =
        priceCorrection[ticker as keyof typeof priceCorrection];

      return {
        ticker,
        from,
        to,
        history: correction
          ? history?.map((item) => ({
              ...item,
              adjusted_close: correctPrice(item.adjusted_close, correction),
              close: correctPrice(item.close, correction),
              high: correctPrice(item.high, correction),
              low: correctPrice(item.low, correction),
              open: correctPrice(item.open, correction),
            }))
          : history,
      };
    })
  );

  return new Response(JSON.stringify(histories), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
