import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import minMax from 'dayjs/plugin/minMax';
import firebase from 'firebase/app';
import 'firebase/functions';
import {
  normalizeForex,
  getForexPair,
  TimeSeries,
  Portfolio,
  Snapshot,
} from '@tuja/libs';
import type { PortfolioPerformance } from 'libs/portfolioClient';
import { StockHistory, StockInfo, StockLivePrice } from 'libs/stocksClient';
import {
  getDB,
  getStocksHistory,
  getStocksInfo,
  getStocksLivePrice,
} from 'libs/cachedStocksData';
import { iterateSnapshots } from './modules/snapshotsIterator';
import {
  accumulateDailyTwrr,
  calcBenchmarkReturn,
  calcDailyTwrr,
  calcGain,
  calcHoldings,
  calcHoldingsValues,
} from './modules/activityProcessors';

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
  snapshots: Snapshot[];
  startDate: Date;
  endDate: Date;
  baseCurrency: Portfolio['currency'];
  benchmark: Portfolio['benchmark'];
  portfolioId: Portfolio['id'];
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
  if (messageData.type !== 'process-portfolio') return false;
  const { payload } = messageData;
  if (!payload) return false;
  const { snapshots, baseCurrency, startDate, endDate, portfolioId } = payload;
  if (!snapshots || !baseCurrency || !startDate || !endDate || !portfolioId)
    return false;
  return true;
}

/**
 * Process portfolio
 */
async function processPortfolio(payload: ProcessPortfolioPayload) {
  const {
    snapshots,
    baseCurrency,
    startDate,
    endDate,
    benchmark,
    portfolioId,
  } = payload;

  // Open DB
  const db = await getDB();

  // Find the tickers that have been held during the time frame
  const tickers = new Set<string>();
  snapshots.forEach((snapshot) => {
    Object.keys(snapshot.numShares).forEach((ticker) => {
      if (snapshot.numShares[ticker]) {
        tickers.add(ticker);
      }
    });
  });
  if (benchmark) {
    tickers.add(benchmark);
  }

  // Fetch stocks info and get required currency pairs
  const stocksInfo = await getStocksInfo(db, [...tickers]);
  const currencies = [
    ...new Set(
      Object.keys(stocksInfo)
        .map((ticker) => stocksInfo[ticker])
        .filter((x) => !!x)
        .map((info) => {
          const normalized = normalizeForex(info.Currency);
          return normalized.currency !== baseCurrency
            ? normalized.currency
            : null;
        })
        .filter(<T extends {}>(x: T | null): x is T => !!x)
        .map((normalizedCurrency) =>
          getForexPair(normalizedCurrency, baseCurrency)
        )
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
    portfolioId,
    snapshots,
    baseCurrency,
    startDate,
    endDate,
    stocksInfo,
    stocksHistory,
    stocksLivePrices,
    benchmark
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
    if (stockHistory && livePrice.close !== 'NA') {
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
  portfolioId: string,
  snapshots: Snapshot[],
  baseCurrency: string,
  startDate: Date,
  endDate: Date,
  stocksInfo: { [ticker: string]: StockInfo },
  stocksHistory: { [ticker: string]: StockHistory },
  stocksLivePrice: { [ticker: string]: StockLivePrice },
  benchmark?: string
): PortfolioPerformance {
  const valueSeries = new TimeSeries();
  const gainSeries = new TimeSeries();
  const dailyTwrrSeries = new TimeSeries();
  const cashFlowSeries = new TimeSeries();
  const benchmarkSeries = new TimeSeries();

  // Loop to get monthly dividends
  const startOfMonth = dayjs(startDate).startOf('month');
  const monthlyDividends = new TimeSeries();
  snapshots.forEach((snapshot) => {
    if (!snapshot.dividend || startOfMonth.isAfter(snapshot.date)) return;

    const dividends = monthlyDividends.data;
    if (
      dividends.length &&
      dayjs(snapshot.date).isSame(dividends[dividends.length - 1][0], 'month')
    ) {
      dividends[dividends.length - 1][1] += snapshot.dividend;
    } else {
      dividends.push([
        dayjs(snapshot.date).startOf('month').toDate(),
        snapshot.dividend,
      ]);
    }
  });

  let benchmarkInitial = 0;
  iterateSnapshots({
    snapshots,
    startDate,
    endDate,
    onDate: (date, snapshot, prevSnapshot) => {
      const { totalHoldingsValue } = calcHoldingsValues(
        date,
        snapshot.numShares,
        stocksInfo,
        stocksHistory,
        baseCurrency
      );
      const totalValue = totalHoldingsValue + snapshot.cash;
      valueSeries.data.push([date, totalValue]);

      const gain = calcGain(totalValue, snapshot.cashFlow);
      gainSeries.data.push([date, gain]);

      const dailyTwrr = calcDailyTwrr(date, valueSeries, [
        snapshot.date,
        snapshot.cashFlow - (prevSnapshot?.cashFlow ?? 0),
      ]);
      dailyTwrrSeries.data.push([date, dailyTwrr]);

      cashFlowSeries.data.push([date, snapshot.cashFlow]);

      if (benchmark) {
        const startDay = dayjs(startDate);
        const benchmarkVal = stocksHistory[benchmark].adjusted?.get(date);
        if (startDay.isSameOrBefore(date)) {
          if (!benchmarkInitial && benchmarkVal) {
            benchmarkInitial = benchmarkVal;
          }
          benchmarkSeries.data.push([
            date,
            calcBenchmarkReturn(
              date,
              stocksHistory,
              benchmarkInitial,
              benchmark
            ),
          ]);
        }
      }
    },
  });

  const twrrSeries = accumulateDailyTwrr(dailyTwrrSeries, startDate, endDate);

  if (gainSeries.data.length) {
    const initialGain = gainSeries.data[0][1];
    gainSeries.data = gainSeries.data.map((d) => [d[0], d[1] - initialGain]);
  }

  const holdings = calcHoldings(
    snapshots[snapshots.length - 1]?.numShares,
    endDate,
    baseCurrency,
    stocksInfo,
    stocksHistory,
    stocksLivePrice
  );

  return {
    id: portfolioId,
    valueSeries,
    gainSeries,
    twrrSeries,
    cashFlowSeries,
    lastSnapshot: snapshots[snapshots.length - 1],
    totalHoldingsValue:
      valueSeries.getLast() - (snapshots[snapshots.length - 1]?.cash ?? 0),
    holdings,
    benchmarkSeries: benchmark ? benchmarkSeries : undefined,
    monthlyDividends,
  } as PortfolioPerformance;
}
