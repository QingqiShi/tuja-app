import styled from 'styled-components';
import { formatCurrency } from '@tuja/libs';
import { v } from '../../theme';

const ValueStat = styled.div`
  font-size: 2.25rem;
  font-weight: ${v.fontExtraBold};
`;

const SecondaryRow = styled.div`
  font-size: 1.12rem;
  display: flex;
  align-items: center;
`;

const ReturnsStat = styled.span<{ val: number }>`
  color: ${({ val }) => {
    if (val > 0) {
      return v.textGain;
    } else if (val < 0) {
      return v.textLoss;
    }
    return v.textNoChange;
  }};

  ${SecondaryRow} &:not(:last-child) {
    margin-right: ${v.spacerS};
  }
`;

const GainStat = styled(ReturnsStat)`
  font-weight: ${v.fontSemiBold};
`;

interface OverviewStatsProps {
  value: number;
  gain: number;
  returns?: number;
  currency?: string;
}

function OverviewStats({ value, gain, returns, currency }: OverviewStatsProps) {
  return (
    <div>
      <ValueStat>
        {currency ? formatCurrency(currency, value) : value}
      </ValueStat>
      <SecondaryRow>
        <GainStat val={gain}>
          {gain > 0 && '+'}
          {currency ? formatCurrency(currency, gain) : gain}
        </GainStat>
        {typeof returns !== 'undefined' && (
          <ReturnsStat val={returns}>
            ({Math.abs(returns * 100).toFixed(2)}%)
          </ReturnsStat>
        )}
      </SecondaryRow>
    </div>
  );
}

export default OverviewStats;
