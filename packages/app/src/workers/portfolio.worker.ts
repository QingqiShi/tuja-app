import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import TimeSeries from 'libs/timeSeries';
import type { Portfolio, PortfolioPerformance } from 'libs/portfolio';
import type { StocksData } from 'libs/stocksClient';
import {
  getActivitiesIterator,
  iterateActivities,
} from './portfolioWorker/activityIterator';
import {
  collectHoldingsNumShares,
  collectHoldingsCost,
  collectCash,
  collectCashFlow,
  calcHoldingsValues,
  calcDailyTwrr,
  calcGain,
  calcHoldings,
  accumulateDailyTwrr,
  cutTimeSeries,
} from './portfolioWorker/activityProcessors';

dayjs.extend(isSameOrBefore);

interface Payload {
  portfolio: Portfolio;
  stocksData: StocksData;
  startDate: Date;
  endDate: Date;
}

/**
 * Worker entry point
 */
// eslint-disable-next-line no-restricted-globals
addEventListener('message', (event) => {
  const payload = event.data as Payload;

  if (!validatePayload(payload)) {
    postMessage(null);
    return;
  }

  Object.keys(payload.stocksData).forEach((ticker) => {
    const stockData = payload.stocksData[ticker];
    if (stockData.closeSeries) {
      stockData.closeSeries = new TimeSeries(stockData.closeSeries);
    }
    if (stockData.adjustedSeries) {
      stockData.adjustedSeries = new TimeSeries(stockData.adjustedSeries);
    }
  });

  const result = processPayload(payload);
  postMessage(result);
});

/**
 * validates worker payload
 */
function validatePayload(payload: Payload) {
  const { portfolio, stocksData, startDate, endDate } = payload;
  if (!portfolio || !stocksData || !startDate || !endDate) return false;
  const { activities, currency } = portfolio;
  if (!currency || !activities?.length) return false;
  return true;
}

/**
 * Kick off the process to calculate portfolio performance
 */
function processPayload(payload: Payload): PortfolioPerformance {
  const { portfolio, stocksData, startDate, endDate } = payload;
  const { activities, currency } = portfolio;

  const activitiesIterator = getActivitiesIterator(activities);

  let ctx = {
    numShares: {} as { [ticker: string]: number },
    costs: {} as { [ticker: string]: number },
    cash: 0,
    cashFlow: 0,
    lastCashFlow: null as null | readonly [Date, number],
  };
  const valueSeries = new TimeSeries();
  const gainSeries = new TimeSeries();
  const dailyTwrrSeries = new TimeSeries();
  const cashFlowSeries = new TimeSeries();

  iterateActivities(activitiesIterator, {
    onActivity: (item) => {
      const cashFlow = collectCashFlow(item, ctx.cashFlow);
      ctx = {
        numShares: collectHoldingsNumShares(item, ctx.numShares),
        costs: collectHoldingsCost(item, ctx, stocksData, currency),
        cash: collectCash(item, ctx.cash),
        cashFlow: cashFlow.totalCashFlow,
        lastCashFlow: cashFlow.lastCashFlow,
      };
    },
    onDate: (date) => {
      const { totalHoldingsValue } = calcHoldingsValues(
        date,
        ctx.numShares,
        stocksData,
        currency
      );
      const totalValue = totalHoldingsValue + ctx.cash;
      valueSeries.data.push([date, totalValue]);

      const gain = calcGain(totalValue, ctx.cashFlow);
      gainSeries.data.push([date, gain]);

      const dailyTwrr = calcDailyTwrr(date, valueSeries, ctx.lastCashFlow);
      dailyTwrrSeries.data.push([date, dailyTwrr]);

      cashFlowSeries.data.push([date, ctx.cashFlow]);
    },
  });

  cutTimeSeries(valueSeries, startDate, endDate);
  cutTimeSeries(gainSeries, startDate, endDate);
  cutTimeSeries(cashFlowSeries, startDate, endDate);
  const twrrSeries = accumulateDailyTwrr(dailyTwrrSeries, startDate, endDate);

  const holdings = calcHoldings(
    ctx.numShares,
    ctx.costs,
    stocksData,
    endDate,
    currency
  );

  return {
    id: portfolio.id,
    valueSeries,
    gainSeries,
    twrrSeries,
    cashFlowSeries,
    cash: ctx.cash,
    totalHoldingsValue: valueSeries.getLast() - ctx.cash,
    holdings,
  };
}
