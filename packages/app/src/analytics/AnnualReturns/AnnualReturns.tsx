import { useMemo } from 'react';
import { AnalysisContainer, Histogram } from '@tuja/components';
import useWorker from '../../hooks/useWorker';
import AnnualReturnsWorker from './annualReturns.worker?worker';

function AnnualReturns({
  assets,
  baseCurrency,
  inflationRate,
  shouldSkip,
}: AnalyticsProps) {
  const payload = useMemo(
    () => ({ assets, baseCurrency, inflationRate }),
    [assets, baseCurrency, inflationRate]
  );
  const { result, isLoading } = useWorker(AnnualReturnsWorker, {
    payload,
    skip: shouldSkip,
  });

  return (
    <AnalysisContainer
      title="Annual Returns"
      chart={
        <Histogram
          data={result}
          xMin={-0.4}
          xMax={0.4}
          yMax={0.6}
          binCount={8}
          formatValue={(val: number) => `${Math.round(val * 10000) / 100}%`}
        />
      }
      isLoading={shouldSkip || isLoading}
    />
  );
}

export default AnnualReturns;
