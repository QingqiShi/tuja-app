import { useState } from 'react';
import styled from 'styled-components';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import PieBase, { ProvidedProps } from '@visx/shape/lib/shapes/Pie';
import useSize from '../../hooks/useSize';
import { v } from '../../theme';

const Container = styled.div`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  position: relative;
  display: flex;
`;

const Path = styled.path`
  transition: fill 0.2s;
`;

interface PieData {
  label: string;
  percentage: number;
  color?: string;
}

const percentage = (d: PieData) => d.percentage;
const margin = { top: 20, left: 20, bottom: 20, right: 20 };

interface PieProps {
  data?: PieData[];
  className?: string;
  primaryText?: string;
  secondaryText?: string;
}

function Pie({ className, data, primaryText, secondaryText }: PieProps) {
  // Bounds
  const [containerEl, setContainerEl] = useState<Element | null>(null);
  const { width = 400, height = 300 } = useSize(containerEl);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = Math.min(innerWidth, innerHeight) / 7;

  // Hover
  const [hoverItem, setHoverItem] = useState<PieData | null>(null);

  return (
    <Container ref={setContainerEl} className={className}>
      <svg width={width} height={height}>
        <Text
          x={centerX + margin.left}
          y={centerY + margin.top - 10}
          width={(radius - donutThickness) * 2}
          style={{
            fill: v.textMain,
            fontSize: '1.563rem',
            fontWeight: 650,
            letterSpacing: '-0.025em',
          }}
          verticalAnchor="middle"
          textAnchor="middle"
        >
          {hoverItem
            ? `${(hoverItem.percentage * 100).toFixed(1)}%`
            : primaryText}
        </Text>
        <Text
          x={centerX + margin.left}
          y={centerY + margin.top + 20}
          width={(radius - donutThickness) * 2}
          style={{ fill: v.textMain, fontSize: '0.9rem' }}
          verticalAnchor="middle"
          textAnchor="middle"
        >
          {hoverItem ? hoverItem.label : secondaryText}
        </Text>
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          <PieBase
            data={data}
            pieValue={percentage}
            outerRadius={radius}
            innerRadius={radius - donutThickness}
            cornerRadius={3}
            padAngle={0.005}
          >
            {(pie) => (
              <PiePieces
                {...pie}
                innerRadius={radius - donutThickness}
                outerRadius={radius}
                onHover={(h) => setHoverItem(h)}
              />
            )}
          </PieBase>
        </Group>
      </svg>
    </Container>
  );
}

interface PiePieceProps extends ProvidedProps<PieData> {
  innerRadius: number;
  outerRadius: number;
  onHover: (d: PieData | null) => void;
}

function PiePieces({
  arcs,
  path,
  innerRadius,
  outerRadius,
  onHover,
}: PiePieceProps) {
  const [hovering, setHovering] = useState(-1);

  return (
    <>
      {arcs.map((arc, i) => (
        <g key={arc.data.label}>
          <Path
            data-testid={`pie-piece-${arc.data.label}`}
            d={
              path
                .outerRadius(hovering === i ? outerRadius + 5 : outerRadius)
                .innerRadius(hovering === i ? innerRadius - 5 : innerRadius)({
                ...arc,
              }) ?? ''
            }
            fill={arc.data.color ?? v.accentMain}
            style={{ filter: hovering === i ? 'brightness(1.2)' : undefined }}
            onMouseEnter={() => {
              setHovering(i);
              onHover(arc.data);
            }}
            onMouseLeave={() => {
              setHovering(-1);
              onHover(null);
            }}
            onTouchStart={() => {
              setHovering(i);
              onHover(arc.data);
            }}
            onTouchEnd={() => {
              setHovering(-1);
              onHover(null);
            }}
          />
        </g>
      ))}
    </>
  );
}

export default Pie;
