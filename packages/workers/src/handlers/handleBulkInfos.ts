import { StockInfo } from '@tuja/libs';
import { stocksClient } from '../utils/stocksClient';
import { correctPrice } from '../utils/correctPrice';
import infoOverride from '../constants/infoOverride.json';
import priceCorrection from '../constants/priceCorrection.json';

export const handleBulkInfos = async (request: Request): Promise<Response> => {
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

  // cache for 30 days
  const client = stocksClient({
    fetch,
    cachedFetch: (url: string) =>
      fetch(url, { cf: { cacheTtl: 2592000, cacheEverything: true } }),
    apiKey: EOD_API_KEY,
  });
  const infos = await Promise.all(
    tickers.map(async (ticker) => {
      const info =
        ticker in infoOverride
          ? (infoOverride[ticker as keyof typeof infoOverride] as StockInfo)
          : await client.info(ticker);

      const correction =
        priceCorrection[ticker as keyof typeof priceCorrection];

      if (correction && info) {
        return {
          ...info,
          previousClose: correctPrice(info.previousClose, correction),
        };
      }
      return info;
    })
  );

  return new Response(JSON.stringify(infos), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
