import React, { createContext, useMemo, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import { getRequiredCurrencies } from 'libs/stocksClient';
import {
  getPortfolioPerformance,
  Portfolio,
  PortfolioPerformance,
} from 'libs/portfolio';
import useStocksData from 'hooks/useStocksData';
import usePortfolio from 'hooks/usePortfolio';

const endDate = new Date();

function useStartDate(portfolio: Portfolio | null) {
  const startDate = useMemo(
    () =>
      portfolio?.activities
        ? dayjs(portfolio.activities[0]?.date ?? new Date())
            .subtract(1, 'day')
            .toDate()
        : dayjs(endDate).subtract(1, 'day').toDate(),
    [portfolio]
  );
  return startDate;
}

export const PortfolioPerformanceContext = createContext({
  portfolioPerformance: null as PortfolioPerformance | null,
});

export function PortfolioPerformanceProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const { portfolio } = usePortfolio();
  const shouldLoad = !!portfolio;

  const startDate = useStartDate(portfolio);
  const { stocksData, addTickers, setStartDate } = useStocksData();

  // Set start date for getting stocks data
  useEffect(() => {
    if (!shouldLoad) return;
    setStartDate(startDate);
  }, [setStartDate, shouldLoad, startDate]);

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
