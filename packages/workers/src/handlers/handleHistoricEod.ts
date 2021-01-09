import { getStocksClient } from '@tuja/libs';

export const handleHistoricEod = async (
  request: Request
): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const ticker = params.get('ticker');
  const from = params.get('from');
  const to = params.get('to');

  if (!ticker) return new Response('Missing tickers', { status: 400 });
  if (!from) return new Response('Missing from', { status: 400 });
  if (!to) return new Response('Missing to', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const client = getStocksClient(fetch, EOD_API_KEY);
  const history = await client.history(ticker, from, to);

  return new Response(JSON.stringify(history), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
