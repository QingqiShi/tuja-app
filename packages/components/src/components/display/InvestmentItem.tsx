import styled from 'styled-components';
import { transparentize } from 'polished';
import StockListItem from './StockListItem';
import Chart from './Chart';
import Type from './Type';
import { card } from '../../mixins';

const Container = styled.div`
  ${card}
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacings.s};
  transition: transform 0.2s;
  display: flex;
  align-items: center;

  padding: ${({ theme }) => theme.spacings.xs};
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    padding: ${({ theme }) => theme.spacings.s};
  }

  &:hover {
    transform: scale(1.01);
  }
`;

const IconContainer = styled.div`
  border-radius: ${({ theme }) => theme.spacings.xs};
  background-color: ${({ theme }) =>
    transparentize(0.9, theme.colors.textOnBackground)};
  color: ${({ theme }) => transparentize(0.7, theme.colors.textOnBackground)};
  display: grid;
  place-items: center;
  place-content: center;
  overflow: hidden;

  height: 2.5rem;
  width: 2.5rem;
  min-width: 2.5rem;
  font-size: 0.3rem;
  margin-right: ${({ theme }) => theme.spacings.s};
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    height: 3rem;
    width: 3rem;
    min-width: 3rem;
    font-size: 0.6rem;
    margin-right: ${({ theme }) => theme.spacings.m};
  }

  img {
    width: 100%;
    height: 100%;
  }
`;

const NameContainer = styled.div`
  flex-grow: 1;

  &:not(:last-child) {
    margin-right: ${({ theme }) => theme.spacings.xs};
    @media (${({ theme }) => theme.breakpoints.minTablet}) {
      margin-right: ${({ theme }) => theme.spacings.s};
    }
  }
`;

const ChartContainer = styled.div`
  height: 2.5rem;
  max-width: 8rem;
  width: 20%;

  &:not(:last-child) {
    margin-right: ${({ theme }) => theme.spacings.xs};
    @media (${({ theme }) => theme.breakpoints.minTablet}) {
      margin-right: ${({ theme }) => theme.spacings.s};
    }
  }
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 5.5rem;
  align-items: flex-end;
  justify-content: center;

  > * {
    white-space: nowrap;
  }
`;

const ChangeTag = styled.div<{ change?: number }>`
  color: ${({ theme }) => theme.colors.textOnGainLoss};
  padding: 0 ${({ theme }) => theme.spacings.xs};
  border-radius: ${({ theme }) => theme.spacings.xs};

  background-color: ${({ change, theme }) => {
    if (!change) {
      return theme.colors.disabled;
    } else if (change > 0) {
      return theme.colors.gain;
    }
    return theme.colors.loss;
  }};
`;

const AdditionalTag = styled.div`
  color: ${({ theme }) => theme.colors.textSecondaryOnBackground};
`;

interface InvestmentItemProps {
  code: string;
  name: string;
  icon?: string;
  chartData?: React.ComponentProps<typeof Chart>['data'];
  changePercentage?: number;
  additional?: string;
  onClick?: () => void;
}

function InvestmentItem({
  code,
  name,
  icon,
  chartData,
  changePercentage,
  additional,
  onClick,
}: InvestmentItemProps) {
  return (
    <Container onClick={onClick}>
      <IconContainer>
        {icon ? (
          <img src={icon} alt={code} data-testid="investment-logo" />
        ) : (
          code
        )}
      </IconContainer>
      <NameContainer>
        <StockListItem code={code} name={name} />
      </NameContainer>
      {chartData && (
        <ChartContainer data-testid="investment-chart">
          <Chart data={chartData} hideAxis hideTooltip />
        </ChartContainer>
      )}
      {(typeof changePercentage !== 'undefined' || !!additional) && (
        <DataContainer>
          <ChangeTag change={changePercentage}>
            <Type scale="body2" weight={800} noMargin>
              {`${(changePercentage ?? 0) > 0 ? '+' : ''}${(
                changePercentage ?? 0
              ).toFixed(2)}%`}
            </Type>
          </ChangeTag>
          <AdditionalTag>
            <Type scale="body2" noMargin>
              {additional}
            </Type>
          </AdditionalTag>
        </DataContainer>
      )}
    </Container>
  );
}

export default InvestmentItem;
