import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useMeasure } from 'react-use';
import styled, { css, useTheme } from 'styled-components';
import { transparentize } from 'polished';
import { LinearGradient } from '@visx/gradient';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { localPoint } from '@visx/event';
import dayjs from 'dayjs';

const Container = styled.div`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  position: relative;
  display: flex;
`;

const StyledTooltip = styled.div`
  border-radius: 3px;
  font-size: 14px;
  line-height: 1em;
  font-weight: 600;
  padding: ${({ theme }) => theme.spacings.xs};
  pointer-events: none;
  position: absolute;
  text-align: center;
  position: static;
  display: flex;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.spacings.xs};
  background-color: ${({ theme }) => theme.colors.backgroundRaised};
  color: ${({ theme }) => theme.colors.textOnBackground};
  box-shadow: 0 0 0 1px
    ${({ theme }) => transparentize(0.7, theme.colors.textOnBackground)};

  > :first-child {
    margin-right: ${({ theme }) => theme.spacings.xs};
  }

  > * {
    flex-grow: 1;
    text-align: center;
  }
`;

interface TooltipContainerProps {
  top?: number;
  bottom?: number;
  left: number;
}
const TooltipContainer = styled.div<TooltipContainerProps>`
  position: absolute;
  pointer-events: none;
  left: ${({ left }) => left}px;
  ${({ top }) =>
    typeof top !== 'undefined' &&
    css`
      top: ${top}px;
    `}
  ${({ bottom }) =>
    typeof bottom !== 'undefined' &&
    css`
      bottom: ${bottom}px;
    `}
`;

type DataPoint = readonly [Date, number];

const formatTooltipDate = (d: Date) => dayjs(d).format('MMM YYYY');

interface ChartProps {
  data?: DataPoint[];
  className?: string;
  formatValue?: (val: number) => string;
}

function Bars({ data, className, formatValue }: ChartProps) {
  // bounds
  const [
    containerRef,
    { width = 400, height = 300 },
  ] = useMeasure<HTMLDivElement>();
  const margin = { top: 10, left: 10, bottom: 10, right: 10 };
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(height - margin.top - margin.bottom, 0);

  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<Date>({
        range: [0, xMax],
        round: true,
        domain: data?.map((d) => d[0]) ?? [],
        padding: 0.2,
      }),
    [data, xMax]
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...(data?.map((d) => d[1]) ?? []))],
      }),
    [data, yMax]
  );

  // Theme related styles
  const theme = useTheme();
  const colors = {
    chartLine: theme.colors.callToActionText,
    text: transparentize(0.6, theme.colors.textOnBackground),
    chartGradientTo: theme.colors.callToAction,
  };

  // Tooltip
  const [tooltipRef, tooltipRect] = useMeasure<HTMLDivElement>();
  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const tooltipDateSpanRef = useRef<HTMLSpanElement>(null);
  const tooltipValueSpanRef = useRef<HTMLSpanElement>(null);
  const setTooltipStylesRef = useRef(
    (
      d: DataPoint,
      top: number,
      left: number,
      xMax: number,
      tooltipRect: { width: number; height: number }
    ) => {
      if (tooltipContainerRef.current) {
        const w = tooltipRect.width;
        const h = tooltipRect.height;
        const r = w / 2;

        let tooltipX = left - r;
        if (left >= xMax - 5 - r) tooltipX = xMax - 5 - w;
        if (left <= r + 5) tooltipX = 5;

        let tooltipY = top - h;
        if (tooltipY <= 0) tooltipY = 0;

        tooltipContainerRef.current.style.opacity = '1';
        tooltipContainerRef.current.style.transform = `translate3d(${tooltipX}px, ${tooltipY}px, 0)`;
      }
      if (tooltipDateSpanRef.current) {
        tooltipDateSpanRef.current.textContent = formatTooltipDate(d[0]);
      }
      if (tooltipValueSpanRef.current) {
        tooltipValueSpanRef.current.textContent = formatValue
          ? formatValue(d[1])
          : d[1].toFixed(2);
      }
    }
  );
  const handleTooltip = useCallback(
    (d: DataPoint, { barX, barWidth }: { barWidth: number; barX?: number }) => (
      event: React.TouchEvent | React.MouseEvent
    ) => {
      const { y } = localPoint(event) || { x: 0 };
      const top = (y ?? 0) - margin.top;
      const left = (barX ?? 0) + barWidth / 2;

      setTooltipStylesRef.current?.(d, top, left, xMax, tooltipRect);
    },
    [margin.top, tooltipRect, xMax]
  );
  const clearTooltip = () => {
    if (tooltipContainerRef.current) {
      tooltipContainerRef.current.style.opacity = '0';
    }
  };
  useEffect(() => {
    clearTooltip();
  }, []);

  return (
    <Container ref={containerRef} className={className}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <LinearGradient
            id="bar-gradient"
            from={colors.chartLine}
            fromOpacity={1}
            to={colors.chartGradientTo}
            toOpacity={0.8}
            toOffset="80%"
          />
          {data?.map((d) => {
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - (yScale(d[1]) ?? 0);
            const barX = xScale(d[0]);
            const barY = yMax - barHeight;
            return (
              <Bar
                key={`bar-${d[0].getTime()}`}
                data-testid={`bar-${d[0].getTime()}`}
                fill="url(#bar-gradient)"
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                onTouchStart={handleTooltip(d, { barX, barWidth })}
                onTouchMove={handleTooltip(d, { barX, barWidth })}
                onMouseMove={handleTooltip(d, { barX, barWidth })}
                onMouseLeave={clearTooltip}
                onTouchEnd={clearTooltip}
                rx={theme.spacings.xs}
              />
            );
          })}
        </Group>
      </svg>
      <TooltipContainer
        data-testid="bars-tooltip"
        ref={tooltipContainerRef}
        left={margin.left}
        top={margin.top + 1}
      >
        <div ref={tooltipRef}>
          <StyledTooltip>
            <span ref={tooltipDateSpanRef} />
            <span ref={tooltipValueSpanRef} />
          </StyledTooltip>
        </div>
      </TooltipContainer>
    </Container>
  );
}

export default Bars;
