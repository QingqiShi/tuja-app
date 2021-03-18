import dayjs from 'dayjs';
import { exchangeCurrency, StockInfo, TimeSeries } from '@tuja/libs';
import type { PortfolioPerformance } from '../../libs/portfolioClient';
import type { StockHistory, ParsedLivePrice } from '../../libs/stocksClient';

export function calcHoldingsValues(
  date: Date,
  holdingsNumShares: { [ticker: string]: number },
  stocksInfo: { [ticker: string]: StockInfo },
  stocksHistory: { [ticker: string]: StockHistory },
  baseCurrency: string
) {
  const holdingsValues: { [ticker: string]: number } = {};
  let totalHoldingsValue = 0;
  Object.keys(holdingsNumShares).forEach((ticker) => {
    const stockInfo = stocksInfo[ticker];
    const stockHistory = stocksHistory[ticker];
    if (!stockInfo || !stockHistory) return;
    const price = exchangeCurrency(
      stockHistory.close.get(date) ?? 0,
      stockInfo.Currency ?? baseCurrency,
      baseCurrency,
      (forexPair) => stocksHistory[forexPair]?.close.get(date)
    );
    holdingsValues[ticker] = price * holdingsNumShares[ticker];
    totalHoldingsValue += holdingsValues[ticker];
  });
  return { holdingsValues, totalHoldingsValue };
}

export function calcDailyTwrr(
  date: Date,
  valueSeries: TimeSeries,
  lastCashFlow: readonly [Date, number] | null
) {
  const day = dayjs(date);
  const prevDate = day.subtract(1, 'day').toDate();

  // Get values from context
  const endValue = valueSeries.get(date);
  const initialValue = valueSeries.get(prevDate);
  const cashFlow =
    lastCashFlow && day.isSame(lastCashFlow[0], 'day') ? lastCashFlow[1] : 0;

  // Calculate twrr
  return (endValue - initialValue - cashFlow) / (initialValue + cashFlow);
}

export function calcGain(totalValue: number, cashFlow: number) {
  return totalValue - cashFlow;
}

export function calcHoldings(
  numShares: { [ticker: string]: number },
  endDate: Date,
  baseCurrency: string,
  stocksInfo: { [ticker: string]: StockInfo },
  stocksHistory: { [ticker: string]: StockHistory },
  stocksLivePrice: { [ticker: string]: ParsedLivePrice }
) {
  const holdings: PortfolioPerformance['portfolio']['holdings'] = {};
  Object.keys(numShares)
    .filter((ticker) => !!numShares[ticker])
    .forEach((ticker) => {
      const stockInfo = stocksInfo[ticker];
      const stockHistory = stocksHistory[ticker];
      if (!stockInfo || !stockHistory) return;

      const units = numShares[ticker];
      const price = exchangeCurrency(
        stockHistory.close.get(endDate) ?? 0,
        stockInfo.Currency ?? baseCurrency,
        baseCurrency,
        (forexPair) => stocksHistory[forexPair]?.close.get(endDate)
      );
      const value = units * price;

      holdings[ticker] = {
        units,
        value,
        info: stocksInfo[ticker],
        livePrice: stocksLivePrice[ticker],
      };
    });
  return holdings;
}

export function accumulateDailyTwrr(dailyTwrrSeries: TimeSeries) {
  const timeWeightedReturns = new TimeSeries({
    data: dailyTwrrSeries.data.reduce((seriesData, d) => {
      if (seriesData.length) {
        seriesData.push([
          d[0],
          (1 + seriesData[seriesData.length - 1][1]) * (1 + d[1]) - 1,
        ]);
        return seriesData;
      }
      return [[d[0], 0]];
    }, [] as [Date, number][]),
  });

  return timeWeightedReturns;
}

export function calcBenchmarkReturn(
  date: Date,
  stocksHistory: { [ticker: string]: StockHistory },
  initialValue?: number,
  benchmarkTicker?: string
) {
  if (benchmarkTicker && initialValue) {
    const benchmarkValue = stocksHistory[benchmarkTicker]?.adjusted.get(date);
    if (benchmarkValue) {
      return (benchmarkValue - initialValue) / initialValue;
    }
  }
  return 0;
}
