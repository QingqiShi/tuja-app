/* eslint-disable no-restricted-globals */

import { exchangeCurrency, TimeSeries } from '@tuja/libs';
import dayjs from 'dayjs';
import { prefetchStocksHistory } from '../../libs/cachedStocksData';

self.addEventListener('message', async (event) =>
  self.postMessage(await handler(event.data))
);

async function handler({
  assets,
  baseCurrency,
  inflationRate,
}: AnalyticsProps) {
  const tickers = assets.map((a) => a.ticker);

  const { stocksInfo, stocksHistory, dateRange } = await prefetchStocksHistory(
    tickers,
    baseCurrency
  );

  const annualReturns = [];
  for (
    let i = dayjs(dateRange.startDate).add(1, 'year');
    i.isBefore(dateRange.endDate);
    i = i.add(1, 'day')
  ) {
    const currentDate = i.toDate();
    const lastYearDate = i.subtract(1, 'year').toDate();

    const newValue = assets.reduce((sum, { ticker, percentage }) => {
      const currentPrice = exchangeCurrency(
        stocksHistory[ticker].adjusted.get(currentDate),
        stocksInfo[ticker].Currency ?? baseCurrency,
        baseCurrency,
        (forexPair) => stocksHistory[forexPair]?.close.get(currentDate)
      );
      const prevPrice = exchangeCurrency(
        stocksHistory[ticker].adjusted.get(lastYearDate),
        stocksInfo[ticker].Currency ?? baseCurrency,
        baseCurrency,
        (forexPair) => stocksHistory[forexPair]?.close.get(lastYearDate)
      );

      const returns = (currentPrice - prevPrice) / prevPrice - inflationRate;
      return sum + returns * percentage;
    }, 0);

    annualReturns.push(newValue);
  }

  return annualReturns;
}
