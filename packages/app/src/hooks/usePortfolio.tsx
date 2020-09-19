import React, { createContext, useState, useContext, useEffect } from 'react';
import dayjs from 'dayjs';
import { Portfolio, watchPortfolio, examplePortfolio } from 'libs/portfolio';
import useAuth from './useAuth';
import useStocksData from './useStocksData';
import useStartDate from './useStartDate';
import useLoadingState from './useLoadingState';

export const PortfolioContext = createContext({
  portfolio: null as Portfolio | null,
  loaded: false,
});

const currentDate = dayjs(dayjs().format('YYYY-MM-DD'));
const defaultDate = currentDate.subtract(3, 'month');

export function PortfolioProvider({ children }: React.PropsWithChildren<{}>) {
  const [globalLoading] = useLoadingState();
  const { state, currentUser } = useAuth();
  const { addTickers } = useStocksData();
  const [startDate, setStartDate] = useStartDate();
  const [loaded, setLoaded] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const authStateKnown = state !== 'UNKNOWN';
  const uid = currentUser?.uid;

  useEffect(() => {
    if (!authStateKnown) return;

    if (!uid) {
      setLoaded(true);
      setPortfolio(examplePortfolio);
      return;
    }

    return watchPortfolio({ uid: uid }, (portfolio) => {
      setPortfolio(portfolio);
      setLoaded(true);
    });
  }, [authStateKnown, uid]);

  const portfolioCurrency = portfolio?.currency;
  const portfolioTickers = portfolio?.tickers;
  useEffect(() => {
    if (!globalLoading && portfolioTickers && portfolioCurrency) {
      console.log('addTickers', portfolioTickers);
      addTickers(portfolioTickers, startDate, portfolioCurrency);
    }
  }, [
    addTickers,
    globalLoading,
    portfolioCurrency,
    portfolioTickers,
    startDate,
  ]);

  const portfolioStartDate = portfolio?.activities[0]?.date;
  useEffect(() => {
    if (!startDate && portfolioStartDate) {
      setStartDate(
        defaultDate.isAfter(portfolioStartDate)
          ? defaultDate.toDate()
          : portfolioStartDate
      );
    }
  }, [portfolioStartDate, setStartDate, startDate]);

  return (
    <PortfolioContext.Provider value={{ portfolio, loaded }}>
      {children}
    </PortfolioContext.Provider>
  );
}

function usePortfolio() {
  return useContext(PortfolioContext);
}

export default usePortfolio;
