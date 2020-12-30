import { useState, useEffect } from 'react';
import { RiEdit2Line, RiPercentLine } from 'react-icons/ri';
import styled, { css } from 'styled-components/macro';
import { transparentize } from 'polished';
import { Button, Chart, Type } from '@tuja/components';
import { formatCurrency } from '@tuja/libs';
import { PortfolioPerformance } from 'libs/portfolioClient';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioProcessor from 'hooks/usePortfolioProcessor';
import useStartDate from 'hooks/useStartDate';
import { Card } from 'commonStyledComponents';
import useAuth from 'hooks/useAuth';
import { theme, getTheme } from 'theme';
import { StockHistory } from 'libs/stocksClient';
import { getDB, getStocksHistory } from 'libs/cachedStocksData';

const InvestmentContainer = styled.div`
  position: relative;
  transition: transform 0.2s;
  cursor: pointer;
  margin-bottom: ${theme.spacings('xs')};

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
  margin-bottom: -${theme.spacings('xs')};
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

const endDate = new Date();

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
  const { isReady } = usePortfolioProcessor();
  const [startDate] = useStartDate();

  // Load stock history from cache so we can display chart
  const [stockHistory, setStockHistory] = useState<StockHistory | null>(null);
  useEffect(() => {
    const fetch = async () => {
      if (startDate) {
        const db = await getDB();
        const result = await getStocksHistory(db, [ticker], startDate, endDate);
        setStockHistory(result[ticker]);
      }
    };
    if (isReady) {
      fetch();
    }
  }, [isReady, startDate, ticker]);

  if (!portfolio || portfolioValue === 0) {
    return null;
  }

  const { currency, aliases, targetAllocations } = portfolio;
  const { value, units, info, livePrice } = holdingPerformance;

  const costBasis = portfolio.costBasis?.[ticker] ?? 0;
  const totalCost = costBasis * units;
  const gain = value - totalCost;
  const returns = gain / value;

  return (
    <InvestmentContainer onClick={onToggle}>
      <InvestmentCard>
        <TopRow>
          <TitleContainer>
            <Type scale="h6">{aliases[ticker] ?? info?.Name ?? ticker}</Type>
            <Type scale="body1">{ticker}</Type>
          </TitleContainer>

          {mode === 'GAIN' && (
            <PriceContainer>
              <Type scale="h6">
                {gain >= 0 && '+'}
                {formatCurrency(currency, gain)}
              </Type>
              <Type scale="body1">
                {returns >= 0 && '+'}
                {(returns * 100).toFixed(2)}%
              </Type>
            </PriceContainer>
          )}
          {mode === 'VALUE' && (
            <PriceContainer>
              <Type scale="h6">{formatCurrency(currency, value)}</Type>
              <Type scale="body1">
                {units} ×{' '}
                {info &&
                  livePrice &&
                  (livePrice.close !== 'NA'
                    ? formatCurrency(info.Currency, livePrice.close)
                    : 'NA')}
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
                {livePrice.change_p === 'NA'
                  ? 'NA'
                  : `${(livePrice?.change_p ?? 0) >= 0 ? '+' : ''}${(
                      livePrice?.change_p ?? 0
                    ).toFixed(2)}%`}
              </Type>
              <Type scale="body1">
                {(livePrice?.change ?? 0) >= 0 && '+'}
                {info &&
                  (livePrice.change === 'NA'
                    ? 'NA'
                    : formatCurrency(info.Currency, livePrice?.change ?? 0))}
              </Type>
            </PriceContainer>
          )}
          {mode === 'CHART' && (
            <PriceContainer>
              <Chart
                data={stockHistory?.adjusted?.data.filter(
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
            <Type scale="body1">{(returns * 100).toFixed(2)}%</Type>
          </div>
          <div>
            <Label>Current Value</Label>
            <Type scale="body1">{formatCurrency(currency, value)}</Type>
          </div>
          <div>
            <Label>No. units</Label>
            <Type scale="body1">{units}</Type>
          </div>
          <div>
            <Label>Current price</Label>
            <Type scale="body1">
              {info &&
                livePrice &&
                (livePrice.close === 'NA'
                  ? 'NA'
                  : formatCurrency(info.Currency, livePrice.close))}
            </Type>
          </div>
          <div>
            <Label>Est. cost per unit</Label>
            <Type scale="body1">{formatCurrency(currency, costBasis)}</Type>
          </div>
          <div>
            <Label>Today's change</Label>
            <Type scale="body1">
              {livePrice.change_p === 'NA'
                ? 'NA'
                : `${(livePrice?.change_p ?? 0) >= 0 ? '+' : ''}${(
                    livePrice?.change_p ?? 0
                  ).toFixed(2)}%`}
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
