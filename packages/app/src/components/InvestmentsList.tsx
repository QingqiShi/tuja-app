import { useState } from 'react';
import { RiRefreshLine } from 'react-icons/ri';
import styled from 'styled-components/macro';
import { Button, Modal, Select } from '@tuja/components';
import UpdateAlias from 'components/UpdateAlias';
import InvestmentsListItem from 'components/InvestmentsListItem';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioProcessor from 'hooks/usePortfolioProcessor';

const SortByContainer = styled.div`
  display: flex;

  > button {
    margin: calc(
        ${({ theme }) => theme.spacings.s} + ${({ theme }) => theme.spacings.xs}
      )
      0 ${({ theme }) => theme.spacings.s} ${({ theme }) => theme.spacings.s};
  }

  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    flex-direction: row-reverse;
    justify-content: space-between;

    > label {
      width: 300px;
      max-width: 100%;
      display: flex;
      align-items: center;

      > span {
        width: auto;
        white-space: nowrap;
        margin: 0 ${({ theme }) => theme.spacings.xs} 0 0;
      }

      > div {
        flex-grow: 1;
      }
    }

    > button {
      margin: 0 0 ${({ theme }) => theme.spacings.s} 0;
    }
  }
`;

function InvestmentsList() {
  const { portfolio } = usePortfolio();
  const { portfolioPerformance, refresh } = usePortfolioProcessor();

  const { holdings, valueSeries } = portfolioPerformance!.portfolio;

  const [showMore, setShowMore] = useState('');
  const [showAlias, setShowAlias] = useState(false);
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
        <Button
          icon={<RiRefreshLine data-testid="refresh-btn" />}
          onClick={refresh}
          variant="outline"
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
    </>
  );
}

export default InvestmentsList;
