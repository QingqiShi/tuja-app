import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import dayjs from 'dayjs';
import { Select, Type } from '@tuja/components';
import { formatCurrency } from '@tuja/libs';
import EditableTitle from 'components/EditableTitle';
import { updatePortfolioName } from 'libs/portfolioClient';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioProcessor from 'hooks/usePortfolioProcessor';
import useStartDate from 'hooks/useStartDate';
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
  padding-right: ${theme.spacings('s')};
  letter-spacing: ${theme.fonts.ctaSpacing};
  text-transform: uppercase;
`;

const Value = styled(Type).attrs((props) => ({
  ...props,
  noMargin: true,
  scale: 'h6',
}))`
  font-weight: 400;
`;

const Split = styled.div`
  margin-bottom: ${theme.spacings('m')};

  > * {
    margin-bottom: ${theme.spacings('s')};
  }

  > :not(:first-child) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    > :first-child {
      min-width: 50%;
    }
  }

  @media (${theme.breakpoints.minTablet}) {
    display: flex;
    flex-wrap: wrap;
    > * {
      flex-grow: 1;
    }
    > :not(:last-child) {
      margin-right: ${theme.spacings('s')};
    }
    > :not(:first-child) {
      display: block;
      > :first-child {
        min-width: auto;
      }
    }
    > :first-child {
      width: 100%;
      flex-grow: 0;
      margin-right: 0;
    }
  }
  @media (${theme.breakpoints.minLaptop}) {
    > :first-child {
      width: auto;
      min-width: 20rem;
      margin-right: ${theme.spacings('s')};
    }
  }
  @media (${theme.breakpoints.minDesktop}) {
    > * {
      flex-grow: 0;
      min-width: auto;
    }
    > :not(:last-child):not(:first-child) {
      margin-right: ${theme.spacings('l')};
    }
  }
`;

const formatDate = (d: Date) => dayjs(d).format('YYYY-MM-DD ddd');

interface PortfolioOverviewProps {
  isDemo?: boolean;
  className?: string;
}

function PortfolioOverview({ className, isDemo }: PortfolioOverviewProps) {
  const history = useHistory();
  const { portfolio, portfolios } = usePortfolio();
  const { portfolioPerformance, resetSnapshots } = usePortfolioProcessor();
  const [startDate] = useStartDate();

  if (!portfolio) {
    return null;
  }

  const gain =
    (portfolioPerformance?.portfolio.gainSeries.getLast() ?? 0) -
    (portfolioPerformance?.portfolio.gainSeries.data[0]?.[1] ?? 0);

  return (
    <Container className={className}>
      <Split>
        <div>
          <Label>Portfolio Name</Label>
          <EditableTitle
            key={portfolio.name}
            defaultValue={portfolio.name ?? 'My Investments'}
            onChange={
              !isDemo
                ? async (newName) => updatePortfolioName(portfolio.id, newName)
                : undefined
            }
          >
            {(isDemo || portfolios.length === 1) && (
              <Type scale="h5" noMargin>
                {portfolio.name}
              </Type>
            )}
            {!isDemo && portfolios.length > 1 && (
              <Select
                defaultValue={portfolio.id}
                options={portfolios.map((p) => ({
                  label: p.name,
                  value: p.id,
                }))}
                onChange={(e) => {
                  resetSnapshots();
                  history.push(`/portfolio/${e.target.value}`);
                }}
              />
            )}
          </EditableTitle>
        </div>
        <div>
          <Label>Performance Since</Label>
          <Value>{startDate && formatDate(startDate)}</Value>
        </div>
        <div>
          <Label>Gain</Label>
          <Value>
            {(gain ?? 0) > 0 ? '+' : ''}
            {formatCurrency(portfolio.currency, gain ?? 0)}
          </Value>
        </div>
        <div>
          <Label>Return</Label>
          <Value>
            {(
              (portfolioPerformance?.portfolio.twrrSeries.getLast() ?? 0) * 100
            ).toFixed(2)}
            %
          </Value>
        </div>
      </Split>
    </Container>
  );
}

export default PortfolioOverview;
