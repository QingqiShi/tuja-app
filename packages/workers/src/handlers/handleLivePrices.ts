import type { StockLivePrice } from '@tuja/libs';

export const handleLivePrices = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const tickers = params.get('tickers')?.split(',');

  if (!tickers || !tickers.length)
    return new Response('Missing tickers', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const livePrices: StockLivePrice[] = await Promise.all(
    tickers.map(async (ticker) => {
      const response = await fetch(
        `https://eodhistoricaldata.com/api/real-time/${ticker}?fmt=json&api_token=${EOD_API_KEY}`
      );
      return response.json();
    })
  );

  return new Response(JSON.stringify(livePrices), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
