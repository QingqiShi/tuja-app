export const handleLivePrice = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const ticker = params.get('ticker');

  if (!ticker) return new Response('Missing tickers', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const result = await fetch(
    `https://eodhistoricaldata.com/api/real-time/${ticker}?fmt=json&api_token=${EOD_API_KEY}`
  );
  const livePrice = await result.json();

  return new Response(JSON.stringify(livePrice), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
};
