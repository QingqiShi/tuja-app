import dayjs from 'dayjs';
import { IDBPDatabase, DBSchema, openDB } from 'idb-latest';
import {
  TimeSeries,
  StockInfo,
  normalizeForex,
  getForexPair,
} from '@tuja/libs';
import {
  StockHistory,
  ParsedLivePrice,
  fetchStockLivePrices,
  fetchStockHistories,
  fetchStockInfos,
} from './apiClient';

interface DBSchemaV3 extends DBSchema {
  stocksInfo: {
    key: string;
    value: StockInfo;
  };
  stocksHistory: {
    key: string;
    value: StockHistory;
  };
  stocksLivePrice: {
    key: string;
    value: { timestamp: number; livePrice: ParsedLivePrice };
  };
}

type Database = IDBPDatabase<DBSchemaV3>;

export function getDB(): Promise<Database> {
  return openDB<DBSchemaV3>('stocksData', 3, {
    upgrade(upgradeDB, oldVersion) {
      if (oldVersion < 1) {
        upgradeDB.createObjectStore('stocksInfo', {
          keyPath: 'Ticker',
        });
      }
      if (oldVersion < 2) {
        upgradeDB.createObjectStore('stocksHistory', {
          keyPath: 'ticker',
        });
      }
      if (oldVersion < 3) {
        upgradeDB.createObjectStore('stocksLivePrice', {
          keyPath: 'livePrice.code',
        });
      }
    },
  });
}

export async function getStocksInfo(db: Database, tickers: string[]) {
  const stocksInfo: { [ticker: string]: StockInfo } = {};
  const readTx = db.transaction(['stocksInfo'], 'readonly');
  const readStore = readTx.objectStore('stocksInfo');

  // Get stocks info from the cache db
  await Promise.all(
    tickers.map(async (ticker) => {
      const stockInfo = await readStore.get(ticker);
      if (stockInfo) {
        stocksInfo[ticker] = stockInfo;
      }
    })
  );
  await readTx.done;

  // Fetch missing stocks info and write to cache
  const tickersToFetch = tickers.filter((ticker) => !(ticker in stocksInfo));
  if (tickersToFetch.length) {
    const fetchedStocksInfo = await fetchStockInfos(tickersToFetch);

    const writeTx = db.transaction(['stocksInfo'], 'readwrite');
    const writeStore = writeTx.objectStore('stocksInfo');
    await Promise.all(
      fetchedStocksInfo.map((stockInfo) => {
        stocksInfo[stockInfo.Ticker] = stockInfo;
        return writeStore.put(stockInfo);
      })
    );
    await writeTx.done;
  }

  return stocksInfo;
}

export async function getStocksHistory(
  db: Database,
  tickers: string[],
  startDate: Date,
  endDate: Date
) {
  const stocksHistory: { [ticker: string]: StockHistory } = {};
  const readTx = db.transaction('stocksHistory', 'readonly');
  const readStore = readTx.objectStore('stocksHistory');

  // Get stocks history from the cache db
  await Promise.all(
    tickers.map(async (ticker) => {
      const stockHistory = await readStore.get(ticker);
      if (stockHistory) {
        stocksHistory[ticker] = stockHistory;
        stocksHistory[ticker] = {
          ...stockHistory,
          close: new TimeSeries(stockHistory.close),
          adjusted: new TimeSeries(stockHistory.adjusted),
        };
      }
    })
  );
  await readTx.done;

  // Fetch missing stocks history and write to cache
  const missingHistory = getMissingStocksHistory(
    tickers,
    stocksHistory,
    startDate,
    endDate
  );
  const histories = await fetchStockHistories(
    missingHistory.map((mh) => ({
      ticker: mh.ticker,
      from: mh.startDate,
      to: mh.endDate,
    }))
  );
  histories.forEach(({ ticker, from, to, closeSeries, adjustedSeries }) => {
    if (!(ticker in stocksHistory)) {
      stocksHistory[ticker] = {
        ticker: ticker,
        close: closeSeries,
        adjusted: adjustedSeries,
        range: { startDate: from, endDate: to },
      };
    } else {
      const current = stocksHistory[ticker];
      stocksHistory[current.ticker] = {
        ticker: current.ticker,
        close: current.close.mergeWith(closeSeries),
        adjusted: current.adjusted.mergeWith(adjustedSeries),
        range: {
          startDate: dayjs
            .min(dayjs(from), dayjs(current.range.startDate))
            .toDate(),
          endDate: dayjs.max(dayjs(to), dayjs(current.range.endDate)).toDate(),
        },
      };
    }
  });

  const writeTx = db.transaction('stocksHistory', 'readwrite');
  const writeStore = writeTx.objectStore('stocksHistory');

  await Promise.all(
    histories.map(({ ticker }) => writeStore.put(stocksHistory[ticker]))
  );
  await writeTx.done;

  return stocksHistory;
}

