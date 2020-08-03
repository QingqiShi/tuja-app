import React, { useState } from 'react';
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiEdit2Line,
  RiPercentLine,
} from 'react-icons/ri';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import { PortfolioPerformance } from 'libs/portfolio';
import { formatCurrency } from 'libs/stocksClient';
import useBodyScrollLock from 'hooks/useBodyScrollLock';
import usePortfolio from 'hooks/usePortfolio';
import Type from 'components/Type';
import Button from 'components/Button';
import Backdrop from 'components/Backdrop';
import UpdateAlias from 'components/UpdateAlias';
import UpdateAllocation from 'components/UpdateAllocation';
import Select from 'components/Select';
import { Card, CardMedia } from 'commonStyledComponents';
import { theme, getTheme } from 'theme';

const InvestmentCard = styled(Card)`
  margin-bottom: ${theme.spacings('s')};
`;

const TopRow = styled.div`
  display: flex;
`;

const RowColumn = styled.div`
  > * {
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const TitleContainer = styled(RowColumn)`
  width: 60%;
`;

const PriceContainer = styled(RowColumn)`
  width: 40%;
  text-align: right;
`;

const Label = styled.div`
  font-size: ${theme.fonts.labelSize};
  line-height: ${theme.fonts.labelHeight};
  font-weight: ${theme.fonts.labelWeight};
  color: ${getTheme(theme.colors.textOnBackground, (color) =>
    transparentize(0.4, color)
  )};
  margin-bottom: 0;
  @media (${theme.breakpoints.minLaptop}) {
    margin-bottom: 0;
  }
`;

const DataRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  padding-top: ${theme.spacings('s')};
  grid-gap: ${theme.spacings('xs')};
  @media (${theme.breakpoints.minLaptop}) {
    grid-gap: ${theme.spacings('s')};
  }
  p {
    margin: 0;
  }
`;

const RevealButton = styled.button`
  font-size: 1.2rem;
  border: none;
  background-color: transparent;
  transition: all 0.2s;
  cursor: pointer;
  color: ${theme.colors.textOnBackground};
  padding: ${theme.spacings('xs')};
  margin-top: ${theme.spacings('xs')};

  &:hover {
    background-color: ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 ${theme.spacings('s')} 0
      ${getTheme(theme.colors.textOnBackground, (color) =>
        transparentize(0.9, color)
      )};
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${theme.spacings('s')};
`;

