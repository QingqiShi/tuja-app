import { memo, useMemo } from 'react';
import { AnalysisContainer, Chart } from '@tuja/components';
import { TimeSeries } from '@tuja/libs';
import useWorker from '../../hooks/useWorker';
import BacktestWorker from './backtest.worker?worker';

function Backtest({
  assets,
  baseCurrency,
  inflationRate,
  shouldSkip,
}: AnalyticsProps) {
  const payload = useMemo(
    () => ({ assets, baseCurrency, inflationRate }),
    [assets, baseCurrency, inflationRate]
  );
  const { result, isLoading } = useWorker(BacktestWorker, {
    payload,
    skip: shouldSkip,
  });

  const backtestSeries = useMemo(() => new TimeSeries(result), [result]);

  return (
    <AnalysisContainer
      title="Backtest"
      chart={
        <Chart
          data={shouldSkip || !result ? [] : backtestSeries.data}
          formatValue={(val: number) => `${Math.round(val * 10000) / 100}%`}
          resampleData
        />
      }
      isLoading={shouldSkip || isLoading}
    />
  );
}

export default memo(Backtest);
