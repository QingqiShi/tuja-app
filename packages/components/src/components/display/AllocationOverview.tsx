import { useState } from 'react';
import styled from 'styled-components';
import { formatCurrency } from '@tuja/libs';
import { v } from '../../theme';
import { ordinalBackgroundColor } from '../../mixins';

const Card = styled.div`
  background-color: ${v.backgroundRaised};
  border-radius: ${v.radiusCard};
  box-shadow: ${v.shadowRaised};
  padding: ${v.spacerS};
`;

const FirstRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${v.spacerS};
`;

const ValueContainer = styled.div`
  text-align: right;
`;

const CashValue = styled.div`
  color: ${v.textSecondary};
  font-size: 0.9rem;
  margin-top: 0.2rem;
`;

const HoldingValue = styled.div`
  font-size: 0.9rem;
  margin-top: 0.2rem;
`;

const Chart = styled.div`
  display: flex;
`;

const Segment = styled.div<{ width: number; index: number }>`
  ${ordinalBackgroundColor}

  border-radius: ${v.spacerXS};
  width: ${({ width }) => `${(width * 100).toFixed(2)}%`};
  height: ${v.spacerM};

  &:hover {
    filter: brightness(1.2);
  }

  &:not(:last-child) {
    margin-right: 2px;
  }
`;

interface AllocationOverviewProps {
  cash: number;
  holdings: {
    [ticker: string]: {
      value: number;
    };
  };
  currency: string;
}

function AllocationOverview({
  cash,
  holdings,
  currency,
}: AllocationOverviewProps) {
  const [hovering, setHovering] = useState<{
    ticker: string;
    value: number;
  } | null>(null);

  const totalHoldingsValue = Object.values(holdings).reduce(
    (sum, { value }) => sum + value,
    0
  );
  const totalValue = totalHoldingsValue + cash;
  return (
    <Card>
      <FirstRow>
        {hovering === null && (
          <div>{Object.keys(holdings).length} investments</div>
        )}
        {hovering !== null && (
          <div>
            <div>{hovering.ticker}</div>
            <HoldingValue>
              {formatCurrency(currency, hovering.value)} (
              {((hovering.value / totalValue) * 100).toFixed(2)}%)
            </HoldingValue>
          </div>
        )}
        <ValueContainer>
          <div>{formatCurrency(currency, totalHoldingsValue)}</div>
          <CashValue>+ {formatCurrency(currency, cash)} cash</CashValue>
        </ValueContainer>
      </FirstRow>
      <Chart>
        {[
          ...Object.keys(holdings).map((ticker) => ({
            ticker,
            value: holdings[ticker].value,
          })),
          { ticker: 'Cash', value: cash },
        ]
          .sort((a, b) => b.value - a.value)
          .map((holding, i) => (
            <Segment
              key={`${i}`}
              data-testid={`segment-${holding.ticker}`}
              width={holding.value / totalValue}
              index={i}
              onMouseEnter={() => setHovering(holding)}
              onMouseLeave={() => setHovering(null)}
            />
          ))}
      </Chart>
    </Card>
  );
}

export default AllocationOverview;
