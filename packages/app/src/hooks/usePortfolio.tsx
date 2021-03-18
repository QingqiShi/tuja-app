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
  const portfolio =
    portfolios.find((portfolio) => portfolio.id === portfolioId) ?? null;

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

  // Set the initial start date
  const portfolioStartDate = portfolio?.activitiesStartDate;
  // const portfolioId = portfolio?.id;
  // const dateInvalid =
  //   startDate &&
  //   portfolioStartDate &&
  //   dayjs(startDate).isBefore(portfolioStartDate);
  useEffect(() => {
    if (!portfolioStartDate) {
      setStartDate(null);
      return;
    }

    setStartDate(
      defaultDate.isAfter(portfolioStartDate)
        ? defaultDate.toDate()
        : portfolioStartDate
    );

    // depend on portfolioId - when the user switches portfolio
  }, [portfolioStartDate, setStartDate, portfolioId]);

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
