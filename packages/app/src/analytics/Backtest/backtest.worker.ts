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

  const { stocksInfo, stocksHistory, dateRange } = await prefetchStocksHistory(
    tickers,
    baseCurrency
  );

  const result = new TimeSeries();

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

  const numDays = dayjs(dateRange.endDate).diff(dateRange.startDate, 'day');
  const maxDays = 2000;
  const samplingRate = maxDays < numDays ? Math.floor(numDays / maxDays) : 1;

  for (
    let i = dayjs(dateRange.startDate);
    !i.isAfter(dateRange.endDate);
    i = i.add(samplingRate, 'day')
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
      const cumulatedInflation = Math.pow(
        new BigNumber(1).minus(inflationRate).toNumber(),
        years
      );
      const assetValue = assetQuantity
        .multipliedBy(currentPrice)
        .multipliedBy(cumulatedInflation);

      if (prev[ticker].quantity === undefined) {
        prev[ticker].quantity = assetQuantity;
      }

      return sum.plus(assetValue);
    }, new BigNumber(0));

    result.data.push([date, newValue.toNumber()]);
  }

  return result;
}
