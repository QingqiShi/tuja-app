import React from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import Type from 'components/Type';
import EditableTitle from 'components/EditableTitle';
import Pie from 'components/Pie';
import { updatePortfolioName } from 'libs/portfolio';
import { formatCurrency } from 'libs/stocksClient';
import useStartDate from 'hooks/useStartDate';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioPerformance from 'hooks/usePortfolioPerformance';
import { theme, getTheme } from 'theme';

const Container = styled.div`
  text-align: left;
  justify-content: center;
  > div {
    width: 100%;
  }
`;

const Label = styled(Type).attrs((props) => ({
  ...props,
  noMargin: true,
  scale: 'body2',
}))`
  color: ${getTheme(theme.colors.textOnBackground, (color) =>
    transparentize(0.5, color)
  )};
  margin-top: ${theme.spacings('s')};
`;

const Split = styled.div`
  display: flex;
  > * {
    flex-grow: 1;
  }
  > :not(:last-child) {
    padding-right: ${theme.spacings('s')};
  }
`;

const PieContainer = styled.div`
  width: 100%;
  max-width: 300px;
  position: relative;
  margin: ${theme.spacings('s')} auto;

  &:after {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  > div {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`;

interface PortfolioOverviewProps {
  className?: string;
  editable?: boolean;
}

function PortfolioOverview({ className, editable }: PortfolioOverviewProps) {
  const { portfolio } = usePortfolio();
  const { portfolioPerformance } = usePortfolioPerformance();
  const [startDate] = useStartDate();

  const pieData = portfolioPerformance
    ? Object.keys(portfolioPerformance.holdings)
        .map((ticker) => ({
          label: ticker,
          percentage:
            portfolioPerformance.holdings[ticker].value /
            portfolioPerformance.value,
        }))
        .concat({
          label: 'Cash',
          percentage:
            portfolioPerformance.remainingCash / portfolioPerformance.value,
        })
        .sort((a, b) => b.percentage - a.percentage)
    : [];

  if (!portfolio) {
    return null;
  }

  return (
    <Container className={className}>
      <div>
        {editable ? (
          <EditableTitle
            scale="h5"
            value={portfolio.name ?? 'My Investments'}
            onChange={async (newName) =>
              updatePortfolioName(portfolio.id, newName)
            }
          />
        ) : (
          <Type scale="h5">{portfolio.name ?? 'My Investments'}</Type>
        )}
        <PieContainer>
          <div>
            <Pie
              data={pieData}
              primaryText={formatCurrency(
                portfolio.currency,
                portfolioPerformance?.value ?? 0
              )}
              secondaryText="Portfolio Value"
            />
          </div>
        </PieContainer>

        <Split>
          {startDate && (
            <div>
              <Label>Since</Label>
              <Type scale="body1" noMargin>
                {dayjs(startDate).format('YYYY-MM-DD')}
              </Type>
            </div>
          )}
          <div>
            <Label>Gain</Label>
            <Type scale="body1" noMargin>
              {formatCurrency(
                portfolio.currency,
                portfolioPerformance?.gain ?? 0
              )}
            </Type>
          </div>
          <div>
            <Label>Return</Label>
            <Type scale="body1" noMargin>
              {((portfolioPerformance?.roi ?? 0) * 100).toFixed(2)}%
            </Type>
          </div>
        </Split>
      </div>
    </Container>
  );
}

export default PortfolioOverview;
