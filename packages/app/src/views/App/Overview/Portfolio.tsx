import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { CaretDown, CaretUp } from 'phosphor-react';
import {
  AllocationOverview,
  Bars,
  ButtonTertiary,
  Chart,
  DateRangeTabs,
  DropdownMenu,
  EdgePadding,
  Fab,
  OverviewStats,
  PageTitle,
  SectionTitle,
  v,
} from '@tuja/components';
import { formatCurrency } from '@tuja/libs';
import InvestmentsListItem from '../../../components/InvestmentsListItem';
import ActivitySelect from '../../../components/ActivitySelect';
import usePortfolio from '../../../hooks/usePortfolio';
import usePortfolioProcessor from '../../../hooks/usePortfolioProcessor';
import useStartDate from '../../../hooks/useStartDate';
import { PortfolioPerformance } from '../../../libs/portfolioClient';

const Spacer = styled.div`
  height: ${v.spacerL};
`;

const ChartContainer = styled.div`
  height: 11.5rem;

  @media (${v.minTablet}) {
    height: 22.5rem;
  }

  @media (${v.minLaptop}) {
    height: 20rem;
    max-width: ${v.maxLayoutWidth};
    padding-left: calc(env(safe-area-inset-left) + ${v.leftRightPadding});
    padding-right: calc(env(safe-area-inset-right) + ${v.leftRightPadding});
    margin: 0 auto;
  }
`;

const ChartActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > :first-child {
    margin-right: ${v.spacerS};
    flex-grow: 1;
    @media (${v.minLaptop}) {
      flex-grow: 0;
    }
  }
`;

const RevealContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${v.spacerS};
`;

const getSortedHoldings = (
  holdings: PortfolioPerformance['portfolio']['holdings']
) => {
  return [...Object.keys(holdings)]
    .filter((ticker) => !!holdings[ticker].units)
    .sort((a, b) => {
      const livePriceA = holdings[a].livePrice;
      const livePriceB = holdings[b].livePrice;
      if (
        livePriceA.change_p === 'NA' ||
        !dayjs().isSame(livePriceA.date, 'day')
      ) {
        return 1;
      } else if (
        livePriceB.change_p === 'NA' ||
        !dayjs().isSame(livePriceB.date, 'day')
      ) {
        return -1;
      }
      return (livePriceB.change_p ?? 0) - (livePriceA.change_p ?? 0);
    });
};

interface PortfolioProps {
  isDemo?: boolean;
}

function Portfolio({ isDemo }: PortfolioProps) {
  const history = useHistory();

  const { portfolio, portfolios } = usePortfolio();
  const { portfolioPerformance, resetSnapshots } = usePortfolioProcessor();
  const [startDate, setStartDate] = useStartDate();

  const [chartType, setChartType] = useState<
    'twrrSeries' | 'gainSeries' | 'valueSeries' | 'monthlyDividends'
  >('twrrSeries');
  const [showAllHoldings, setShowAllHoldings] = useState(false);
  const [showAddActivities, setShowAddActivities] = useState(false);

  if (!portfolio || !portfolioPerformance) {
    return null;
  }

  const value = portfolioPerformance.portfolio.valueSeries.getLast();

  const { holdings } = portfolioPerformance.portfolio;
  const sortedHoldings = getSortedHoldings(holdings);

  return (
    <div>
      <EdgePadding>
        <PageTitle>
          <DropdownMenu
            value={portfolio.id}
            options={portfolios.map((p) => ({
              label: p.name,
              value: p.id,
            }))}
            onChange={(value) => {
              if (
                !isDemo &&
                history.location.pathname !== `/portfolio/${value}`
              ) {
                resetSnapshots();
                history.push(`/portfolio/${value}`);
              }
            }}
            align="left"
          />
        </PageTitle>
        <OverviewStats
          value={value}
          gain={portfolioPerformance.portfolio.gainSeries.getLast()}
          returns={portfolioPerformance.portfolio.twrrSeries.getLast()}
          currency={portfolio.currency}
        />
      </EdgePadding>
      <ChartContainer>
        {chartType === 'twrrSeries' && (
          <Chart
            data={portfolioPerformance.portfolio.twrrSeries.data}
            formatValue={(val) => `${(val * 100).toFixed(1)}%`}
            benchmark={portfolioPerformance?.portfolio.benchmarkSeries?.data}
            benchmarkLabel={portfolio.benchmark}
            hideAxis
          />
        )}
        {chartType === 'gainSeries' && (
          <Chart
            data={portfolioPerformance.portfolio.gainSeries.data}
            formatValue={(val) => formatCurrency(portfolio.currency, val)}
            hideAxis
          />
        )}
        {chartType === 'valueSeries' && (
          <Chart
            data={portfolioPerformance.portfolio.valueSeries.data}
            formatValue={(val) => formatCurrency(portfolio.currency, val)}
            benchmark={portfolioPerformance?.portfolio.cashFlowSeries?.data}
            benchmarkLabel="Invested"
            hideAxis
          />
        )}
        {chartType === 'monthlyDividends' && (
          <Bars
            data={portfolioPerformance?.portfolio.monthlyDividends.data ?? []}
            formatValue={(val) => formatCurrency(portfolio.currency, val)}
          />
        )}
      </ChartContainer>
      <EdgePadding>
        <ChartActions>
          <DateRangeTabs
            maxDate={portfolio.activitiesStartDate}
            value={startDate ?? undefined}
            onChange={setStartDate}
          />
          <DropdownMenu
            value={chartType}
            options={[
              { label: 'TWRR', value: 'twrrSeries' },
              { label: 'Gains', value: 'gainSeries' },
              { label: 'Value', value: 'valueSeries' },
              { label: 'Dividends', value: 'monthlyDividends' },
            ]}
            onChange={(value: any) => setChartType(value)}
            align="right"
          />
        </ChartActions>
        <Spacer />
        <SectionTitle>Holdings</SectionTitle>
        {(showAllHoldings ? sortedHoldings : sortedHoldings.slice(0, 3)).map(
          (ticker) => (
            <InvestmentsListItem
              key={`investments-table-${ticker}`}
              ticker={ticker}
              holdingPerformance={holdings[ticker]}
              portfolioValue={value}
              mode="TODAY"
            />
          )
        )}
        {sortedHoldings.length > 3 && (
          <RevealContainer>
            <ButtonTertiary onClick={() => setShowAllHoldings((val) => !val)}>
              <span style={{ marginRight: v.spacerXS }}>
                {showAllHoldings ? 'See less' : 'See all'}
              </span>
              {showAllHoldings ? (
                <CaretUp weight="bold" />
              ) : (
                <CaretDown weight="bold" />
              )}
            </ButtonTertiary>
          </RevealContainer>
        )}

        {!!sortedHoldings.length &&
          portfolioPerformance.portfolio.lastSnapshot && (
            <>
              <Spacer />
              <SectionTitle>Allocation</SectionTitle>
              <AllocationOverview
                cash={portfolioPerformance.portfolio.lastSnapshot?.cash}
                holdings={portfolioPerformance.portfolio.holdings}
                currency={portfolio.currency}
              />
            </>
          )}

        {!isDemo && <Fab onClick={() => setShowAddActivities(true)} />}

        <ActivitySelect
          showAddActivities={showAddActivities}
          setShowAddActivities={setShowAddActivities}
        />
      </EdgePadding>
    </div>
  );
}

export default Portfolio;
