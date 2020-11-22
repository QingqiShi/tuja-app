import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useRef,
  useEffect,
} from 'react';
import dayjs from 'dayjs';
import { IDBPDatabase, DBSchema, openDB } from 'idb';
import {
  StocksData,
  fetchStocksInfo,
  fetchStocksHistory,
  fetchStockLivePrice,
  resolveMissingStocksHistory,
  shouldFetchData,
  StockInfo,
} from 'libs/stocksClient';
import { getForexPair } from 'libs/forex';
import useLoadingState from './useLoadingState';
import TimeSeries, { validateSeries } from 'libs/timeSeries';

export const StocksDataContext = createContext({
  addTickers: async (
    _tickers: string[],
    _startDate: Date | null,
    _baseCurrency: string
  ) => {},
  stocksData: {} as StocksData,
  clearCache: async () => {},
});

interface DBSchemaV2 extends DBSchema {
  stocksInfo: {
    key: string;
    value: StockInfo;
  };
  stocksHistory: {
    key: string;
    value: {
      ticker: string;
      close: TimeSeries;
      adjusted: TimeSeries;
      range: { startDate: Date; endDate: Date };
    };
  };
}

export function StocksDataProvider({ children }: React.PropsWithChildren<{}>) {
  const [, setLoadingState] = useLoadingState();
  const [stocksData, setStocksData] = useState<StocksData>({});
  const [db, setDB] = useState<IDBPDatabase<DBSchemaV2> | null>(null);
  const fetchingTickers = useRef(false);

  // Initialise IndexedDB cache
  useEffect(() => {
    const fetch = async () => {
      setDB(
        await openDB<DBSchemaV2>('stocksData', 2, {
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
        })
      );
    };
    try {
      fetchingTickers.current = true;
      setLoadingState(true);
      fetch();
    } catch (e) {
      console.error(e);
      fetchingTickers.current = false;
      setLoadingState(false);
    }
  }, [setLoadingState]);

  // Callback for fetching current live prices
  const getLivePrices = useCallback(async (tickers: string[]) => {
    console.log('fetch live prices', tickers);
    const livePrices = (await fetchStockLivePrice(tickers)).filter(
      (livePrice) => livePrice?.code
    );
    if (livePrices.length) {
      setStocksData((current) =>
        livePrices
          .filter((livePrice) => current[livePrice.code])
          .reduce((newData, livePrice) => {
            const currentData = current[livePrice.code];
            if (
              currentData.closeSeries?.data.length &&
              currentData.adjustedSeries?.data.length
            ) {
              const seriesEndDate =
                currentData.closeSeries.data?.[
                  currentData.closeSeries.data.length - 1
                ]?.[0];
              if (
                livePrice.close &&
                dayjs(livePrice.date).diff(seriesEndDate, 'day') >= 1
              ) {
                currentData.closeSeries.data.push([
                  livePrice.date,
                  livePrice.close,
                ]);
                currentData.adjustedSeries.data.push([
                  livePrice.date,
                  livePrice.close,
                ]);
              }
            }
            return {
              ...newData,
              [livePrice.code]: { ...currentData, livePrice },
            };
          }, current)
      );
    }
  }, []);

  // Load IndexedDB data
  useEffect(() => {
    const fetch = async () => {
      if (!db) return;

      // Stocks info and history from idb
      const tx = db.transaction(['stocksInfo', 'stocksHistory']);
      const stocksInfo = await tx.objectStore('stocksInfo').getAll();
      const stocksHistory = await tx.objectStore('stocksHistory').getAll();
      await tx.done;

      const newStocksData: StocksData = {};

      stocksInfo.forEach((info) => {
        newStocksData[info.Ticker] = { info };
      });

      // Validate history
      const invalidTickers = stocksHistory
        .filter(
          (history) =>
            !validateSeries(history.close.data) ||
            !validateSeries(history.adjusted.data)
        )
        .map((history) => history.ticker);

      // Remove invalid data from idb
      if (invalidTickers.length) {
        console.log('removing invalid history', invalidTickers);
        const deleteStocksHistoryTx = db.transaction(
          'stocksHistory',
          'readwrite'
        );
        await Promise.all(
          invalidTickers.map((ticker) =>
            deleteStocksHistoryTx.objectStore('stocksHistory').delete(ticker)
          )
        );
        await deleteStocksHistoryTx.done;
      }

      stocksHistory
        .filter((history) => !invalidTickers.includes(history.ticker))
        .forEach((history) => {
          const lastDataPoint = history.adjusted.data.length
            ? history.adjusted.data[history.adjusted.data.length - 1]
            : undefined;
          const livePrice = lastDataPoint && {
            code: history.ticker,
            date: lastDataPoint[0],
            close: lastDataPoint[1],
            previousClose: lastDataPoint[1],
          };

          newStocksData[history.ticker] = {
            ...newStocksData[history.ticker],
            seriesRange: history.range,
            closeSeries: new TimeSeries(history.close),
            adjustedSeries: new TimeSeries(history.adjusted),
            livePrice,
          };
        });

      setStocksData(newStocksData);

      await getLivePrices(Object.keys(newStocksData));

      fetchingTickers.current = false;
      setLoadingState(false);
    };
    try {
      fetch();
    } catch (e) {
      console.error(e);
      fetchingTickers.current = false;
      setLoadingState(false);
    }
  }, [db, getLivePrices, setLoadingState]);

  // Callback for fetching extra data
  const addTickers = useCallback(
    async (tickers: string[], startDate: Date | null, baseCurrency: string) => {
      if (!startDate || fetchingTickers.current || !db) return;

      const currentDay = dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD');
      const historyEndDate = currentDay.subtract(1, 'day').toDate();

      const shouldFetch = tickers.some((ticker) =>
        shouldFetchData(ticker, stocksData, startDate, historyEndDate)
      );
      if (!shouldFetch) return;

      // Start loading state so other calls to addTickers are not executed
      fetchingTickers.current = true;
      setLoadingState(true);

      const newStocksData: StocksData = { ...stocksData };

      // Fetch stocksInfo
      const tickersNeedInfo = tickers.filter(
        (ticker) => !stocksData[ticker]?.info
      );
      if (tickersNeedInfo.length) {
        console.log('fetch info', tickersNeedInfo);
        const fetchedStocksInfo = await fetchStocksInfo(tickersNeedInfo);

        // Store into idb for future use
        const putStocksInfoTx = db.transaction('stocksInfo', 'readwrite');
        await Promise.all(
          fetchedStocksInfo.map((info) => {
            newStocksData[info.Ticker] = { ...stocksData[info.Ticker], info };
            return putStocksInfoTx.objectStore('stocksInfo').add(info);
          })
        );
        await putStocksInfoTx.done;
      }

      // Use stocks info to get a list of required Forex pairs
      const requiredCurrencies = Array.from(
        new Set(
          Object.keys(newStocksData)
            .map((ticker) => newStocksData[ticker].info as StockInfo)
            .filter((x) => !!x)
            .map((info) =>
              getForexPair(info.Currency, (baseCurrency as any) ?? 'GBP')
            )
            .filter(<T extends {}>(x: T | null): x is T => !!x)
        )
      );
      console.log('required currencies', requiredCurrencies);

      // Fetch stocksHistory
      const allTickers = [...tickers, ...requiredCurrencies];
      const missingHistory = resolveMissingStocksHistory(
        allTickers,
        stocksData,
        startDate,
        historyEndDate
      );
      const results = await Promise.all(
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
          return { ...history, ...fetchInfo };
        })
      );

      // Process the fetch results
      const putStocksHistoryTx = db.transaction('stocksHistory', 'readwrite');
      results.forEach((result) => {
        // Save to newStocksData
        const current = newStocksData[result.ticker] ?? {};
        current.closeSeries = current?.closeSeries
          ? current.closeSeries.mergeWith(result.closeSeries)
          : result.closeSeries;
        current.adjustedSeries = current?.adjustedSeries
          ? current.adjustedSeries.mergeWith(result.adjustedSeries)
          : result.adjustedSeries;
        current.seriesRange = {
          startDate,
          endDate: historyEndDate,
        };
        newStocksData[result.ticker] = current;

        // Push to idb
        putStocksHistoryTx.objectStore('stocksHistory').put({
          ticker: result.ticker,
          close: current.closeSeries,
          adjusted: current.adjustedSeries,
          range: current.seriesRange,
        });
      });
      await putStocksHistoryTx.done;

      // Commit new stocks data to update the ui
      if (Object.keys(newStocksData).length) {
        setStocksData(newStocksData);
      }

      const tickersNeedLivePrice = [...tickers, ...requiredCurrencies].filter(
        (ticker) => !newStocksData[ticker]?.livePrice
      );
      if (tickersNeedInfo.length) {
        await getLivePrices(tickersNeedLivePrice);
      }

      fetchingTickers.current = false;
      setLoadingState(false);
    },
    [db, getLivePrices, setLoadingState, stocksData]
  );

  const clearCache = useCallback(async () => {
    if (!db) return;

    const clearStocksHistoryTx = db.transaction('stocksHistory', 'readwrite');
    await clearStocksHistoryTx.objectStore('stocksHistory').clear();

    const clearStocksInfoTx = db.transaction('stocksInfo', 'readwrite');
    await clearStocksInfoTx.objectStore('stocksInfo').clear();
  }, [db]);

  return (
    <StocksDataContext.Provider value={{ stocksData, addTickers, clearCache }}>
      {children}
    </StocksDataContext.Provider>
  );
}

function useStocksData() {
  return useContext(StocksDataContext);
}

export default useStocksData;
