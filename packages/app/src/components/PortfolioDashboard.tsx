import React from 'react';
import Chart from 'components/Chart';
import DashboardLayout from 'components/DashboardLayout';
import PortfolioOverview from 'components/PortfolioOverview';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioPerformance from 'hooks/usePortfolioPerformance';
import useTooltipSync from 'hooks/useTooltipSync';
import useStocksList from 'hooks/useStocksList';

function PortfolioDashboard() {
  const { portfolio } = usePortfolio();
  const { portfolioPerformance } = usePortfolioPerformance();
  const tooltip = useTooltipSync();

  const { stocksList } = useStocksList();

  if (!stocksList || !portfolio) {
    return null;
  }

  if (!portfolioPerformance) {
    return (
      <DashboardLayout
        overview={<PortfolioOverview />}
        values={
          <Chart
            data={[]}
            benchmark={[]}
            currency={portfolio.currency}
            benchmarkLabel="Cost"
          />
        }
        gains={<Chart data={[]} currency={portfolio.currency} hideAxis />}
        returns={<Chart data={[]} hideAxis formatPercentage />}
      />
    );
  }

  return (
    <DashboardLayout
      overview={<PortfolioOverview />}
      values={
        <Chart
          data={portfolioPerformance.series.valueSeries.data}
          benchmark={portfolioPerformance.series.deposits.data}
          syncTooltip={tooltip}
          currency={portfolio.currency}
          benchmarkLabel="Cost"
        />
      }
      gains={
        <Chart
          data={portfolioPerformance.series.gains.data}
          syncTooltip={tooltip}
          currency={portfolio.currency}
          hideAxis
        />
      }
      returns={
        <Chart
          data={portfolioPerformance.series.returns.data}
          syncTooltip={tooltip}
          hideAxis
          formatPercentage
        />
      }
    />
  );
}

export default PortfolioDashboard;
