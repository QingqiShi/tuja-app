// eslint-disable-next-line import/no-webpack-loader-syntax
import PortfolioWorker from 'worker-loader!workers/portfolio.worker';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { PortfolioPerformance } from 'libs/portfolio';
import useStocksData from 'hooks/useStocksData';
import usePortfolio from 'hooks/usePortfolio';
import useStartDate from 'hooks/useStartDate';

const portfolioWorker = new PortfolioWorker();

const endDate = new Date();

export const PortfolioPerformanceContext = createContext({
  portfolioPerformance: null as PortfolioPerformance | null,
});

export function PortfolioPerformanceProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [startDate] = useStartDate();
  const { portfolio } = usePortfolio();
  const { stocksData } = useStocksData();
  const [
    portfolioPerformance,
    setPortfolioPerformance,
  ] = useState<PortfolioPerformance | null>(null);

  useEffect(() => {
    if (
      stocksData &&
      portfolio &&
      startDate &&
      !portfolio?.tickers.some((ticker) => !stocksData[ticker]?.closeSeries)
    ) {
      portfolioWorker.postMessage({
        portfolio,
        stocksData,
        startDate,
        endDate,
      });
    }
  }, [portfolio, startDate, stocksData]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const payload = e.data;
      if (payload) {
        setPortfolioPerformance(payload);
      }
    };
    portfolioWorker.addEventListener('message', handler);
    return () => {
      portfolioWorker.removeEventListener('message', handler);
    };
  }, []);

  return (
    <PortfolioPerformanceContext.Provider value={{ portfolioPerformance }}>
      {children}
    </PortfolioPerformanceContext.Provider>
  );
}

function usePortfolioPerformance() {
  return useContext(PortfolioPerformanceContext);
}

export default usePortfolioPerformance;
