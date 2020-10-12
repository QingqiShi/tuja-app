import React, { createContext, useState, useContext, useEffect } from 'react';
import dayjs from 'dayjs';
import { Portfolio, watchPortfolio, examplePortfolio } from 'libs/portfolio';
import useAuth from './useAuth';
import useStocksData from './useStocksData';
import useStartDate from './useStartDate';
import useLoadingState from './useLoadingState';

export const PortfolioContext = createContext({
  portfolio: null as Portfolio | null,
  portfolios: [] as Portfolio[],
  handleChangePortfolio: (_index: number) => {},
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
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(-1);

  const portfolio = portfolios[selectedPortfolio] ?? null;
  const handleChangePortfolio = (index: number) => {
    setSelectedPortfolio(index);
    const newPortfoliioStartDate = portfolios[index]?.activities[0]?.date;
    if (newPortfoliioStartDate) {
      setStartDate(
        defaultDate.isAfter(newPortfoliioStartDate)
          ? defaultDate.toDate()
          : newPortfoliioStartDate
      );
    }
  };

  const authStateKnown = state !== 'UNKNOWN';
  const uid = currentUser?.uid;

  useEffect(() => {
    if (!authStateKnown) return;

    if (!uid) {
      setLoaded(true);
      setPortfolios([examplePortfolio]);
      return;
    }

    return watchPortfolio({ uid: uid }, (portfolios) => {
      setPortfolios(portfolios);
      setLoaded(true);
    });
  }, [authStateKnown, uid]);

  useEffect(() => {
    if (
      (selectedPortfolio < 0 || isNaN(selectedPortfolio)) &&
      portfolios.length > 0
    ) {
      setSelectedPortfolio(0);
    }
  }, [portfolios.length, selectedPortfolio]);

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
    <PortfolioContext.Provider
      value={{
        portfolio: portfolios[selectedPortfolio] ?? null,
        portfolios,
        handleChangePortfolio,
        loaded,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

function usePortfolio() {
  return useContext(PortfolioContext);
}

export default usePortfolio;
