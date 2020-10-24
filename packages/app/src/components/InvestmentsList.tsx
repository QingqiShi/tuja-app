import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { Select } from '@tuja/components';
import Backdrop from 'components/Backdrop';
import UpdateAlias from 'components/UpdateAlias';
import UpdateAllocation from 'components/UpdateAllocation';
import InvestmentsListItem from 'components/InvestmentsListItem';
import { PortfolioPerformance } from 'libs/portfolio';
import useBodyScrollLock from 'hooks/useBodyScrollLock';
import useColors from 'hooks/useColors';
import useStocksData from 'hooks/useStocksData';
import { Card } from 'commonStyledComponents';
import { theme } from 'theme';

const SortByContainer = styled.div`
  @media (${theme.breakpoints.minTablet}) {
    display: flex;
    justify-content: flex-end;

    > label {
      width: 300px;
      max-width: 100%;
      display: flex;
      align-items: center;

      > span {
        width: auto;
        white-space: nowrap;
        margin: 0 ${theme.spacings('xs')} 0 0;
      }

      > div {
        flex-grow: 1;
      }
    }
  }
`;

interface InvestmentsListProps {
  portfolioPerformance: PortfolioPerformance;
}

function InvestmentsList({
  portfolioPerformance: { valueSeries, holdings },
}: InvestmentsListProps) {
  const [showMore, setShowMore] = useState('');
  const [showAlias, setShowAlias] = useState(false);
  const [showAllocation, setShowAllocation] = useState(false);
  const [currentTicker, setCurrentTicker] = useState('');
  const [sortBy, setSortBy] = useState<
    'GAIN' | 'VALUE' | 'ALLOCATION' | 'TODAY' | 'CHART'
  >('CHART');

  const aliasRef = useBodyScrollLock(showAlias);
  const allocationRef = useBodyScrollLock(showAllocation);

  const { stocksData } = useStocksData();
  const getColor = useColors();

  const value = valueSeries.getLast();

  const sortedHoldings = [...Object.keys(holdings)]
    .sort((a, b) => {
      switch (sortBy) {
        case 'VALUE':
          return holdings[b].value - holdings[a].value;
        case 'ALLOCATION':
          return holdings[b].value / value - holdings[a].value / value;
        case 'TODAY':
          return (
            (stocksData[b].livePrice?.change_p ?? 0) -
            (stocksData[a].livePrice?.change_p ?? 0)
          );
        case 'GAIN':
        default:
          return holdings[b].gain - holdings[a].gain;
      }
    })
    .filter((ticker) => !!holdings[ticker].units);

  return (
    <>
      <SortByContainer>
        <Select
          label="Sort by"
          options={[
            { label: 'Chart', value: 'CHART' },
            { label: 'Gain', value: 'GAIN' },
            { label: 'Current value', value: 'VALUE' },
            { label: 'Allocation', value: 'ALLOCATION' },
            { label: "Today's change", value: 'TODAY' },
          ]}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        />
      </SortByContainer>
      {sortedHoldings.map((ticker) => {
        return (
          <InvestmentsListItem
            key={`investments-table-${ticker}`}
            ticker={ticker}
            holdingPerformance={holdings[ticker]}
            portfolioValue={value}
            showDetails={showMore === ticker}
            mode={sortBy}
            color={getColor(ticker)}
            onToggle={() => setShowMore(showMore === ticker ? '' : ticker)}
            onSetAlias={() => {
              setCurrentTicker(ticker);
              setShowAlias(true);
            }}
            onSetAllocation={() => {
              setCurrentTicker(ticker);
              setShowAllocation(true);
            }}
          />
        );
      })}

      {showAlias && currentTicker && (
        <Backdrop onClick={() => setShowAlias(false)}>
          <Card ref={aliasRef}>
            <UpdateAlias
              ticker={currentTicker}
              onClose={() => setShowAlias(false)}
            />
          </Card>
        </Backdrop>
      )}

      {showAllocation && currentTicker && (
        <Backdrop onClick={() => setShowAllocation(false)}>
          <Card ref={allocationRef}>
            <UpdateAllocation
              ticker={currentTicker}
              onClose={() => setShowAllocation(false)}
            />
          </Card>
        </Backdrop>
      )}
    </>
  );
}

export default InvestmentsList;
