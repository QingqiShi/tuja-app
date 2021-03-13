import styled from 'styled-components';
import ButtonBase from '../controls/ButtonBase';
import StockListItem from './StockListItem';
import Chart from './Chart';
import Type from './Type';
import { v } from '../../theme';

const Container = styled(ButtonBase)`
  box-shadow: ${v.shadowRaised};
  border-radius: ${v.radiusCard};
  background-color: ${v.backgroundRaised};
  margin-bottom: ${v.spacerS};
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;

  padding: ${v.spacerXS};
  @media (${v.minTablet}) {
    padding: ${v.spacerS};
  }

  &:hover {
    background-color: ${v.backgroundOverlay};
    box-shadow: ${v.shadowOverlay};
  }
`;

const IconContainer = styled.div`
  border-radius: ${v.radiusMedia};
  background-color: ${v.backgroundOverlay};
  color: ${v.textSecondary};
  display: grid;
  place-items: center;
  place-content: center;
  overflow: hidden;

  height: 2.5rem;
  width: 2.5rem;
  min-width: 2.5rem;
  font-size: 0.6rem;
  margin-right: ${v.spacerS};
  @media (${v.minTablet}) {
    height: 3rem;
    width: 3rem;
    min-width: 3rem;
    font-size: 0.8rem;
    margin-right: ${v.spacerM};
  }

  img {
    width: 100%;
    height: 100%;
  }
`;

const NameContainer = styled.div`
  flex-grow: 1;
  font-weight: ${v.fontRegular};

  &:not(:last-child) {
    margin-right: ${v.spacerXS};
    @media (${v.minTablet}) {
      margin-right: ${v.spacerS};
    }
  }
`;

const ChartContainer = styled.div`
  height: 2.5rem;
  max-width: 8rem;
  width: 20%;

  &:not(:last-child) {
    margin-right: ${v.spacerXS};
    @media (${v.minTablet}) {
      margin-right: ${v.spacerS};
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
  color: ${v.backgroundMain};
  padding: 0 ${v.spacerXS};
  border-radius: ${v.radiusMedia};

  background-color: ${({ change }) => {
    if (!change) {
      return v.textNoChange;
    } else if (change > 0) {
      return v.textGain;
    }
    return v.textLoss;
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
    <Container onClick={onClick} data-testid="investment-item">
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
