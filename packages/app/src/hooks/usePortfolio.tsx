import { createContext, useState, useContext, useEffect } from 'react';
import dayjs from 'dayjs';
import { Portfolio, watchPortfolio, examplePortfolio } from '@tuja/libs';
import useAuth from './useAuth';
import useStartDate from './useStartDate';

export const PortfolioContext = createContext({
  portfolio: null as Portfolio | null,
  portfolios: [] as Portfolio[],
  loaded: false,
});

const currentDate = dayjs(dayjs().format('YYYY-MM-DD'));
const defaultDate = currentDate.subtract(3, 'month');

interface PortfolioProviderProps {
  portfolioId?: string;
}

export function PortfolioProvider({
  children,
  portfolioId,
}: React.PropsWithChildren<PortfolioProviderProps>) {
  const { state, currentUser } = useAuth();
  const [startDate, setStartDate] = useStartDate();
  const [loaded, setLoaded] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  const portfolio =
    portfolios.find((portfolio) => portfolio.id === portfolioId) ?? null;

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
        portfolio,
        portfolios,
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
