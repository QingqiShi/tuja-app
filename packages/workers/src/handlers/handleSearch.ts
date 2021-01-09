import type { StockInfo } from '@tuja/libs';

export const handleSearch = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const query = params.get('query');

  if (!query) return new Response('Missing query', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const response = await fetch(
    `https://eodhistoricaldata.com/api/search/${query}?api_token=${EOD_API_KEY}`
  );
  const result = ((await response.json()) as Omit<StockInfo, 'Ticker'>[]).map(
    (info) => {
      const stockInfo = {
        ...info,
        Ticker: `${info.Code}.${info.Exchange}`,
      };
      return stockInfo;
    }
  );

  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