export async function getStocksLivePrice(db: Database, tickers: string[]) {
  const stocksLivePrice: { [ticker: string]: ParsedLivePrice } = {};
  const readTx = db.transaction(['stocksLivePrice'], 'readonly');
  const readStore = readTx.objectStore('stocksLivePrice');
  const timestamp = new Date().getTime();
  const threshold = 60000; // 1 minutes

  // Get stocks info from the cache db
  await Promise.all(
    tickers.map(async (ticker) => {
      const stockLivePrice = await readStore.get(ticker);
      if (stockLivePrice && timestamp - stockLivePrice.timestamp < threshold) {
        stocksLivePrice[ticker] = stockLivePrice.livePrice;
      }
    })
  );
  await readTx.done;

  // Fetch missing stocks info and write to cache
  const tickersToFetch = tickers.filter(
    (ticker) => !(ticker in stocksLivePrice)
  );
  if (tickersToFetch.length) {
    const fetchedStocksLivePrice = await fetchStockLivePrices(tickersToFetch);

    const writeTx = db.transaction(['stocksLivePrice'], 'readwrite');
    const writeStore = writeTx.objectStore('stocksLivePrice');
    await Promise.all(
      fetchedStocksLivePrice.map((stockLivePrice) => {
        stocksLivePrice[stockLivePrice.code] = stockLivePrice;
        return writeStore.put({ timestamp, livePrice: stockLivePrice });
      })
    );
    await writeTx.done;
  }

  return stocksLivePrice;
}

export async function clearCache(db: Database) {
  const clearStocksHistoryTx = db.transaction('stocksHistory', 'readwrite');
  await clearStocksHistoryTx.objectStore('stocksHistory').clear();

  const clearStocksInfoTx = db.transaction('stocksInfo', 'readwrite');
  await clearStocksInfoTx.objectStore('stocksInfo').clear();

  const clearStocksLivePriceTx = db.transaction('stocksLivePrice', 'readwrite');
  await clearStocksLivePriceTx.objectStore('stocksLivePrice').clear();
}

/**
 * Merge live prices into stocks history
 */
export const mergeLivePriceIntoHistory = async (
  livePrice: ParsedLivePrice,
  stockHistory: StockHistory
) => {
  if (livePrice.close !== 'NA') {
    const livePriceSeries = new TimeSeries({
      data: [[livePrice.date, livePrice.close]],
    });
    stockHistory.close = stockHistory.close.mergeWith(livePriceSeries);
    stockHistory.adjusted = stockHistory.adjusted.mergeWith(livePriceSeries);
  }
};

export const prefetchStocksHistory = async (
  tickers: string[],
  baseCurrency: string
) => {
  const db = await getDB();
  const stocksInfo = await getStocksInfo(db, tickers);
  const currencyPairs = [
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

  const startDate = dayjs('1970-01-01', 'YYYY-MM-DD').toDate();
  const endDate = new Date();

  const stocksHistory = await getStocksHistory(
    db,
    [...tickers, ...currencyPairs],
    startDate,
    endDate
  );

  const dateRange = Object.keys(stocksHistory).reduce(
    (range, ticker) => {
      const tickerStartDate = stocksHistory[ticker].adjusted.data[0][0];
      const tickerEndDate =
        stocksHistory[ticker].adjusted.data[
          stocksHistory[ticker].adjusted.data.length - 1
        ][0];

      return {
        startDate: dayjs(tickerStartDate).isAfter(range.startDate)
          ? tickerStartDate
          : range.startDate,
        endDate: dayjs(tickerEndDate).isBefore(range.endDate)
          ? tickerEndDate
          : range.endDate,
      };
    },
    { startDate, endDate }
  );

  return {
    stocksInfo,
    stocksHistory,
    dateRange,
  };
};

function getMissingStocksHistory(
  tickers: string[],
  stocksHistory: { [ticker: string]: StockHistory },
  startDate: Date,
  endDate: Date
) {
  const today = dayjs();
  const actualEndDate = today.isSame(endDate, 'day')
    ? dayjs(endDate).subtract(1, 'day').toDate()
    : endDate;
  return tickers.flatMap((ticker) => {
    const existingData = stocksHistory[ticker];

    if (
      !existingData ||
      !existingData.range ||
      !existingData.adjusted ||
      !existingData.close
    ) {
      return { ticker, startDate, endDate: actualEndDate };
    }

    const missingData = [];

    if (dayjs(startDate).isBefore(existingData.range.startDate, 'date')) {
      missingData.push({
        ticker,
        startDate,
        endDate: dayjs(existingData.range.startDate)
          .subtract(1, 'day')
          .toDate(),
      });
    }

    if (dayjs(actualEndDate).isAfter(existingData.range.endDate, 'date')) {
      missingData.push({
        ticker,
        startDate: dayjs(existingData.range.endDate).add(1, 'day').toDate(),
        endDate: actualEndDate,
      });
    }

    return missingData;
  });
}
