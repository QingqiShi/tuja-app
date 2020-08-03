import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchStocksList } from 'libs/stocksClient';

export const StocksListContext = createContext({
  stocksList: [] as string[],
});

export function StocksListProvider({ children }: React.PropsWithChildren<{}>) {
  const [stocksList, setStocksList] = useState<string[]>([]);
  useEffect(() => {
    const fetch = async () => {
      const result = await fetchStocksList();
      setStocksList(result);
    };
    fetch();
  }, []);
  return (
    <StocksListContext.Provider value={{ stocksList }}>
      {children}
    </StocksListContext.Provider>
  );
}

function useStocksList() {
  return useContext(StocksListContext);
}

export default useStocksList;
