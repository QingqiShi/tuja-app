import { createContext, useState, useContext, useEffect } from 'react';
import dayjs from 'dayjs';
import type { Portfolio } from '@tuja/libs';
import { watchPortfolios, examplePortfolio } from '../libs/portfolioClient';
import useAuth from './useAuth';
import useStartDate from './useStartDate';

export const PortfolioContext = createContext<{
  portfolio: Portfolio | null;
  portfolios: Portfolio[];
  loaded: boolean;
}>({
  portfolio: null,
  portfolios: [],
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
  // Auth states
  const { state, currentUser } = useAuth();
  const authStateKnown = state !== 'UNKNOWN';
  const uid = currentUser?.uid;

  // Start date
  const [, setStartDate] = useStartDate();

  // Portfolio states
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  // Loaded state
  const [loaded, setLoaded] = useState(false);

  // Set up the watcher to get portfolios from db
  // Load example portfolio if user not logged in
  useEffect(() => {
    if (!authStateKnown) return;

    if (!uid) {
      setPortfolios([examplePortfolio]);
      return;
    }

    return watchPortfolios({ uid: uid }, (portfolios) => {
      setPortfolios(portfolios ?? []);
      setLoaded(true);
    });
  }, [authStateKnown, setStartDate, uid]);

  // Set portfolio and the initial startdate
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  useEffect(() => {
    if (!portfolioId) {
      return;
    }

    const newSelectedPortfolio =
      portfolios.find((portfolio) => portfolio.id === portfolioId) ?? null;
    setPortfolio(newSelectedPortfolio);

    const portfolioStartDate = newSelectedPortfolio?.activitiesStartDate;
    if (!portfolioStartDate) {
      setStartDate(null);
      return;
    }

    setStartDate(
      defaultDate.isAfter(portfolioStartDate)
        ? defaultDate.toDate()
        : portfolioStartDate
    );
  }, [setStartDate, portfolioId, portfolios]);

  return (
    <PortfolioContext.Provider value={{ portfolio, portfolios, loaded }}>
      {children}
    </PortfolioContext.Provider>
  );
}

function usePortfolio() {
  return useContext(PortfolioContext);
}

export default usePortfolio;
