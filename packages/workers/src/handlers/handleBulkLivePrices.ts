import { stocksClient } from '@tuja/libs';

export const handleBulkLivePrices = async (
  request: Request
): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const tickers = params.get('tickers')?.split(',');

  if (!tickers || !tickers.length)
    return new Response('Missing tickers', { status: 400 });
  if (tickers.length > 6)
    return new Response('No more than 6 tickers', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const client = stocksClient({ fetch, apiKey: EOD_API_KEY });
  const livePrices = await Promise.all(
    tickers.map((ticker) => client.livePrice(ticker))
  );

  return new Response(JSON.stringify(livePrices), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
