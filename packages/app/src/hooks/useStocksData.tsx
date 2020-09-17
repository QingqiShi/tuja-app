import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';
import dayjs from 'dayjs';
import {
  StocksData,
  fetchStocksInfo,
  fetchStocksHistory,
  fetchStockLivePrice,
  getRequiredCurrencies,
} from 'libs/stocksClient';
import usePortfolio from './usePortfolio';

export const StocksDataContext = createContext({
  addTickers: async (_tickers: string[], startDate: Date | null) => {},
  stocksData: {} as StocksData,
});

const currentDate = new Date();

export function StocksDataProvider({ children }: React.PropsWithChildren<{}>) {
  const { portfolio } = usePortfolio();
  const [endDate] = useState(currentDate);
  const [stocksData, setStocksData] = useState<StocksData>({});

  const fetchingTickers = useRef<string[]>([]);

  const addTickers = useCallback(
    async (tickers: string[], startDate: Date | null) => {
      if (!startDate || fetchingTickers.current.length) return;

      tickers.forEach((ticker) => fetchingTickers.current.push(ticker));

      console.log('fetch info', tickers);
      const stocksInfo = await fetchStocksInfo(tickers);

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

          return { ticker, info, closeSeries, adjustedSeries };
        })
      );

      const dataToAdd = results.filter(
        ({ closeSeries }) => closeSeries.data.length
      );
      if (dataToAdd.length) {
        setStocksData((current) =>
          dataToAdd.reduce(
            (newData, { ticker, info, closeSeries, adjustedSeries }) => ({
              ...newData,
              [ticker]: { info: info as any, closeSeries, adjustedSeries },
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
    },
    [endDate, portfolio?.currency]
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
