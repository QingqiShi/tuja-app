import dayjs from 'dayjs';
import {
  normalizeForex,
  getForexPair,
  TimeSeries,
  Portfolio,
  Snapshot,
  StockInfo,
} from '@tuja/libs';
import type { PortfolioPerformance } from '../libs/portfolioClient';
import type { StockHistory, ParsedLivePrice } from '../libs/apiClient';
import {
  getDB,
  getStocksHistory,
  getStocksInfo,
  getStocksLivePrice,
  mergeLivePriceIntoHistory,
} from '../libs/cachedStocksData';
import { iterateSnapshots } from './modules/snapshotsIterator';
import {
  accumulateDailyTwrr,
  calcBenchmarkReturn,
  calcDailyTwrr,
  calcGain,
  calcHoldings,
  calcHoldingsValues,
} from './modules/activityProcessors';

interface ProcessPortfolioPayload {
  snapshots: { [portfolioId: string]: Snapshot[] };
  startDate: Date;
  endDate: Date;
  baseCurrency: Portfolio['currency'];
  portfolioId?: Portfolio['id'];
  benchmark?: Portfolio['benchmark'];
}

interface StocksData {
  stocksInfo: { [ticker: string]: StockInfo };
  stocksHistory: { [ticker: string]: StockHistory };
  stocksLivePrices: { [ticker: string]: ParsedLivePrice };
}

type MessageData = {
  type: 'process-portfolio';
  payload: ProcessPortfolioPayload;
};

export const listener = async (
  event: MessageEvent<any>,
  postMessage: (message: any) => void
) => {
  const messageData = event.data as MessageData;
  if (!validate(messageData)) {
    postMessage(null);
    return;
  }

  messageData.payload.startDate.setHours(0);
  messageData.payload.startDate.setMinutes(0);
  messageData.payload.startDate.setSeconds(0);
  messageData.payload.startDate.setMilliseconds(0);
  messageData.payload.endDate.setHours(0);
  messageData.payload.endDate.setMinutes(0);
  messageData.payload.endDate.setSeconds(0);
  messageData.payload.endDate.setMilliseconds(0);

  try {
    const result = await process(messageData.payload);
    postMessage({
      type: 'process-portfolio',
      payload: result,
    });
  } catch (e) {
    postMessage(null);
  }
};

/**
 * Validates received message
 */
function validate(messageData: MessageData) {
  if (messageData.type !== 'process-portfolio') return false;
  const { payload } = messageData;
  if (!payload) return false;
  const { snapshots, baseCurrency, startDate, endDate } = payload;
  if (!snapshots || !baseCurrency || !startDate || !endDate) return false;
  return true;
}

/**
 * Process payload and get performance
 */
async function process(payload: ProcessPortfolioPayload) {
  const { snapshots, portfolioId } = payload;

  const stocksData = await fetchStocksData(payload);

  const performances = await Promise.all(
    Object.keys(snapshots).map((portfolioId) =>
      calculatePerformance(portfolioId, payload, stocksData)
    )
  );

  const aggregated = aggregatePerformances(performances, payload);

  return {
    ...aggregated,
    portfolio:
      performances.find((performance) => performance.id === portfolioId) ??
      performances[0],
  };
}

async function fetchStocksData(payload: ProcessPortfolioPayload) {
  const { snapshots, benchmark, baseCurrency, startDate, endDate } = payload;

  // Find the tickers that have been held during the time frame
  const tickers = new Set<string>();
  Object.values(snapshots)
    .flatMap((snapshot) => snapshot)
    .forEach((snapshot) => {
      Object.keys(snapshot.numShares).forEach((ticker) => {
        if (snapshot.numShares[ticker]) {
          tickers.add(ticker);
        }
      });
    });
  if (benchmark) {
    tickers.add(benchmark);
  }

  const db = await getDB();

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

  // Find the tickers are held at the end
  const finalHoldings = new Set<string>();
  Object.values(snapshots).forEach((snaps) => {
    Object.keys(snaps[snaps.length - 1]?.numShares ?? {}).forEach((ticker) => {
      if (snaps[snaps.length - 1]?.numShares[ticker]) {
        finalHoldings.add(ticker);
      }
    });
  });
  if (benchmark) {
    finalHoldings.add(benchmark);
  }

  // Fetch data required
  const [stocksHistory, stocksLivePrices] = await Promise.all([
    getStocksHistory(db, [...tickers, ...currencies], startDate, endDate),
    getStocksLivePrice(db, [...finalHoldings, ...currencies]),
  ]);

  db.close();

  mergeLivePricesIntoHistory(stocksLivePrices, stocksHistory);
  return { stocksInfo, stocksHistory, stocksLivePrices };
}

