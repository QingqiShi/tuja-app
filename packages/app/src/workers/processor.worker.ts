import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import minMax from 'dayjs/plugin/minMax';
import firebase from 'firebase/app';
import 'firebase/functions';
import type { Portfolio, PortfolioPerformance } from 'libs/portfolio';
import { getForexPair } from 'libs/forex';
import { StockHistory, StockInfo, StockLivePrice } from 'libs/stocksClient';
import TimeSeries from 'libs/timeSeries';
import {
  getActivitiesIterator,
  iterateActivities,
} from './modules/activityIterator';
import {
  accumulateDailyTwrr,
  calcBenchmarkReturn,
  calcDailyTwrr,
  calcGain,
  calcHoldings,
  calcHoldingsValues,
  collectCash,
  collectCashFlow,
  collectHoldingsCost,
  collectHoldingsNumShares,
  cutTimeSeries,
} from './modules/activityProcessors';
import {
  getDB,
  getStocksHistory,
  getStocksInfo,
  getStocksLivePrice,
} from './modules/cachedStocksData';

firebase.initializeApp({
  apiKey: 'AIzaSyBHHoqcowFL7iaC2LP6QrP-pQyxUCqB3QM',
  authDomain: 'portfolio-mango.firebaseapp.com',
  databaseURL: 'https://portfolio-mango.firebaseio.com',
  projectId: 'portfolio-mango',
  storageBucket: 'portfolio-mango.appspot.com',
  messagingSenderId: '145026996121',
  appId: '1:145026996121:web:55ed0fda14434ae6656508',
  measurementId: 'G-EFQ8TK3ZR3',
});

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(minMax);

interface ProcessPortfolioPayload {
  portfolio: Portfolio;
  startDate: Date;
  endDate: Date;
}

type MessageData = {
  type: 'process-portfolio';
  payload: ProcessPortfolioPayload;
};

/**
 * Worker entry point
 */
// eslint-disable-next-line no-restricted-globals
addEventListener('message', async (event) => {
  const messageData = event.data as MessageData;
  if (!validate(messageData)) {
    postMessage(null);
    return;
  }

  if (messageData.type === 'process-portfolio') {
    await processPortfolio(messageData.payload);
  }
});

/**
 * Validates received message
 */
function validate(messageData: MessageData) {
  if (messageData.type === 'process-portfolio') {
    const { payload } = messageData;
    if (!payload) return false;
    const { portfolio, startDate, endDate } = payload;
    if (!portfolio || !startDate || !endDate) return false;
    const { activities, currency } = portfolio;
    if (!currency || !activities?.length) return false;
    return true;
  }
  return true;
}

/**
 * Process portfolio
 */
async function processPortfolio(payload: ProcessPortfolioPayload) {
  const { portfolio, startDate, endDate } = payload;
  const { activities, currency } = portfolio;

  // Open DB
  const db = await getDB();

  // Find the tickers that have been held during the time frame
  const tickers = new Set<string>();
  const activitiesIterator = getActivitiesIterator(activities);
  let numShares: { [ticker: string]: number } = {};
  iterateActivities(activitiesIterator, {
    onActivity: (item) => {
      numShares = collectHoldingsNumShares(item, numShares);
    },
    onDate: (date) => {
      const day = dayjs(date);
      if (day.isSameOrAfter(startDate) && day.isSameOrBefore(endDate)) {
        Object.keys(numShares).forEach((ticker) => {
          if (numShares[ticker]) {
            tickers.add(ticker);
          }
        });
      }
    },
  });
  if (portfolio.benchmark) {
    tickers.add(portfolio.benchmark);
  }

  // Fetch stocks info and get required currency pairs
  const stocksInfo = await getStocksInfo(db, [...tickers]);
  const currencies = [
    ...new Set(
      Object.keys(stocksInfo)
        .map((ticker) => stocksInfo[ticker])
        .filter((x) => !!x)
        .map((info) => getForexPair(info.Currency, (currency as any) ?? 'GBP'))
        .filter(<T extends {}>(x: T | null): x is T => !!x)
    ),
  ];

  // Fetch historical data for tickers and currencies
  const stocksHistory = await getStocksHistory(
    db,
    [...tickers, ...currencies],
    startDate,
    endDate
  );

  // Fetch live prices and merge into stocksHistory
  const stocksLivePrices = await getStocksLivePrice(db, [
    ...tickers,
    ...currencies,
  ]);
  mergeLivePricesIntoHistory(stocksLivePrices, stocksHistory);

  // Process portfolio
  const performance = calculatePerformance(
    portfolio,
    startDate,
    endDate,
    stocksInfo,
    stocksHistory,
    stocksLivePrices
  );

  // Clean up and return results
  db.close();
  postMessage({ type: 'process-portfolio', payload: performance });
}