const SortByContainer = styled.div`
  @media (${theme.breakpoints.minTablet}) {
    margin-top: -3.5rem;
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

interface InvestmentsTableProps {
  currency: string;
  portfolioPerformance: PortfolioPerformance;
}

function InvestmentsTable({
  portfolioPerformance: { value, holdings, remainingCash },
  currency,
}: InvestmentsTableProps) {
  const { portfolio } = usePortfolio();
  const [showMore, setShowMore] = useState(-1);
  const [showAlias, setShowAlias] = useState(false);
  const [showAllocation, setShowAllocation] = useState(false);
  const [currentTicker, setCurrentTicker] = useState('');
  const [sortBy, setSortBy] = useState<
    'GAIN' | 'VALUE' | 'ALLOCATION' | 'TODAY'
  >('GAIN');

  const aliasRef = useBodyScrollLock(showAlias);
  const allocationRef = useBodyScrollLock(showAllocation);

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
      {sortedHoldings.map((ticker, i) => {
        const {
          value: holdingValue,
          quantity,
          gain,
          roi,
          dayChangePercentage,
          dayChange,
          info,
        } = holdings[ticker];
        return (
          <InvestmentCard key={`investments-table-${ticker}`}>
            <TopRow>
              <TitleContainer>
                <Type scale="h6">
                  {portfolio?.aliases[ticker] ?? info?.name}
                </Type>
                <Type scale="body1">{ticker}</Type>
              </TitleContainer>
              {sortBy === 'GAIN' && (
                <PriceContainer>
                  <Type scale="h5">
                    {gain >= 0 ? '+' : ''}
                    {formatCurrency(currency, gain)}
                  </Type>
                  <Type scale="body1">
                    {roi >= 0 ? '+' : ''}
                    {(roi * 100).toFixed(2)}%
                  </Type>
                </PriceContainer>
              )}
              {sortBy === 'VALUE' && (
                <PriceContainer>
                  <Type scale="h5">
                    {formatCurrency(currency, holdingValue)}
                  </Type>
                  <Type scale="body1">
                    {quantity} ×{' '}
                    {info && formatCurrency(info.currency, info.quote)}
                  </Type>
                </PriceContainer>
              )}
              {sortBy === 'ALLOCATION' && (
                <PriceContainer>
                  <Type scale="h5">
                    {((holdingValue / value) * 100).toFixed(1)}%
                  </Type>
                  <Type scale="body1">
                    {(
                      (portfolio?.targetAllocations?.[ticker] ?? 0) * 100
                    ).toFixed(2)}
                    %
                  </Type>
                </PriceContainer>
              )}
              {sortBy === 'TODAY' && (
                <PriceContainer>
                  <Type scale="h5">
                    {dayChangePercentage >= 0 ? '+' : ''}
                    {(dayChangePercentage * 100).toFixed(2)}%
                  </Type>
                  <Type scale="body1">
                    {dayChange >= 0 ? '+' : ''}
                    {info && formatCurrency(info.currency, dayChange)}
                  </Type>
                </PriceContainer>
              )}
            </TopRow>

            {showMore === i && (
              <DataRow>
                <div>
                  <Label>Gain</Label>
                  <Type scale="body1">{formatCurrency(currency, gain)}</Type>
                </div>
                <div>
                  <Label>Return</Label>
                  <Type scale="body1">{(roi * 100).toFixed(2)}%</Type>
                </div>
                <div>
                  <Label>Current Value</Label>
                  <Type scale="body1">
                    {formatCurrency(currency, holdingValue)}
                  </Type>
                </div>
                <div>
                  <Label>No. units</Label>
                  <Type scale="body1">{quantity}</Type>
                </div>
                <div>
                  <Label>Current price</Label>
                  <Type scale="body1">
                    {info && formatCurrency(info.currency, info.quote)}
                  </Type>
                </div>
                <div>
                  <Label>Est. cost per unit</Label>
                  <Type scale="body1">
                    {formatCurrency(currency, (holdingValue - gain) / quantity)}
                  </Type>
                </div>
                <div>
                  <Label>Today's change</Label>
                  <Type scale="body1">
                    {dayChangePercentage >= 0 ? '+' : ''}
                    {(dayChangePercentage * 100).toFixed(2)}%
                  </Type>
                </div>
                <div>
                  <Label>Allocation (target)</Label>
                  <Type scale="body1">
                    {((holdingValue / value) * 100).toFixed(1)}% (
                    {(
                      (portfolio?.targetAllocations?.[ticker] ?? 0) * 100
                    ).toFixed(2)}
                    %)
                  </Type>
                </div>
              </DataRow>
            )}

            {showMore === i && (
              <ActionsContainer>
                <Button
                  variant="primary"
                  startIcon={<RiEdit2Line />}
                  onClick={() => {
                    setCurrentTicker(ticker);
                    setShowAlias(true);
                  }}
                >
                  Set Alias
                </Button>
                <Button
                  variant="primary"
                  startIcon={<RiPercentLine />}
                  onClick={() => {
                    setCurrentTicker(ticker);
                    setShowAllocation(true);
                  }}
                >
                  Set Allocation
                </Button>
              </ActionsContainer>
            )}

            <CardMedia>
              <RevealButton
                onClick={() =>
                  showMore === i ? setShowMore(-1) : setShowMore(i)
                }
              >
                {showMore === i ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
              </RevealButton>
            </CardMedia>
          </InvestmentCard>
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

export default InvestmentsTable;
