import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Snapshot, TimeSeries } from '@tuja/libs';
import usePortfolio from 'hooks/usePortfolio';
import useStartDate from 'hooks/useStartDate';
import useLoadingState from 'hooks/useLoadingState';
import {
  MaybePortfolioPerformance,
  PortfolioPerformance,
  processPerformanceSeries,
  watchSnapshots,
} from 'libs/portfolioClient';

// eslint-disable-next-line import/no-webpack-loader-syntax
import Processor from 'worker-loader?filename=processor.worker.js!workers/processor.worker';

export const PortfolioProcessorContext = createContext({
  portfolioPerformance: null as PortfolioPerformance | null,
  isReady: false,
  resetSnapshots: () => {},
});

export function PortfolioProcessorProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [, setLoadingState] = useLoadingState();
  const [startDate] = useStartDate();
  const { portfolio } = usePortfolio();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const portfolioId = portfolio?.id;
  const portfolioLastSnapshot = portfolio?.latestSnapshot;
  const benchmark = portfolio?.benchmark;
  const baseCurrency = portfolio?.currency;

  useEffect(() => {
    if (portfolioId && startDate) {
      return watchSnapshots(portfolioId, startDate, (newSnapshots) => {
        if (newSnapshots.length) {
          setSnapshots(newSnapshots);
        } else if (portfolioLastSnapshot) {
          setSnapshots([portfolioLastSnapshot]);
        } else {
          setSnapshots([]);
        }
      });
    }
  }, [portfolioLastSnapshot, portfolioId, startDate]);

  const [
    portfolioPerformance,
    setPortfolioPerformance,
  ] = useState<PortfolioPerformance | null>(null);
  const [isReady, setIsReady] = useState(false);

  const loadCachedPerformance = useCallback(() => {
    console.log('loaded performance cache');
    const saved = localStorage.getItem(`performance-${portfolioId}`);
    const parsed = saved && JSON.parse(saved);
    if (parsed) {
      setPortfolioPerformance(
        processPerformanceSeries(
          parsed,
          (series: { data: [string, number][] }) =>
            new TimeSeries().handleData(series.data)
        )
      );
    } else if (portfolioId) {
      setPortfolioPerformance({
        id: portfolioId,
        valueSeries: new TimeSeries(),
        twrrSeries: new TimeSeries(),
        gainSeries: new TimeSeries(),
        cashFlowSeries: new TimeSeries(),
        totalHoldingsValue: 0,
        holdings: {},
      });
    }
  }, [portfolioId]);

  useEffect(() => {
    const worker = new Processor();
    const endDate = new Date();

    const handler = (e: MessageEvent) => {
      const { type, payload } = e.data ?? {};
      if (type === 'process-portfolio') {
        console.log('received from worker');
        setLoadingState(false);
        const newPortfolioPerformance = processPerformanceSeries(
          payload,
          (series: { data: [Date, number][] }) => new TimeSeries(series)
        );
        localStorage.setItem(
          `performance-${portfolioId}`,
          JSON.stringify(
            processPerformanceSeries(
              newPortfolioPerformance,
              (series: TimeSeries) => series.toPlainObject()
            )
          )
        );
        setPortfolioPerformance(newPortfolioPerformance);
        setIsReady(true);
      }
    };
    worker.addEventListener('message', handler);

    if (portfolioId && snapshots?.length && startDate) {
      setLoadingState(true);
      setIsReady(false);
      console.log('post to worker');
      loadCachedPerformance();
      worker.postMessage({
        type: 'process-portfolio',
        payload: {
          portfolioId,
          snapshots,
          startDate,
          endDate,
          benchmark,
          baseCurrency,
        },
      });
    } else if (portfolioId) {
      console.log('no snapshots');
      loadCachedPerformance();
    }

    return () => {
      worker.removeEventListener('message', handler);
      worker.terminate();
    };
  }, [
    baseCurrency,
    benchmark,
    loadCachedPerformance,
    portfolioId,
    setLoadingState,
    snapshots,
    startDate,
  ]);

  return (
    <PortfolioProcessorContext.Provider
      value={{
        portfolioPerformance,
        isReady,
        resetSnapshots: () => setSnapshots([]),
      }}
    >
      {children}
    </PortfolioProcessorContext.Provider>
  );
}

function usePortfolioProcessor() {
  return useContext(PortfolioProcessorContext);
}

export default usePortfolioProcessor;
