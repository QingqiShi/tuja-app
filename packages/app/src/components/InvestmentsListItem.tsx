import React from 'react';
import { RiEdit2Line, RiPercentLine } from 'react-icons/ri';
import styled, { css } from 'styled-components/macro';
import { transparentize } from 'polished';
import { PortfolioPerformance } from 'libs/portfolio';
import { formatCurrency } from 'libs/stocksClient';
import usePortfolio from 'hooks/usePortfolio';
import useStocksData from 'hooks/useStocksData';
import useStartDate from 'hooks/useStartDate';
import Type from 'components/Type';
import Button from 'components/Button';
import Chart from 'components/Chart';
import { Card } from 'commonStyledComponents';
import useAuth from 'hooks/useAuth';
import { theme, getTheme } from 'theme';

const InvestmentContainer = styled.div`
  position: relative;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover > div:last-child {
    transform: translateY(-${theme.spacings('xs')});
  }
`;

const InvestmentCard = styled(Card)`
  z-index: 5;
  position: relative;
`;

interface DetailsCardProps {
  show: boolean;
  height: number;
  color?: string;
}
const DetailsCard = styled(Card)<DetailsCardProps>`
  margin-bottom: ${theme.spacings('s')};
  transform: translateY(
      calc(-${theme.spacings('xs')} - ${theme.spacings('xs')})
    )
    scale(0.98);
  transition: transform 0.2s, max-height 0.2s, background-color 0.2s,
    padding 0.2s;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  z-index: 0;
  position: relative;

  ${({ show, color, height }) =>
    show
      ? css`
          cursor: default;
          max-height: calc(${height}px + ${theme.spacings('s')} * 3);
          padding: ${theme.spacings('s')};
          background-color: ${theme.colors.backgroundMain};
          @media (${theme.breakpoints.minTablet}) {
            padding: ${theme.spacings('s')};
          }
          @media (${theme.breakpoints.minLaptop}) {
            padding: ${theme.spacings('s')} ${theme.spacings('m')};
          }
        `
      : css`
          pointer-events: none;
          max-height: calc(${theme.spacings('s')} + ${theme.spacings('xs')});
          padding: 0 ${theme.spacings('s')};
          background-color: ${(props) =>
            color ?? theme.colors.callToAction(props)};
          @media (${theme.breakpoints.minTablet}) {
            padding: 0 ${theme.spacings('s')};
          }
          @media (${theme.breakpoints.minLaptop}) {
            padding: 0 ${theme.spacings('s')};
          }
        `}

  > div {
    transition: opacity 0.2s;
    opacity: ${({ show }) => (show ? 1 : 0)};
  }
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

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${theme.spacings('s')};
`;

interface InvestmentsListItemProps {
  ticker: string;
  holdingPerformance: PortfolioPerformance['holdings'][''];
  portfolioValue: number;
  showDetails?: boolean;
  color?: string;
  mode?: 'GAIN' | 'VALUE' | 'ALLOCATION' | 'TODAY' | 'CHART';
  onToggle?: () => void;
  onSetAlias?: () => void;
  onSetAllocation?: () => void;
}

function InvestmentsListItem({
  ticker,
  holdingPerformance,
  portfolioValue,
  showDetails,
  color,
  mode,
  onToggle,
  onSetAlias,
  onSetAllocation,
}: InvestmentsListItemProps) {
  const { state } = useAuth();
  const { portfolio } = usePortfolio();
  const { stocksData } = useStocksData();
  const [startDate] = useStartDate();

  if (!portfolio || portfolioValue === 0) {
    return null;
  }

  const { currency, aliases, targetAllocations } = portfolio;
  const {
    info,
    gain,
    roi,
    quantity,
    value,
    dayChange,
    dayChangePercentage,
  } = holdingPerformance;

  return (
    <InvestmentContainer onClick={onToggle}>
      <InvestmentCard>
        <TopRow>
          <TitleContainer>
            <Type scale="h6">{aliases[ticker] ?? info?.name}</Type>
            <Type scale="body1">{ticker}</Type>
          </TitleContainer>

          {mode === 'GAIN' && (
            <PriceContainer>
              <Type scale="h6">
                {gain >= 0 && '+'}
                {formatCurrency(currency, gain)}
              </Type>
              <Type scale="body1">
                {roi >= 0 && '+'}
                {(roi * 100).toFixed(2)}%
              </Type>
            </PriceContainer>
          )}
          {mode === 'VALUE' && (
            <PriceContainer>
              <Type scale="h6">{formatCurrency(currency, value)}</Type>
              <Type scale="body1">
                {quantity} × {info && formatCurrency(info.currency, info.quote)}
              </Type>
            </PriceContainer>
          )}
          {mode === 'ALLOCATION' && (
            <PriceContainer>
              <Type scale="h6">
                {((value / portfolioValue) * 100).toFixed(1)}%
              </Type>
              <Type scale="body1">
                {((targetAllocations?.[ticker] ?? 0) * 100).toFixed(2)}%
              </Type>
            </PriceContainer>
          )}
          {mode === 'TODAY' && (
            <PriceContainer>
              <Type scale="h6">
                {dayChangePercentage >= 0 ? '+' : ''}
                {(dayChangePercentage * 100).toFixed(2)}%
              </Type>
              <Type scale="body1">
                {dayChange >= 0 && '+'}
                {info && formatCurrency(info.currency, dayChange)}
              </Type>
            </PriceContainer>
          )}
          {mode === 'CHART' && (
            <PriceContainer>
              <Chart
                data={stocksData[ticker].series?.data.filter(
                  (dp) => startDate && dp[0] >= startDate
                )}
                hideTooltip
                hideAxis
              />
            </PriceContainer>
          )}
        </TopRow>
      </InvestmentCard>

      <DetailsCard
        show={!!showDetails}
        color={color}
        height={500}
        onClick={(e) => {
          if (showDetails) {
            e.stopPropagation();
          }
        }}
      >
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
            <Type scale="body1">{formatCurrency(currency, value)}</Type>
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
              {formatCurrency(currency, (value - gain) / quantity)}
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
              {((value / portfolioValue) * 100).toFixed(1)}% (
              {((portfolio?.targetAllocations?.[ticker] ?? 0) * 100).toFixed(2)}
              %)
            </Type>
          </div>
        </DataRow>
        {state === 'SIGNED_IN' && (
          <ActionsContainer>
            <Button
              variant="primary"
              startIcon={<RiEdit2Line />}
              onClick={onSetAlias}
            >
              Set Alias
            </Button>
            <Button
              variant="primary"
              startIcon={<RiPercentLine />}
              onClick={onSetAllocation}
            >
              Set Allocation
            </Button>
          </ActionsContainer>
        )}
      </DetailsCard>
    </InvestmentContainer>
  );
}

export default InvestmentsListItem;
