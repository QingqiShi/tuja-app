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
  getRequiredCurrencies,
  StockInfo,
} from 'libs/stocksClient';
import usePortfolio from './usePortfolio';
import useLoadingState from './useLoadingState';

export const StocksDataContext = createContext({
  addTickers: async (_tickers: string[], startDate: Date | null) => {},
  stocksData: {} as StocksData,
});

const currentDate = new Date();

interface MyDB extends DBSchema {
  stocksInfo: {
    key: string;
    value: StockInfo;
  };
}

export function StocksDataProvider({ children }: React.PropsWithChildren<{}>) {
  const { portfolio } = usePortfolio();
  const [, setLoadingState] = useLoadingState();
  const [endDate] = useState(currentDate);
  const [stocksData, setStocksData] = useState<StocksData>({});
  const [db, setDB] = useState<IDBPDatabase<MyDB> | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setDB(
        await openDB<MyDB>('stocksData', 1, {
          upgrade(upgradeDB, oldVersion, newVersion, transaction) {
            if (oldVersion < 1) {
              upgradeDB.createObjectStore('stocksInfo', {
                keyPath: 'Ticker',
              });
            }
          },
        })
      );
    };
    fetch();
  }, []);

  const fetchingTickers = useRef<string[]>([]);

  const addTickers = useCallback(
    async (tickers: string[], startDate: Date | null) => {
      if (!startDate || fetchingTickers.current.length || !db) return;

      // Start loading state so other calls to addTickers are not executed
      tickers.forEach((ticker) => fetchingTickers.current.push(ticker));
      setLoadingState(true);

      // Retrieve stocks info from idb
      const getStocksInfoTx = db.transaction('stocksInfo');
      const stocksInfo = (
        await Promise.all(
          tickers.map((ticker) =>
            getStocksInfoTx.objectStore('stocksInfo').get(ticker)
          )
        )
      ).filter(<T extends {}>(x: T | undefined): x is T => !!x);
      await getStocksInfoTx.done;

      // Fetch remaining tickers
      const tickersNeedInfo = tickers.filter(
        (ticker) => !stocksInfo.find((info) => info.Ticker === ticker)
      );
      if (tickersNeedInfo.length) {
        console.log('fetch info', tickersNeedInfo);
        const fetchedStocksInfo = await fetchStocksInfo(tickersNeedInfo);

        // Store into idb for future use
        const putStocksInfoTx = db.transaction('stocksInfo', 'readwrite');
        await Promise.all(
          fetchedStocksInfo.map((info) => {
            stocksInfo.push(info);
            return putStocksInfoTx.objectStore('stocksInfo').add(info);
          })
        );
        await putStocksInfoTx.done;
      }

      const requiredCurrencies = getRequiredCurrencies(
        (portfolio?.currency as any) ?? 'GBP',
        stocksInfo
      );
      console.log('required currencies', requiredCurrencies);

      const results = await Promise.all(
        [...tickers, ...requiredCurrencies].map(async (ticker) => {
          console.log('fetch history', ticker);
          const { closeSeries, adjustedSeries } = await fetchStocksHistory(
            ticker,
            startDate,
            endDate
          );
          const info = stocksInfo.find(({ Ticker }) => Ticker === ticker);
          const lastDataPoint = adjustedSeries.data.length
            ? adjustedSeries.data[adjustedSeries.data.length - 1]
            : undefined;
          const livePrice = lastDataPoint && {
            code: ticker,
            date: lastDataPoint[0],
            close: lastDataPoint[1],
            previousClose: lastDataPoint[1],
          };

          return { ticker, info, closeSeries, adjustedSeries, livePrice };
        })
      );

      const dataToAdd = results.filter(
        ({ closeSeries }) => closeSeries.data.length
      );
      if (dataToAdd.length) {
        setStocksData((current) =>
          dataToAdd.reduce(
            (newData, { ticker, ...data }) => ({
              ...newData,
              [ticker]: data,
            }),
            current
          )
        );
      }

      const livePrices = (
        await Promise.all(
          [...tickers, ...requiredCurrencies].map((ticker) => {
            console.log('fetch live price', ticker);
            return fetchStockLivePrice(ticker);
          })
        )
      ).filter((livePrice) => livePrice?.code);
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

      results.forEach(({ ticker }) => {
        fetchingTickers.current.splice(
          fetchingTickers.current.indexOf(ticker),
          1
        );
      });
      setLoadingState(false);
    },
    [db, endDate, portfolio?.currency, setLoadingState]
  );

  return (
    <StocksDataContext.Provider value={{ stocksData, addTickers }}>
      {children}
    </StocksDataContext.Provider>
  );
}

function useStocksData() {
  return useContext(StocksDataContext);
}

export default useStocksData;
