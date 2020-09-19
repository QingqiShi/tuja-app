import React, { createContext, useMemo, useContext } from 'react';
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
  const { stocksData } = useStocksData();

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
