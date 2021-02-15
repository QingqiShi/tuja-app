import { useState } from 'react';
import styled from 'styled-components/macro';
import { Modal, Select } from '@tuja/components';
import UpdateAlias from 'components/UpdateAlias';
import UpdateAllocation from 'components/UpdateAllocation';
import InvestmentsListItem from 'components/InvestmentsListItem';
import { theme } from 'theme';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioProcessor from 'hooks/usePortfolioProcessor';

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

function InvestmentsList() {
  const { portfolio } = usePortfolio();
  const { portfolioPerformance } = usePortfolioProcessor();

  const { holdings, valueSeries } = portfolioPerformance!;

  const [showMore, setShowMore] = useState('');
  const [showAlias, setShowAlias] = useState(false);
  const [showAllocation, setShowAllocation] = useState(false);
  const [currentTicker, setCurrentTicker] = useState('');
  const [sortBy, setSortBy] = useState<
    'TODAY' | 'GAIN' | 'VALUE' | 'ALLOCATION'
  >('TODAY');

  const value = valueSeries.getLast();

  const sortedHoldings = [...Object.keys(holdings)]
    .sort((a, b) => {
      switch (sortBy) {
        case 'VALUE':
          return holdings[b].value - holdings[a].value;
        case 'ALLOCATION':
          return holdings[b].value / value - holdings[a].value / value;
        case 'TODAY':
          const livePriceA = holdings[a].livePrice;
          const livePriceB = holdings[b].livePrice;
          if (livePriceA.change_p === 'NA') {
            return 1;
          } else if (livePriceB.change_p === 'NA') {
            return -1;
          }
          return (livePriceB.change_p ?? 0) - (livePriceA.change_p ?? 0);
        case 'GAIN':
        default: {
          const costBasis = portfolio?.costBasis;
          if (!costBasis) return 1;

          const aGain =
            holdings[a].value - (costBasis[a] ?? 0) * holdings[a].units;
          const bGain =
            holdings[b].value - (costBasis[b] ?? 0) * holdings[b].units;

          return bGain - aGain;
        }
      }
    })
    .filter((ticker) => !!holdings[ticker].units);

  if (!sortedHoldings.length) {
    return null;
  }

  return (
    <>
      <SortByContainer>
        <Select
          label="Sort by"
          options={[
            { label: "Today's change", value: 'TODAY' },
            { label: 'Gain', value: 'GAIN' },
            { label: 'Current value', value: 'VALUE' },
            { label: 'Allocation', value: 'ALLOCATION' },
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

      {currentTicker && (
        <Modal onClose={() => setShowAlias(false)} open={showAlias}>
          <UpdateAlias
            ticker={currentTicker}
            onClose={() => setShowAlias(false)}
          />
        </Modal>
      )}

      {currentTicker && (
        <Modal onClose={() => setShowAllocation(false)} open={showAllocation}>
          <UpdateAllocation
            ticker={currentTicker}
            onClose={() => setShowAllocation(false)}
          />
        </Modal>
      )}
    </>
  );
}

export default InvestmentsList;
