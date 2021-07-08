/* eslint-disable no-restricted-globals */

import { exchangeCurrency, TimeSeries } from '@tuja/libs';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
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
  const inflationFactor = new BigNumber(1).plus(inflationRate);

  const { stocksInfo, stocksHistory, dateRange } = await prefetchStocksHistory(
    tickers,
    baseCurrency
  );

  const returns = new TimeSeries();

  const prev = assets.reduce(
    (obj, asset) => ({
      ...obj,
      [asset.ticker]: { percentage: new BigNumber(asset.percentage) },
    }),
    {} as {
      [ticker: string]: {
        quantity?: BigNumber;
        percentage: BigNumber;
      };
    }
  );

  for (
    let i = dayjs(dateRange.startDate);
    !i.isAfter(dateRange.endDate);
    i = i.add(1, 'year')
  ) {
    const date = i.toDate();

    const newValue = assets.reduce((sum, { ticker }) => {
      const currentPrice = new BigNumber(
        exchangeCurrency(
          stocksHistory[ticker].adjusted.get(date),
          stocksInfo[ticker].Currency ?? baseCurrency,
          baseCurrency,
          (forexPair) => stocksHistory[forexPair]?.close.get(date)
        )
      );
      const assetQuantity =
        prev[ticker].quantity ??
        prev[ticker].percentage.multipliedBy(1).dividedBy(currentPrice);

      const years = i.diff(dateRange.startDate, 'year', true);
      const cumulatedInflation = Math.pow(inflationFactor.toNumber(), years);
      const assetValue = assetQuantity
        .multipliedBy(currentPrice)
        .dividedBy(cumulatedInflation);

      if (prev[ticker].quantity === undefined) {
        prev[ticker].quantity = assetQuantity;
      }

      return sum.plus(assetValue);
    }, new BigNumber(0));

    returns.data.push([date, newValue.toNumber()]);
  }

  const annualReturns = [];
  const start = dayjs(dateRange.startDate).add(1, 'year').startOf('year');
  const end = dayjs(dateRange.endDate);

  for (let i = start; !i.isAfter(end); i = i.add(1, 'year')) {
    const prev = returns.get(i.subtract(1, 'year').toDate());
    const current = returns.get(i.toDate());
    annualReturns.push(
      new BigNumber(current).minus(prev).dividedBy(prev).toNumber()
    );
  }

  return annualReturns;
}
