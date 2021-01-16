import { stocksClient } from '@tuja/libs';

export const handleBulkEods = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const query = params.get('query');

  if (!query) return new Response('Missing query', { status: 400 });
  let parsedQuery: { ticker: string; from: string; to: string }[] | null = null;
  try {
    parsedQuery = JSON.parse(decodeURIComponent(query));
  } catch {
    return new Response('Invalid query', { status: 400 });
  }
  if (
    !parsedQuery ||
    !Array.isArray(parsedQuery) ||
    parsedQuery.some((q) => !q.ticker || !q.from || !q.to)
  )
    return new Response('Invalid query', { status: 400 });
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
      return { ticker, from, to, history };
    })
  );

  return new Response(JSON.stringify(histories), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
