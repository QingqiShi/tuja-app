import {
  getStocksClient,
  getForexPair,
  normalizeForex,
  exchangeCurrency,
} from '@tuja/libs';

const getStockCurrency = async (
  ticker: string,
  baseCurrency: string,
  search: (query: string) => Promise<{ Ticker: string; Currency: string }[]>
) => {
  const results = await search(ticker.split('.')[0]);
  const tickerCurrency = results.find(
    ({ Ticker }: { Ticker: string }) => Ticker === ticker
  )?.Currency;

  const tickerCurrencyNormalized =
    tickerCurrency && normalizeForex(tickerCurrency).currency;

  const forexPair =
    tickerCurrencyNormalized &&
    baseCurrency &&
    tickerCurrencyNormalized !== baseCurrency
      ? getForexPair(tickerCurrencyNormalized, baseCurrency)
      : undefined;

  return { tickerCurrency, tickerCurrencyNormalized, forexPair };
};

type Price = { close: number | 'NA'; previousClose: number };
const getClosePrice = (price: Price, tickerCurrency?: string) => {
  const close = price.close !== 'NA' ? price.close : price.previousClose;
  return tickerCurrency ? normalizeForex(tickerCurrency, close).value : close;
};

export const handlePriceAt = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams;
  const ticker = params.get('ticker');
  const at = params.get('at');
  const currency = params.get('currency');

  if (!ticker) return new Response('Missing tickers', { status: 400 });
  if (!at) return new Response('Missing at', { status: 400 });
  if (!EOD_API_KEY) return new Response('Missing API Key', { status: 500 });

  const DATE_FORMAT = 'YYYY-MM-DD';
  const { default: dayjs } = await import('dayjs');

  const cachedClient = getStocksClient(
    (url: string) =>
      // cache for 30 days
      fetch(url, { cf: { cacheTtl: 2592000, cacheEverything: true } }),
    EOD_API_KEY
  );

  // get info for currency exchange
  const { tickerCurrency, tickerCurrencyNormalized, forexPair } =
    (ticker &&
      currency &&
      (await getStockCurrency(ticker, currency, cachedClient.search))) ||
    {};

  // return live price if today
  const requestDate = dayjs(at, DATE_FORMAT);
  if (dayjs().isSame(requestDate, 'date')) {
    const client = getStocksClient(fetch, EOD_API_KEY);
    const [price, forex] = await Promise.all([
      client.livePrice(ticker),
      forexPair ? client.livePrice(forexPair) : undefined,
    ]);
    const close = getClosePrice(price, tickerCurrency);
    return new Response(
      JSON.stringify({
        ticker,
        price: close,
        priceInCurrency:
          tickerCurrencyNormalized && forex && currency
            ? exchangeCurrency(close, tickerCurrencyNormalized, currency, () =>
                getClosePrice(forex)
              )
            : close,
      }),
      { headers: { 'content-type': 'application/json;charset=UTF-8' } }
    );
  }

  // return historic price
  const fromDate = requestDate.subtract(5, 'day').format(DATE_FORMAT);
  const toDate = requestDate.format(DATE_FORMAT);
  const [tickerHistory, forexHistory] = await Promise.all([
    cachedClient.history(ticker, fromDate, toDate),
    forexPair ? cachedClient.history(forexPair, fromDate, toDate) : undefined,
  ]);

  const price = tickerHistory[tickerHistory.length - 1];
  const forex = forexHistory && forexHistory[forexHistory.length - 1];

  const close = getClosePrice(price, tickerCurrency);
  return new Response(
    JSON.stringify({
      ticker,
      price: close,
      priceInCurrency:
        tickerCurrencyNormalized && forex && currency
          ? exchangeCurrency(close, tickerCurrencyNormalized, currency, () =>
              getClosePrice(forex)
            )
          : close,
    }),
    { headers: { 'content-type': 'application/json;charset=UTF-8' } }
  );
};
