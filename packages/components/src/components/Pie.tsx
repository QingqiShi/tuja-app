import React, { useState } from 'react';
import { useMeasure } from 'react-use';
import styled, { useTheme } from 'styled-components';
import { lighten } from 'polished';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import PieBase, { ProvidedProps } from '@visx/shape/lib/shapes/Pie';
import { theme } from '../theme';

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
  const [containerRef, { width = 400, height = 300 }] = useMeasure<
    HTMLDivElement
  >();
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = Math.min(innerWidth, innerHeight) / 15;

  // Colors
  const styledTheme = useTheme();
  const textColor = theme.colors.textOnBackground({ theme: styledTheme });

  // Hover
  const [hoverItem, setHoverItem] = useState<PieData | null>(null);

  return (
    <Container ref={containerRef} className={className}>
      <svg width={width} height={height}>
        <Text
          x={centerX + margin.left}
          y={centerY + margin.top - 10}
          width={(radius - donutThickness) * 2}
          style={{
            fill: textColor,
            fontSize: '1.563rem',
            fontWeight: 650,
            letterSpacing: '-0.025em',
          }}
          verticalAnchor="middle"
          textAnchor="middle"
        >
          {hoverItem
            ? `${(hoverItem.percentage * 100).toFixed(2)}%`
            : primaryText}
        </Text>
        <Text
          x={centerX + margin.left}
          y={centerY + margin.top + 20}
          width={(radius - donutThickness) * 2}
          style={{ fill: textColor, fontSize: '0.9rem' }}
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

  // Default color
  const styledTheme = useTheme();
  const defaultColor = theme.colors.callToAction({ theme: styledTheme });

  return (
    <>
      {arcs.map((arc, i) => (
        <g key={arc.data.label}>
          <Path
            d={
              path
                .outerRadius(hovering === i ? outerRadius + 5 : outerRadius)
                .innerRadius(hovering === i ? innerRadius - 5 : innerRadius)({
                ...arc,
              }) ?? ''
            }
            fill={
              hovering !== i
                ? arc.data.color ?? defaultColor
                : lighten(0.1, arc.data.color ?? defaultColor)
            }
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
