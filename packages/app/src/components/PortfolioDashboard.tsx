import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'components/Chart';
import dayjs from 'dayjs';
import DashboardLayout from 'components/DashboardLayout';
import PortfolioOverview from 'components/PortfolioOverview';
import ButtonGroup from 'components/ButtonGroup';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioPerformance from 'hooks/usePortfolioPerformance';
import useTooltipSync from 'hooks/useTooltipSync';
import useStocksList from 'hooks/useStocksList';
import useStartDate from 'hooks/useStartDate';

const currentDate = dayjs(dayjs().format('YYYY-MM-DD'));

const defaultPeriods = [
  { label: '1W', value: currentDate.subtract(7, 'day') },
  { label: '1M', value: currentDate.subtract(1, 'month') },
  { label: '3M', value: currentDate.subtract(3, 'month') },
  { label: '6M', value: currentDate.subtract(6, 'month') },
  { label: '1Y', value: currentDate.subtract(1, 'year') },
  { label: '5Y', value: currentDate.subtract(5, 'year') },
];

function PortfolioDashboard() {
  const [startDate, setStartDate] = useStartDate();
  const { portfolio } = usePortfolio();
  const { portfolioPerformance } = usePortfolioPerformance();
  const tooltip = useTooltipSync();

  const activitiesStartDate = useMemo(
    () => dayjs(portfolio?.activities[0]?.date),
    [portfolio]
  );

  const periodButtons = [
    ...defaultPeriods.filter(({ value }) =>
      value.isAfter(portfolio?.activities[0]?.date ?? currentDate)
    ),
    { label: 'All', value: activitiesStartDate },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState(
    periodButtons[2]
      ? periodButtons[2].value
      : periodButtons[periodButtons.length - 1].value
  );

  useEffect(() => {
    if (!startDate || !selectedPeriod.isSame(startDate, 'date')) {
      setStartDate(selectedPeriod.toDate());
    }
  }, [selectedPeriod, setStartDate, startDate]);

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
        datePeriod={<ButtonGroup buttons={[]} />}
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
          hideAxis
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
      datePeriod={
        <ButtonGroup
          buttons={periodButtons}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      }
    />
  );
}

export default PortfolioDashboard;
