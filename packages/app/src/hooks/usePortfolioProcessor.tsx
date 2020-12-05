import React, { createContext, useState, useContext, useEffect } from 'react';
import { PortfolioPerformance } from 'libs/portfolio';
import TimeSeries from 'libs/timeSeries';
import usePortfolio from 'hooks/usePortfolio';
import useStartDate from 'hooks/useStartDate';
import useLoadingState from './useLoadingState';

// eslint-disable-next-line import/no-webpack-loader-syntax
import Processor from 'worker-loader?filename=processor.worker.js!workers/processor.worker';

const endDate = new Date();

export const PortfolioProcessorContext = createContext({
  portfolioPerformance: null as PortfolioPerformance | null,
  isReady: false,
});

export function PortfolioProcessorProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [, setLoadingState] = useLoadingState();
  const [startDate] = useStartDate();
  const { portfolio } = usePortfolio();
  const [
    portfolioPerformance,
    setPortfolioPerformance,
  ] = useState<PortfolioPerformance | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const worker = new Processor();

    if (portfolio && startDate && endDate) {
      setLoadingState(true);
      setIsReady(false);
      worker.postMessage({
        type: 'process-portfolio',
        payload: { portfolio, startDate, endDate },
      });
    }

    const handler = (e: MessageEvent) => {
      const messageData = e.data;
      if (messageData?.type === 'process-portfolio') {
        setLoadingState(false);
        setPortfolioPerformance({
          ...messageData.payload,
          valueSeries: new TimeSeries(messageData.payload.valueSeries),
          cashFlowSeries: new TimeSeries(messageData.payload.cashFlowSeries),
          gainSeries: new TimeSeries(messageData.payload.gainSeries),
          twrrSeries: new TimeSeries(messageData.payload.twrrSeries),
        });
        setIsReady(true);
      }
    };
    worker.addEventListener('message', handler);

    return () => {
      worker.removeEventListener('message', handler);
      worker.terminate();
    };
  }, [portfolio, setLoadingState, startDate]);

  return (
    <PortfolioProcessorContext.Provider
      value={{ portfolioPerformance, isReady }}
    >
      {children}
    </PortfolioProcessorContext.Provider>
  );
}

function usePortfolioProcessor() {
  return useContext(PortfolioProcessorContext);
}

export default usePortfolioProcessor;
