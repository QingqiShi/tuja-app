import styled from 'styled-components';
import { ordinalBackgroundColor } from '../../mixins';
import { v } from '../../theme';

const Container = styled.div`
  display: flex;
  width: 100%;
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

interface DataPoint {
  id: string;
  value: number;
}

interface HorizontalBarsProps {
  data?: DataPoint[];
  total?: number;
  onEnter?: (data: DataPoint) => void;
  onLeave?: () => void;
}

function HorizontalBars({
  data,
  total,
  onEnter,
  onLeave,
}: HorizontalBarsProps) {
  const base = total ?? data?.reduce((sum, d) => sum + d.value, 0);
  return (
    <Container>
      {data?.map((d, i) => (
        <Segment
          key={d.id}
          data-testid={`segment-${d.id}`}
          index={i}
          width={(base && d.value / base) ?? 0}
          onMouseEnter={() => onEnter?.(d)}
          onMouseLeave={() => onLeave?.()}
        />
      ))}
    </Container>
  );
}

export default HorizontalBars;
