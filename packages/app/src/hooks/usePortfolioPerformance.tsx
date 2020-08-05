import React, { createContext, useMemo, useEffect, useContext } from 'react';
import { getRequiredCurrencies } from 'libs/stocksClient';
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
  const { portfolio } = usePortfolio();
  const shouldLoad = !!portfolio;

  const [startDate] = useStartDate();
  const { stocksData, addTickers } = useStocksData();

  // Get stocks data for tickers
  const tickers = portfolio?.tickers;
  useEffect(() => {
    if (!shouldLoad || !tickers?.length) return;
    addTickers(tickers);
  }, [addTickers, shouldLoad, tickers]);

  // Get required currencies and fetch historic data
  const requiredCurrencies = useMemo(
    () =>
      portfolio &&
      getRequiredCurrencies(
        (portfolio?.currency as 'GBP' | 'USD') ?? 'GBP',
        Object.keys(stocksData)
          .map((ticker) => stocksData[ticker].info)
          .filter(<T extends {}>(x: T | undefined): x is T => !!x)
      ),
    [portfolio, stocksData]
  );
  useEffect(() => {
    if (!shouldLoad || !requiredCurrencies) return;
    addTickers(requiredCurrencies);
  }, [addTickers, requiredCurrencies, shouldLoad]);

  // Calculate portfolio performance!
  const portfolioPerformance = useMemo(
    () =>
      stocksData &&
      portfolio &&
      startDate &&
      !portfolio?.tickers.some((ticker) => !stocksData[ticker]?.series) &&
      !requiredCurrencies?.some((currency) => !stocksData[currency]?.series)
        ? getPortfolioPerformance(portfolio, startDate, endDate, stocksData)
        : null,
    [portfolio, requiredCurrencies, startDate, stocksData]
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
