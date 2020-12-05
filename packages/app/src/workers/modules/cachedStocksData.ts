import dayjs from 'dayjs';
import { IDBPDatabase, DBSchema, openDB } from 'idb';
import {
  fetchStocksHistory,
  fetchStocksInfo,
  getMissingStocksHistory,
  StockHistory,
  StockInfo,
} from 'libs/stocksClient';
import TimeSeries from 'libs/timeSeries';

interface DBSchemaV2 extends DBSchema {
  stocksInfo: {
    key: string;
    value: StockInfo;
  };
  stocksHistory: {
    key: string;
    value: StockHistory;
  };
}

type Database = IDBPDatabase<DBSchemaV2>;

export function getDB(): Promise<Database> {
  return openDB<DBSchemaV2>('stocksData', 2, {
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
    console.log('fetch info', tickersToFetch);
    const fetchedStocksInfo = await fetchStocksInfo(tickersToFetch);

    const writeTx = db.transaction(['stocksInfo'], 'readwrite');
    const writeStore = writeTx.objectStore('stocksInfo');
    await Promise.all(
      fetchedStocksInfo.map((stockInfo) => {
        stocksInfo[stockInfo.Ticker] = stockInfo;
        return writeStore.add(stockInfo);
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
  await Promise.all(
    missingHistory.map(async (fetchInfo) => {
      console.log(
        'fetch history',
        fetchInfo.ticker,
        fetchInfo.startDate.toLocaleDateString(),
        fetchInfo.endDate.toLocaleDateString()
      );
      const history = await fetchStocksHistory(
        fetchInfo.ticker,
        fetchInfo.startDate,
        fetchInfo.endDate
      );

      if (!(fetchInfo.ticker in stocksHistory)) {
        stocksHistory[fetchInfo.ticker] = {
          ticker: fetchInfo.ticker,
          close: history.closeSeries,
          adjusted: history.adjustedSeries,
          range: { startDate: fetchInfo.startDate, endDate: fetchInfo.endDate },
        };
      } else {
        const current = stocksHistory[fetchInfo.ticker];
        stocksHistory[current.ticker] = {
          ticker: current.ticker,
          close: current.close.mergeWith(history.closeSeries),
          adjusted: current.adjusted.mergeWith(history.adjustedSeries),
          range: {
            startDate: dayjs
              .min(dayjs(startDate), dayjs(current.range.startDate))
              .toDate(),
            endDate: dayjs
              .max(dayjs(endDate), dayjs(current.range.endDate))
              .toDate(),
          },
        };
      }
    })
  );

  const writeTx = db.transaction('stocksHistory', 'readwrite');
  const writeStore = writeTx.objectStore('stocksHistory');

  await Promise.all(
    missingHistory.map(({ ticker }) => writeStore.put(stocksHistory[ticker]))
  );
  await writeTx.done;

  return stocksHistory;
}

export async function clearCache(db: Database) {
  const clearStocksHistoryTx = db.transaction('stocksHistory', 'readwrite');
  await clearStocksHistoryTx.objectStore('stocksHistory').clear();

  const clearStocksInfoTx = db.transaction('stocksInfo', 'readwrite');
  await clearStocksInfoTx.objectStore('stocksInfo').clear();
}
