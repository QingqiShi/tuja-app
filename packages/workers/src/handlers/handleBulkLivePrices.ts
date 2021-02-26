import { stocksClient } from '@tuja/libs';
import { correctPrice } from '../utils/correctPrice';
import priceCorrection from '../constants/priceCorrection.json';

export const handleBulkLivePrices = async (
  request: Request
): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const tickers = params
    .get('tickers')
    ?.split(',')
    .filter((t) => !!t);

  if (!tickers || !tickers.length)
    return new Response('Missing tickers', { status: 400 });
  if (tickers.length > 6)
    return new Response('No more than 6 tickers', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const client = stocksClient({ fetch, apiKey: EOD_API_KEY });
  const livePrices = await Promise.all(
    tickers.map(async (ticker) => {
      const livePrice = await client.livePrice(ticker);

      const correction =
        priceCorrection[ticker as keyof typeof priceCorrection];

      if (correction && livePrice) {
        const previousClose = correctPrice(livePrice.previousClose, correction);
        const change =
          livePrice.close !== 'NA' ? livePrice.close - previousClose : 0;
        return {
          ...livePrice,
          previousClose,
          change,
          change_p: (change / previousClose) * 100,
        };
      }
      return livePrice;
    })
  );

  return new Response(JSON.stringify(livePrices), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
