import React, { createContext, useState, useContext, useEffect } from 'react';
import { Portfolio, watchPortfolio, examplePortfolio } from 'libs/portfolio';
import useAuth from './useAuth';

export const PortfolioContext = createContext({
  portfolio: null as Portfolio | null,
  loaded: false,
});

export function PortfolioProvider({ children }: React.PropsWithChildren<{}>) {
  const { state, currentUser } = useAuth();
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
