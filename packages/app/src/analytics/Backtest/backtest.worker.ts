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
  const dailyInflation = inflationRate / 365;

  const { stocksInfo, stocksHistory, dateRange } = await prefetchStocksHistory(
    tickers,
    baseCurrency
  );

  const result = new TimeSeries();

  const prev = assets.reduce(
    (obj, asset) => ({
      ...obj,
      [asset.ticker]: { percentage: asset.percentage },
    }),
    {} as {
      [ticker: string]: {
        prevPrice?: number;
        prevValue?: number;
        percentage: number;
      };
    }
  );
  for (
    let i = dayjs(dateRange.startDate);
    i.isBefore(dateRange.endDate);
    i = i.add(1, 'day')
  ) {
    const date = i.toDate();

    const newValue = assets.reduce((sum, { ticker }) => {
      const currentPrice = exchangeCurrency(
        stocksHistory[ticker].adjusted.get(date),
        stocksInfo[ticker].Currency ?? baseCurrency,
        baseCurrency,
        (forexPair) => stocksHistory[forexPair]?.close.get(date)
      );
      const prevPrice = prev[ticker].prevPrice ?? currentPrice;
      const prevAssetValue = prev[ticker].prevValue ?? prev[ticker].percentage;
      const prevAssetValueInflationAdjusted =
        prevAssetValue * (1 - dailyInflation);

      const assetValue =
        prevAssetValueInflationAdjusted +
        prevAssetValueInflationAdjusted *
          ((currentPrice - prevPrice) / prevPrice);

      prev[ticker].prevValue = assetValue;
      prev[ticker].prevPrice = currentPrice;
      return sum + assetValue;
    }, 0);

    result.data.push([date, newValue]);
  }

  return result;
}
