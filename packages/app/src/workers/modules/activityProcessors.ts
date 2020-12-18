import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { exchangeCurrency, TimeSeries } from '@tuja/libs';
import type {
  StockHistory,
  StockInfo,
  StockLivePrice,
} from 'libs/stocksClient';
import type { PortfolioPerformance } from 'libs/portfolio';
import type { ActivityIterateItem } from './activityIterator';

export function collectHoldingsNumShares(
  item: ActivityIterateItem,
  { ...holdingsNumShares }: { [ticker: string]: number }
) {
  const processTicker = (ticker: string, units: number) => {
    if (!(ticker in holdingsNumShares)) {
      holdingsNumShares[ticker] = 0;
    }
    holdingsNumShares[ticker] = new BigNumber(holdingsNumShares[ticker])
      .plus(units)
      .toNumber();
  };
  // Trades
  Object.keys(item.trades).forEach((ticker) =>
    processTicker(ticker, item.trades[ticker])
  );
  // Stock dividend
  Object.keys(item.stockDividend).forEach((ticker) =>
    processTicker(ticker, item.stockDividend[ticker])
  );
  // Remove tickers no longer held
  Object.keys(holdingsNumShares).forEach((ticker) => {
    if (!holdingsNumShares[ticker]) {
      delete holdingsNumShares[ticker];
    }
  });
  return holdingsNumShares;
}

export function collectHoldingsCost(
  item: ActivityIterateItem,
  {
    numShares,
    costs,
  }: {
    numShares: { [ticker: string]: number };
    costs: { [ticker: string]: number };
  },
  stocksInfo: { [ticker: string]: StockInfo },
  stocksHistory: { [ticker: string]: StockHistory },
  baseCurrency: string
) {
  const newUnits: { [ticker: string]: number } = {};
  const newCosts: { [ticker: string]: number } = { ...costs };
  const setUnits = (ticker: string, units: number) => {
    if (!(ticker in newUnits)) {
      newUnits[ticker] = 0;
    }
    newUnits[ticker] += units;
  };
  // Trades
  Object.keys(item.trades).forEach((ticker) => {
    const stockInfo = stocksInfo[ticker];
    const stockHistory = stocksHistory[ticker];
    if (!stockInfo || !stockHistory) return;

    setUnits(ticker, item.trades[ticker]);

    const price =
      Object.keys(item.trades).length === 1
        ? item.totalTradeCost / item.trades[ticker]
        : exchangeCurrency(
            stockHistory.close.get(item.date) ?? 0,
            stockInfo.Currency ?? baseCurrency,
            baseCurrency,
            (forexPair) => stocksHistory[forexPair]?.close.get(item.date)
          );
    const units = newUnits[ticker];
    const currentCost = costs[ticker] ?? 0;
    const currentUnits = numShares[ticker] ?? 0;
    newCosts[ticker] =
      (currentCost * currentUnits + price * units) / (currentUnits + units);
  });
  // Stock dividend
  Object.keys(item.stockDividend).forEach((ticker) => {
    const currentCost = newCosts[ticker] ?? costs[ticker] ?? 0;
    const currentUnits = numShares[ticker] ?? 0 + newUnits[ticker] ?? 0;

    setUnits(ticker, item.stockDividend[ticker]);
    newCosts[ticker] =
      (currentCost * currentUnits) /
      (currentUnits + item.stockDividend[ticker]);
  });
  return newCosts;
}

export function collectCash(item: ActivityIterateItem, prevCash: number) {
  return prevCash + item.deposit + item.cashDividend - item.totalTradeCost;
}

export function collectCashFlow(
  item: ActivityIterateItem,
  prevCashFlow: number
) {
  return {
    totalCashFlow: prevCashFlow + item.deposit,
    lastCashFlow: [item.date, item.deposit] as const,
  };
}

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
  costs: { [ticker: string]: number },
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
    const cost = costs[ticker];
    const gain = value - cost * units;
    const returns = gain / (cost * units);

    holdings[ticker] = {
      units,
      value,
      gain,
      returns,
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

export function cutTimeSeries(
  series: TimeSeries,
  startDate: Date,
  endDate: Date
) {
  // Filter out of range data
  const startDay = dayjs(startDate);
  const endDay = dayjs(endDate);
  series.data = series.data.filter(
    (d) => startDay.isSameOrBefore(d[0]) && endDay.isAfter(d[0])
  );
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
