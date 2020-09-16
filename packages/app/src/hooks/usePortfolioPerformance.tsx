import React, { createContext, useMemo, useEffect, useContext } from 'react';
import { getRequiredCurrencies, shouldFetchData } from 'libs/stocksClient';
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

  // Get required currencies and fetch historic data
  const requiredCurrencies =
    portfolio &&
    getRequiredCurrencies(
      (portfolio?.currency as any) ?? 'GBP',
      Object.keys(stocksData)
        .map((ticker) => stocksData[ticker].info)
        .filter(<T extends {}>(x: T | undefined): x is T => !!x)
    )
      .filter((symbol) => shouldFetchData(symbol, stocksData, startDate))
      .filter((symbol) => !missingTickers?.includes(symbol));
  useEffect(() => {
    if (!shouldLoad || !requiredCurrencies?.length) return;
    console.log('requiredCurrencies', requiredCurrencies);
    addTickers(requiredCurrencies, startDate);
  }, [addTickers, requiredCurrencies, shouldLoad, startDate]);

  // Calculate portfolio performance!
  const portfolioPerformance = useMemo(
    () =>
      stocksData &&
      portfolio &&
      startDate &&
      !portfolio?.tickers.some((ticker) => !stocksData[ticker]?.closeSeries) &&
      !requiredCurrencies?.some(
        (currency) => !stocksData[currency]?.closeSeries
      )
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
