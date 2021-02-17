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
  PortfolioPerformance,
  processPerformanceSeries,
  watchSnapshots,
  exampleSnapshots,
} from 'libs/portfolioClient';
import { animationInterval } from 'libs/timer';

// eslint-disable-next-line import/no-webpack-loader-syntax
import Processor from 'worker-loader?filename=processor.worker.js!workers/processor.worker';

export const PortfolioProcessorContext = createContext({
  portfolioPerformance: null as PortfolioPerformance | null,
  isReady: false,
  resetSnapshots: () => {},
  refresh: () => {},
});

const initialEndDate = new Date();

export function PortfolioProcessorProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [, setLoadingState] = useLoadingState();
  const [startDate] = useStartDate();
  const [endDate, setEndDate] = useState(initialEndDate);
  const { portfolio } = usePortfolio();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const portfolioId = portfolio?.id;
  const portfolioLastSnapshot = portfolio?.latestSnapshot;
  const benchmark = portfolio?.benchmark;
  const baseCurrency = portfolio?.currency;

  useEffect(() => {
    if (portfolioId === 'example-portfolio') {
      setSnapshots(exampleSnapshots);
      return;
    }

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
        monthlyDividends: new TimeSeries(),
        totalHoldingsValue: 0,
        holdings: {},
      });
    }
  }, [portfolioId]);

  const refresh = useCallback(() => {
    setEndDate(new Date());
  }, []);

  useEffect(() => {
    const worker = new Processor();

    const handler = (e: MessageEvent) => {
      const { type, payload } = e.data ?? {};
      if (type === 'process-portfolio') {
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
      loadCachedPerformance();
    }

    return () => {
      worker.removeEventListener('message', handler);
      worker.terminate();
    };
  }, [
    baseCurrency,
    benchmark,
    endDate,
    loadCachedPerformance,
    portfolioId,
    setLoadingState,
    snapshots,
    startDate,
  ]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    animationInterval(120000, signal, () => {
      refresh();
    });
    return () => {
      abortController.abort();
    };
  }, [refresh]);

  return (
    <PortfolioProcessorContext.Provider
      value={{
        portfolioPerformance,
        isReady,
        resetSnapshots: () => setSnapshots([]),
        refresh,
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
