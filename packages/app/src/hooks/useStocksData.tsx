import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  StocksData,
  fetchStocksInfo,
  fetchStocksHistory,
} from 'libs/stocksClient';
import dayjs from 'dayjs';

export const StocksDataContext = createContext({
  addTickers: async (_tickers: string[], startDate: Date | null) => {},
  stocksData: {} as StocksData,
});

const currentDate = new Date();

export function StocksDataProvider({ children }: React.PropsWithChildren<{}>) {
  const [endDate] = useState(currentDate);
  const [stocksData, setStocksData] = useState<StocksData>({});

  const fetchingTickers = useRef<string[]>([]);

  const addTickers = useCallback(
    async (tickers: string[], startDate: Date | null) => {
      if (!startDate || fetchingTickers.current.length) return;

      tickers.forEach((ticker) => fetchingTickers.current.push(ticker));

      console.log('fetch info', tickers);
      const stocksInfo = await fetchStocksInfo(tickers);

      const promises = tickers.map(async (ticker) => {
        console.log('fetch history', ticker);
        const { closeSeries, adjustedSeries } = await fetchStocksHistory(
          ticker,
          startDate,
          endDate
        );
        const info = stocksInfo.find(({ Ticker }) => Ticker === ticker);

        if (info && closeSeries && adjustedSeries) {
          // Add current quote to the end of price series
          const seriesEndDate =
            closeSeries.data?.[closeSeries.data.length - 1]?.[0];
          if (
            info.Quote &&
            dayjs(info.QuoteDate).diff(seriesEndDate, 'day') >= 1
          ) {
            closeSeries.data.push([info.QuoteDate, info.Quote]);
            adjustedSeries.data.push([info.QuoteDate, info.Quote]);
          }
        }

        return { ticker, info, closeSeries, adjustedSeries };
      });

      const results = await Promise.all(promises);

      results.forEach(({ ticker }) => {
        fetchingTickers.current.splice(
          fetchingTickers.current.indexOf(ticker),
          1
        );
      });

      const dataToAdd = results.filter(
        ({ info, closeSeries }) => info && closeSeries.data.length
      );
      if (dataToAdd.length) {
        setStocksData((current) =>
          dataToAdd.reduce(
            (newData, { ticker, info, closeSeries, adjustedSeries }) => ({
              ...newData,
              [ticker]: { info: info as any, closeSeries, adjustedSeries },
            }),
            { ...current }
          )
        );
      }
    },
    [endDate]
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
