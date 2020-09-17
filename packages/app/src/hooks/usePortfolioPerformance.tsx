import React, { createContext, useMemo, useEffect, useContext } from 'react';
import { shouldFetchData } from 'libs/stocksClient';
import { getPortfolioPerformance, PortfolioPerformance } from 'libs/portfolio';
import useStocksData from 'hooks/useStocksData';
import usePortfolio from 'hooks/usePortfolio';
import useStartDate from 'hooks/useStartDate';

const endDate = new Date();

export const PortfolioPerformanceContext = createContext({
  portfolioPerformance: null as PortfolioPerformance | null,
});

export function PortfolioPerformanceProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [startDate] = useStartDate();
  const { portfolio } = usePortfolio();
  const { stocksData, addTickers } = useStocksData();

  const shouldLoad = !!portfolio;

  // Get stocks data for tickers
  const missingTickers = portfolio?.tickers.filter((ticker) =>
    shouldFetchData(ticker, stocksData, startDate)
  );
  useEffect(() => {
    if (!shouldLoad || !missingTickers?.length) return;
    console.log('missingTickers', missingTickers);
    addTickers(missingTickers, startDate);
  }, [addTickers, missingTickers, shouldLoad, startDate]);

  // Calculate portfolio performance!
  const portfolioPerformance = useMemo(
    () =>
      stocksData &&
      portfolio &&
      startDate &&
      !portfolio?.tickers.some((ticker) => !stocksData[ticker]?.closeSeries)
        ? getPortfolioPerformance(portfolio, startDate, endDate, stocksData)
        : null,
    [portfolio, startDate, stocksData]
  );

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