/**
 * Merge live prices into stocks history
 */
function mergeLivePricesIntoHistory(
  livePrices: { [ticker: string]: ParsedLivePrice },
  stocksHistory: {
    [ticker: string]: StockHistory;
  }
) {
  Object.keys(livePrices).forEach((ticker) => {
    const livePrice = livePrices[ticker];
    const stockHistory = stocksHistory[livePrice.code];
    if (stockHistory && livePrice) {
      mergeLivePriceIntoHistory(livePrice, stockHistory);
    }
  });
}

/**
 * Calculate portfolio performance
 */
function calculatePerformance(
  portfolioId: string,
  payload: ProcessPortfolioPayload,
  stocksData: StocksData
): PortfolioPerformance['portfolio'] {
  const { snapshots, startDate, endDate, baseCurrency, benchmark } = payload;
  const { stocksInfo, stocksHistory, stocksLivePrices } = stocksData;
  const snaps = snapshots[portfolioId] ?? [];

  const valueSeries = new TimeSeries();
  const gainSeries = new TimeSeries();
  const dailyTwrrSeries = new TimeSeries();
  const cashFlowSeries = new TimeSeries();
  const benchmarkSeries = new TimeSeries();

  // Loop to get monthly dividends
  const startOfMonth = dayjs(startDate).startOf('month');
  const monthlyDividends = new TimeSeries();
  snaps.forEach((snapshot) => {
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
    snapshots: snaps,
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

  const twrrSeries = accumulateDailyTwrr(dailyTwrrSeries);

  if (gainSeries.data.length) {
    const initialGain = gainSeries.data[0][1];
    gainSeries.data = gainSeries.data.map((d) => [d[0], d[1] - initialGain]);
  }

  const holdings = calcHoldings(
    snaps[snaps.length - 1]?.numShares ?? {},
    endDate,
    baseCurrency,
    stocksInfo,
    stocksHistory,
    stocksLivePrices
  );

  return {
    id: portfolioId,
    valueSeries,
    gainSeries,
    twrrSeries,
    cashFlowSeries,
    lastSnapshot: snaps[snaps.length - 1],
    totalHoldingsValue:
      valueSeries.getLast() - (snaps[snaps.length - 1]?.cash ?? 0),
    holdings,
    benchmarkSeries: benchmark ? benchmarkSeries : undefined,
    monthlyDividends,
  };
}

function sumSeries(
  performances: PortfolioPerformance['portfolio'][],
  seriesName:
    | 'valueSeries'
    | 'gainSeries'
    | 'cashFlowSeries'
    | 'monthlyDividends',
  date: Date
) {
  return [
    date,
    performances.reduce(
      (sum, performance) => sum + performance[seriesName].get(date),
      0
    ),
  ] as [Date, number];
}

function aggregatePerformances(
  performances: PortfolioPerformance['portfolio'][],
  payload: ProcessPortfolioPayload
) {
  const { snapshots, startDate, endDate } = payload;

  let valueSeries = new TimeSeries();
  let gainSeries = new TimeSeries();
  let cashFlowSeries = new TimeSeries();
  let monthlyDividends = new TimeSeries();

  if (Object.values(snapshots).every((snaps) => !snaps.length)) {
    return { valueSeries, gainSeries, cashFlowSeries, monthlyDividends };
  }

  const minStartDate = Math.min(
    ...Object.values(snapshots)
      .filter((snaps) => !!snaps.length)
      .map((snaps) => snaps[0].date.getTime())
  );
  const startDay = dayjs(Math.max(startDate.getTime(), minStartDate));
  const endDay = dayjs(endDate);

  for (
    let day = startDay;
    day.isSameOrBefore(endDay, 'day');
    day = day.add(1, 'day')
  ) {
    valueSeries.data.push(sumSeries(performances, 'valueSeries', day.toDate()));
    gainSeries.data.push(sumSeries(performances, 'gainSeries', day.toDate()));
    cashFlowSeries.data.push(
      sumSeries(performances, 'cashFlowSeries', day.toDate())
    );
  }

  // Loop to get monthly dividends
  const startOfMonth = dayjs(startDate).startOf('month');
  for (
    let day = startOfMonth;
    day.isSameOrBefore(endDay, 'month');
    day = day.add(1, 'month')
  ) {
    const dividends = performances.reduce(
      (sum, performance) =>
        sum +
        (performance.monthlyDividends.data.find((d) =>
          day.isSame(d[0], 'month')
        )?.[1] ?? 0),
      0
    );
    if (dividends) {
      monthlyDividends.data.push([day.toDate(), dividends]);
    }
  }

  return { valueSeries, gainSeries, cashFlowSeries, monthlyDividends };
}
