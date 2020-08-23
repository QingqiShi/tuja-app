import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { PortfolioPerformance } from 'libs/portfolio';
import useBodyScrollLock from 'hooks/useBodyScrollLock';
import Backdrop from 'components/Backdrop';
import UpdateAlias from 'components/UpdateAlias';
import UpdateAllocation from 'components/UpdateAllocation';
import InvestmentsListItem from 'components/InvestmentsListItem';
import Select from 'components/Select';
import { Card } from 'commonStyledComponents';
import useColors from 'hooks/useColors';
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
  portfolioPerformance: { value, holdings },
}: InvestmentsListProps) {
  const [showMore, setShowMore] = useState('');
  const [showAlias, setShowAlias] = useState(false);
  const [showAllocation, setShowAllocation] = useState(false);
  const [currentTicker, setCurrentTicker] = useState('');
  const [sortBy, setSortBy] = useState<
    'GAIN' | 'VALUE' | 'ALLOCATION' | 'TODAY'
  >('GAIN');

  const aliasRef = useBodyScrollLock(showAlias);
  const allocationRef = useBodyScrollLock(showAllocation);

  const getColor = useColors();

  const sortedHoldings = [...Object.keys(holdings)]
    .sort((a, b) => {
      switch (sortBy) {
        case 'VALUE':
          return holdings[b].value - holdings[a].value;
        case 'ALLOCATION':
          return holdings[b].value / value - holdings[a].value / value;
        case 'TODAY':
          return (
            holdings[b].dayChangePercentage - holdings[a].dayChangePercentage
          );
        case 'GAIN':
        default:
          return holdings[b].gain - holdings[a].gain;
      }
    })
    .filter((ticker) => !!holdings[ticker].quantity);

  return (
    <>
      <SortByContainer>
        <Select
          label="Sort by"
          options={[
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
