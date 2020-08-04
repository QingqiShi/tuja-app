import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import {
  StocksData,
  fetchStockInfo,
  fetchStocksHistory,
} from 'libs/stocksClient';

export const StocksDataContext = createContext({
  setStartDate: (_date: Date) => {},
  addTickers: async (_tickers: string[]) => {},
  stocksData: {} as StocksData,
});

const currentDate = new Date();

export function StocksDataProvider({ children }: React.PropsWithChildren<{}>) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate] = useState(currentDate);
  const [stocksData, setStocksData] = useState<StocksData>({});
  const [tickersToFetch, setTickersToFetch] = useState<string[]>([]);

  const addTickers = useCallback(
    async (tickers: string[]) => {
      const tickersToAdd = tickers
        .filter((ticker) => !(ticker in stocksData))
        .filter((ticker) => !tickersToFetch.includes(ticker));
      if (!tickersToAdd.length || !startDate) return;

      setTickersToFetch(tickers);
    },
    [startDate, stocksData, tickersToFetch]
  );

  useEffect(() => {
    const fetch = async () => {
      if (!startDate) return;
      const tickers = [...tickersToFetch];
      return Promise.all(
        tickers.map(async (ticker) => {
          setStocksData((current) => ({ ...current, [ticker]: {} }));
          const [info, series] = await Promise.all([
            fetchStockInfo(ticker),
            fetchStocksHistory(ticker, startDate, endDate),
          ]);

          if (info && series.data.length) {
            setStocksData((current) => ({
              ...current,
              [ticker]: { info, series },
            }));
            setTickersToFetch((current) =>
              current.filter((ticker) => !tickers.includes(ticker))
            );
          }
        })
      );
    };
    fetch();
  }, [endDate, startDate, tickersToFetch]);

  return (
    <StocksDataContext.Provider
      value={{ stocksData, addTickers, setStartDate }}
    >
      {children}
    </StocksDataContext.Provider>
  );
}

function useStocksData() {
  return useContext(StocksDataContext);
}

export default useStocksData;
