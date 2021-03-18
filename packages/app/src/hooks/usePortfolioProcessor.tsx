import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Snapshot, TimeSeries } from '@tuja/libs';
import usePortfolio from './usePortfolio';
import useStartDate from './useStartDate';
import useLoadingState from './useLoadingState';
import {
  PortfolioPerformance,
  processPerformanceSeries,
  watchSnapshots,
  exampleSnapshots,
  examplePortfolio,
} from '../libs/portfolioClient';
import { animationInterval } from '../libs/timer';
import Processor from '../workers/processor.worker?worker';

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
  const { portfolio, portfolios } = usePortfolio();
  const [snapshots, setSnapshots] = useState<{
    [portfolioId: string]: Snapshot[];
  }>({});

  const portfolioId = portfolio?.id;
  const portfolioIds = portfolios.map(({ id }) => id).join('-');
  const benchmark = portfolio?.benchmark;
  const baseCurrency = portfolio?.currency;

  useEffect(() => {
    if (!portfolioId || !portfolios.length) {
      setSnapshots({});
      return;
    }

    if (portfolioId === examplePortfolio.id) {
      setSnapshots({ [portfolios[0].id]: exampleSnapshots });
      return;
    }

    if (startDate) {
      let mounted = true;
      let cleanup: () => void | undefined;
      (async () => {
        cleanup = await watchSnapshots(
          portfolios,
          portfolioId,
          startDate,
          (newSnapshots) => {
            if (!mounted) return;
            setSnapshots(newSnapshots);
          }
        );
      })();
      return () => {
        mounted = false;
        if (cleanup) cleanup();
      };
    }
  }, [portfolioId, portfolios, startDate]);

  const [
    portfolioPerformance,
    setPortfolioPerformance,
  ] = useState<PortfolioPerformance | null>(null);
  const [isReady, setIsReady] = useState(false);

  const loadCachedPerformance = useCallback(() => {
    console.log('loaded performance cache');
    const saved = localStorage.getItem(`performance-${portfolioIds}`);
    const parsed = saved && JSON.parse(saved);
    if (parsed && 'portfolio' in parsed) {
      setPortfolioPerformance(
        processPerformanceSeries(
          parsed,
          (series: { data: [string, number][] }) =>
            new TimeSeries().handleData(series.data)
        )
      );
    } else if (portfolios.length && portfolioId) {
      setPortfolioPerformance({
        valueSeries: new TimeSeries(),
        gainSeries: new TimeSeries(),
        cashFlowSeries: new TimeSeries(),
        monthlyDividends: new TimeSeries(),
        portfolio: {
          id: portfolioId,
          valueSeries: new TimeSeries(),
          gainSeries: new TimeSeries(),
          cashFlowSeries: new TimeSeries(),
          monthlyDividends: new TimeSeries(),
          twrrSeries: new TimeSeries(),
          totalHoldingsValue: 0,
          holdings: {},
        },
      });
    }
  }, [portfolioId, portfolioIds, portfolios.length]);

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
          `performance-${portfolioIds}`,
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

    if (Object.keys(snapshots ?? {}).length && startDate) {
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
    } else {
      setPortfolioPerformance(
        portfolioId
          ? {
              valueSeries: new TimeSeries(),
              gainSeries: new TimeSeries(),
              cashFlowSeries: new TimeSeries(),
              monthlyDividends: new TimeSeries(),
              portfolio: {
                id: portfolioId,
                valueSeries: new TimeSeries(),
                gainSeries: new TimeSeries(),
                cashFlowSeries: new TimeSeries(),
                monthlyDividends: new TimeSeries(),
                twrrSeries: new TimeSeries(),
                totalHoldingsValue: 0,
                holdings: {},
              },
            }
          : null
      );
    }

    return () => {
      worker.removeEventListener('message', handler);
      try {
        worker.terminate();
      } catch {}
    };
  }, [
    baseCurrency,
    benchmark,
    endDate,
    loadCachedPerformance,
    portfolioId,
    portfolioIds,
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
        resetSnapshots: () => setSnapshots({}),
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
