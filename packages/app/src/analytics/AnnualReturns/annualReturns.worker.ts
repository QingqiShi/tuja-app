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
  const dailyDepreciation = new BigNumber(1).minus(
    new BigNumber(inflationRate).dividedBy(365)
  );

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
        prevPrice?: BigNumber;
        prevValue?: BigNumber;
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
      const prevPrice = prev[ticker].prevPrice ?? currentPrice;
      const prevAssetValue = prev[ticker].prevValue ?? prev[ticker].percentage;
      const prevAssetValueInflationAdjusted =
        prev[ticker].prevValue === undefined
          ? prevAssetValue
          : prevAssetValue.multipliedBy(dailyDepreciation);

      const assetValue = prevAssetValueInflationAdjusted.plus(
        prevAssetValueInflationAdjusted.multipliedBy(
          currentPrice.minus(prevPrice).dividedBy(prevPrice)
        )
      );

      prev[ticker].prevValue = assetValue;
      prev[ticker].prevPrice = currentPrice;
      return sum.plus(assetValue);
    }, new BigNumber(0));

    returns.data.push([date, newValue.toNumber()]);
  }

  const annualReturns = [];
  const start = dayjs(dateRange.startDate).add(1, 'year').startOf('year');
  const end = dayjs(dateRange.endDate).startOf('year');

  for (let i = start; !i.isAfter(end); i = i.add(1, 'year')) {
    const prev = returns.get(i.subtract(1, 'year').toDate());
    const current = returns.get(i.toDate());
    annualReturns.push(
      new BigNumber(current).minus(prev).dividedBy(prev).toNumber()
    );
  }

  return annualReturns;
}
