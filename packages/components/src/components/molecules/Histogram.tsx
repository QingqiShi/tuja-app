import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Bin, bin } from 'd3-array';
import { Bar } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear, ScaleTypeToD3Scale } from '@visx/scale';
import { Group } from '@visx/group';
import useSize from '../../hooks/useSize';
import { v } from '../../theme';

const Container = styled.div`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  position: relative;
  display: flex;
`;

const Tooltip = styled.div<{ x: number; y: number; width: number }>`
  position: absolute;
  top: calc(${({ y }) => y}px - 1.5rem);
  left: ${({ x }) => x}px;
  width: ${({ width }) => width}px;
  color: ${v.textMain};
  z-index: ${v.zRaised};
  text-align: center;
  font-weight: ${v.fontSemiBold};
  font-size: 0.8rem;
`;

const getThresholds = (min: number, max: number, binCount: number) => {
  const thresholds = new Array(binCount + 1);
  for (let i = 0; i < thresholds.length; i++) {
    thresholds[i] = min + ((max - min) / binCount) * i;
  }
  return thresholds;
};

const PRECISION = 100000;
const defaultValueFormatter = (value: number) =>
  `${Math.round(value * PRECISION) / PRECISION}`;

interface HistogramProps {
  className?: string;
  data?: number[];
  binCount?: number;
  xMin?: number;
  xMax?: number;
  yMax?: number;
  formatValue?: (val: number) => string;
}

function Histogram({
  className,
  data,
  binCount = 10,
  xMin,
  xMax,
  yMax,
  formatValue = defaultValueFormatter,
}: HistogramProps) {
  // Bounds
  const [containerEl, setContainerEl] = useState<Element | null>(null);
  const { width = 400, height = 300 } = useSize(containerEl);
  const margin = { top: 30, left: 40, bottom: 30, right: 0 };
  const innerWidth = Math.max(width - margin.left - margin.right, 0);
  const innerHeight = Math.max(height - margin.top - margin.bottom, 0);
  const dataMax = xMax ?? Math.max(...(data ?? []));
  const dataMin = xMin ?? Math.min(...(data ?? []));

  // Bins
  const thresholds = getThresholds(dataMin, dataMax, binCount);
  const getBin = bin()
    .domain([
      Math.min(dataMin, ...(data ?? [])),
      Math.max(dataMax, ...(data ?? [])),
    ])
    .thresholds(thresholds);
  const bins = getBin(data ?? []);
  const binWidth = (dataMax - dataMin) / binCount;

  // Scale
  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight, 0],
        domain: [
          0,
          Math.max(
            yMax ?? 0,
            Math.max(...bins.map((bin) => bin.length / (data?.length ?? 1)))
          ),
        ],
        nice: true,
      }),
    [bins, data?.length, innerHeight, yMax]
  );
  const xScale = useMemo(
    () =>
      scaleLinear({
        range: [0, innerWidth],
        domain: [dataMin - binWidth, dataMax + binWidth],
      }),
    [binWidth, dataMax, dataMin, innerWidth]
  );

  // Axis label
  const axisBottomTickLabelProps = {
    textAnchor: 'middle' as const,
    fontFamily: v.fontFamily,
    fontSize: '0.7rem',
    fill: v.textSecondary,
  };
  const axisLeftTickLabelProps = {
    dx: '-0.25em',
    dy: '0.25em',
    textAnchor: 'end' as const,
    fontFamily: v.fontFamily,
    fontSize: '0.7rem',
    fill: v.textSecondary,
  };

  // Tooltip
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    width: number;
    value: number;
  } | null>(null);

  return (
    <Container ref={setContainerEl} className={className}>
      <svg className={className} width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={yScale}
            width={innerWidth}
            pointerEvents="none"
            numTicks={5}
            stroke={v.backgroundHover}
          />
          <AxisLeft
            scale={yScale}
            numTicks={5}
            tickFormat={(tick) => `${Math.round(tick.valueOf() * 100)}%`}
            stroke={v.textSecondary}
            tickStroke={v.textSecondary}
            tickLabelProps={() => axisLeftTickLabelProps}
          />
          <AxisBottom
            scale={xScale}
            top={innerHeight}
            tickValues={thresholds}
            tickFormat={(tick, i) =>
              `${i === 0 ? '<' : ''}${formatValue(tick.valueOf())}${
                i === thresholds.length - 1 ? '>' : ''
              }`
            }
            stroke={v.textSecondary}
            tickStroke={v.textSecondary}
            tickLabelProps={() => axisBottomTickLabelProps}
          />
          {bins.map((bin) => (
            <HistogramBar
              key={`bin-${bin.x0}-${bin.x1}`}
              bin={bin}
              binTotal={data?.length ?? 0}
              binSize={binWidth}
              innerHeight={innerHeight}
              xScale={xScale}
              yScale={yScale}
              onHover={setHover}
            />
          ))}
        </Group>
      </svg>

      {hover && (
        <Tooltip
          x={margin.left + hover.x}
          y={margin.top + hover.y}
          width={hover.width}
        >
          {`${Math.round(hover.value * 100)}%`}
        </Tooltip>
      )}
    </Container>
  );
}

interface HistogramBarProps {
  bin: Bin<number, number>;
  binTotal: number;
  binSize: number;
  innerHeight: number;
  xScale: ScaleTypeToD3Scale<number>['linear'];
  yScale: ScaleTypeToD3Scale<number>['linear'];
  onHover?: (
    data: { x: number; y: number; width: number; value: number } | null
  ) => void;
}

const GAP = 2;

function HistogramBar({
  bin,
  binTotal,
  binSize,
  innerHeight,
  xScale,
  yScale,
  onHover,
}: HistogramBarProps) {
  const value = bin.length / (binTotal || 1);
  const barHeight = Math.max(innerHeight - (yScale(value) ?? 0) - GAP, 0);
  const barX = xScale(bin.x0 ?? 0) + GAP / 2;
  const barWidth = xScale((bin.x0 ?? 0) + binSize) - barX - GAP / 2;
  const barY = innerHeight - barHeight - GAP - 1;

  const [isHovering, setIsHovering] = useState(false);
  const hoverData = { x: barX < 0 ? 0 : barX, y: barY, width: barWidth, value };

  if (!value) return null;

  return (
    <Bar
      data-testid="histogram-bar"
      x={barX < GAP ? GAP : barX}
      y={barY}
      width={barWidth}
      height={barHeight}
      fill={isHovering && onHover ? v.accentHover : v.accentMain}
      onMouseEnter={() => {
        setIsHovering(true);
        onHover?.(hoverData);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        onHover?.(null);
      }}
      onTouchStart={() => {
        setIsHovering(true);
        onHover?.(hoverData);
      }}
      onTouchEnd={() => {
        setIsHovering(false);
        onHover?.(null);
      }}
    />
  );
}

export default Histogram;
