import dayjs from 'dayjs';
import { exchangeCurrency, TimeSeries } from '@tuja/libs';
import type {
  StockHistory,
  StockInfo,
  StockLivePrice,
} from 'libs/stocksClient';
import type { PortfolioPerformance } from 'libs/portfolioClient';

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
  stocksLivePrice: { [ticker: string]: StockLivePrice }
) {
  const holdings: PortfolioPerformance['holdings'] = {};
  Object.keys(numShares).forEach((ticker) => {
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

export function accumulateDailyTwrr(
  dailyTwrrSeries: TimeSeries,
  startDate: Date,
  endDate: Date
) {
  // Filter dates, and get daily return by multiplying previous days
  const startDay = dayjs(startDate);
  const endDay = dayjs(endDate);
  const timeWeightedReturns = new TimeSeries({
    data: dailyTwrrSeries.data
      .filter((d) => startDay.isSameOrBefore(d[0]) && endDay.isAfter(d[0]))
      .reduce((seriesData, d) => {
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
