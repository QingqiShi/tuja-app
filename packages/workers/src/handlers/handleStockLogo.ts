import stockLogoMap from '../constants/stockLogos.json';

export const handleStockLogo = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const ticker = params.get('ticker');
  const name = params.get('name');
  const size = params.get('size');

  if (!ticker) return new Response('Missing ticker', { status: 400 });

  let stockUrl = stockLogoMap[ticker as keyof typeof stockLogoMap];
  if (!stockUrl && name?.startsWith('iShares')) {
    stockUrl = 'ishares.com';
  } else if (!stockUrl && name?.startsWith('Vanguard')) {
    stockUrl = 'vanguard.com';
  } else if (!stockUrl && name?.startsWith('Invesco')) {
    stockUrl = 'invesco.com';
  } else if (!stockUrl && name?.startsWith('HSBC')) {
    stockUrl = 'hsbc.com';
  }

  if (!stockUrl) {
    return new Response('Not found', { status: 404 });
  }

  const result = await fetch(
    `http://logo.clearbit.com/${stockUrl}?size=${size || 80}`,
    { cf: { cacheTtl: 2592000, cacheEverything: true } }
  );

  const response = new Response(await result.blob(), {
    headers: { 'content-type': 'image/png' },
  });
  response.headers.set('Cache-Control', 'max-age=2592000');
  return response;
};