/**
 * Merge live prices into stocks history
 */
function mergeLivePricesIntoHistory(
  livePrices: { [ticker: string]: StockLivePrice },
  stocksHistory: {
    [ticker: string]: StockHistory;
  }
) {
  Object.keys(livePrices).forEach((ticker) => {
    const livePrice = livePrices[ticker];
    const stockHistory = stocksHistory[livePrice.code];
    if (stockHistory) {
      const livePriceSeries = new TimeSeries({
        data: [[livePrice.date, livePrice.close]],
      });
      stockHistory.close = stockHistory.close.mergeWith(livePriceSeries);
      stockHistory.adjusted = stockHistory.adjusted.mergeWith(livePriceSeries);
    }
  });
}

/**
 * Calculate portfolio performance
 */
function calculatePerformance(
  portfolio: Portfolio,
  startDate: Date,
  endDate: Date,
  stocksInfo: { [ticker: string]: StockInfo },
  stocksHistory: { [ticker: string]: StockHistory },
  stocksLivePrice: { [ticker: string]: StockLivePrice }
): PortfolioPerformance {
  const { activities, currency } = portfolio;
  const activitiesIterator = getActivitiesIterator(activities);

  let ctx = {
    numShares: {} as { [ticker: string]: number },
    costs: {} as { [ticker: string]: number },
    cash: 0,
    cashFlow: 0,
    lastCashFlow: null as null | readonly [Date, number],
    benchmarkInitial: 0,
  };
  const valueSeries = new TimeSeries();
  const gainSeries = new TimeSeries();
  const dailyTwrrSeries = new TimeSeries();
  const cashFlowSeries = new TimeSeries();
  const benchmarkSeries = new TimeSeries();

  iterateActivities(activitiesIterator, {
    onActivity: (item) => {
      const cashFlow = collectCashFlow(item, ctx.cashFlow);
      ctx = {
        numShares: collectHoldingsNumShares(item, ctx.numShares),
        costs: collectHoldingsCost(
          item,
          ctx,
          stocksInfo,
          stocksHistory,
          currency
        ),
        cash: collectCash(item, ctx.cash),
        cashFlow: cashFlow.totalCashFlow,
        lastCashFlow: cashFlow.lastCashFlow,
        benchmarkInitial: ctx.benchmarkInitial,
      };
    },
    onDate: (date) => {
      const { totalHoldingsValue } = calcHoldingsValues(
        date,
        ctx.numShares,
        stocksInfo,
        stocksHistory,
        currency
      );
      const totalValue = totalHoldingsValue + ctx.cash;
      valueSeries.data.push([date, totalValue]);

      const gain = calcGain(totalValue, ctx.cashFlow);
      gainSeries.data.push([date, gain]);

      const dailyTwrr = calcDailyTwrr(date, valueSeries, ctx.lastCashFlow);
      dailyTwrrSeries.data.push([date, dailyTwrr]);

      cashFlowSeries.data.push([date, ctx.cashFlow]);

      if (portfolio.benchmark) {
        const startDay = dayjs(startDate);
        const benchmarkVal = stocksHistory[portfolio.benchmark].adjusted?.get(
          date
        );
        if (startDay.isSameOrBefore(date)) {
          if (!ctx.benchmarkInitial && benchmarkVal) {
            ctx.benchmarkInitial = benchmarkVal;
          }
          benchmarkSeries.data.push([
            date,
            calcBenchmarkReturn(
              date,
              stocksHistory,
              ctx.benchmarkInitial,
              portfolio.benchmark
            ),
          ]);
        }
      }
    },
  });

  cutTimeSeries(valueSeries, startDate, endDate);
  cutTimeSeries(gainSeries, startDate, endDate);
  cutTimeSeries(cashFlowSeries, startDate, endDate);
  cutTimeSeries(benchmarkSeries, startDate, endDate);
  const twrrSeries = accumulateDailyTwrr(dailyTwrrSeries, startDate, endDate);

  const holdings = calcHoldings(
    ctx.numShares,
    ctx.costs,
    endDate,
    currency,
    stocksInfo,
    stocksHistory,
    stocksLivePrice
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
    benchmarkSeries,
  };
}
