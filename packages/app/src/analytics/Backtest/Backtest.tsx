import { memo, useMemo } from 'react';
import { AnalysisContainer, Chart } from '@tuja/components';
import { TimeSeries } from '@tuja/libs';
import useWorker from '../../hooks/useWorker';
import BacktestWorker from './backtest.worker?worker';

function Backtest({
  assets,
  baseCurrency,
  inflationRate,
  isLoading,
}: AnalyticsProps) {
  const payload = useMemo(
    () => ({ assets, baseCurrency, inflationRate }),
    [assets, baseCurrency, inflationRate]
  );
  const result = useWorker(BacktestWorker, { payload, skip: isLoading });

  const backtestSeries = useMemo(() => new TimeSeries(result), [result]);

  return (
    <AnalysisContainer
      title="Backtest"
      chart={
        <Chart
          data={isLoading || !result ? [] : backtestSeries.data}
          formatValue={(val: number) => `${Math.round(val * 10000) / 100}%`}
          resampleData
        />
      }
      isLoading={isLoading || !result}
    />
  );
}

export default memo(Backtest);
