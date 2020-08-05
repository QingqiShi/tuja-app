import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { useMeasure } from 'react-use';
import { useSpring, animated } from '@react-spring/web';
import styled, { useTheme, css } from 'styled-components/macro';
import { transparentize } from 'polished';
import { LinearGradient } from '@vx/gradient';
import { AreaClosed, LinePath, Bar } from '@vx/shape';
import { scaleTime, scaleLinear } from '@vx/scale';
import { curveMonotoneX } from '@vx/curve';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { GridRows } from '@vx/grid';
import { Group } from '@vx/group';
import { localPoint } from '@vx/event';
import { max, min, extent, bisector } from 'd3-array';
import dayjs from 'dayjs';
import { theme, getTheme } from 'theme';
import type { TooltipSync } from 'hooks/useTooltipSync';
import { formatCurrency } from 'libs/stocksClient';

const Container = styled.div`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  position: relative;
  display: flex;
`;

const StyledTooltip = styled.div<{ primary?: boolean }>`
  border-radius: 3px;
  font-size: 14px;
  line-height: 1em;
  font-weight: 600;
  padding: ${theme.spacings('xs')};
  pointer-events: none;
  position: absolute;
  min-width: 200px;
  text-align: center;
  position: static;
  display: flex;
  justify-content: space-between;
  border-radius: ${theme.spacings('xs')};
  background-color: ${theme.colors.backgroundRaised};
  ${({ primary }) =>
    primary
      ? css`
          color: ${theme.colors.textOnBackground};
          box-shadow: 0 0 0 1px
            ${getTheme(theme.colors.textOnBackground, (color) =>
              transparentize(0.7, color)
            )};
        `
      : css`
          color: ${getTheme(theme.colors.textOnBackground, (c) =>
            transparentize(0.5, c)
          )};
          box-shadow: 0 0 0 1px
            ${getTheme(theme.colors.textOnBackground, (color) =>
              transparentize(0.9, color)
            )};
        `}

  > :first-child {
    margin-right: ${theme.spacings('xs')};
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
const AnimatedTooltipContainer = styled(animated.div)<TooltipContainerProps>`
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
const AnimatedLine = animated.line;

type DataPoint = readonly [Date, number];

const getDate = (d: DataPoint) => d[0];
const getValue = (d: DataPoint) => d[1];
const bisectDate = bisector<DataPoint, Date>((d, x) => {
  const current = dayjs(d[0]);
  if (current.isBefore(x, 'date')) return -1;
  if (current.isSame(x, 'date')) return 0;
  return 1;
}).left;
const formatDate = (d: Date) => dayjs(d).format('YYYY-MM-DD');
const formatTooltipDate = (d: Date) => dayjs(d).format('YYYY-MM-DD ddd');

interface ChartProps {
  data?: DataPoint[];
  benchmark?: DataPoint[];
  syncTooltip?: TooltipSync;
  hideAxis?: boolean;
  hideTooltip?: boolean;
  className?: string;
  formatPercentage?: boolean;
  currency?: string;
  benchmarkLabel?: string;
}

function Chart({
  data,
  benchmark,
  syncTooltip,
  hideAxis,
  hideTooltip,
  className,
  formatPercentage,
  currency,
  benchmarkLabel,
}: ChartProps) {
  // bounds
  const [containerRef, { width = 400, height = 300 }] = useMeasure<
    HTMLDivElement
  >();
  const [leftAxisRef, leftAxisRect] = useMeasure<any>();
  const margin = {
    top: hideAxis ? 0 : 20,
    left: hideAxis ? 0 : leftAxisRect.width,
    bottom: hideAxis ? 0 : 30,
    right: 0,
  };
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(height - margin.top - margin.bottom, 0);

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [0, xMax],
        domain: extent(data ?? [], getDate) as [Date, Date],
      }),
    [data, xMax]
  );
  const valueScale = useMemo(() => {
    const minVal = min((data ?? []).concat(benchmark ?? []), getValue) ?? 0;
    const maxVal = max((data ?? []).concat(benchmark ?? []), getValue) ?? 0;
    const tooltipHeight = hideTooltip ? 0 : 40;
    const totalHeight = yMax + tooltipHeight * (benchmark ? 2 : 1);
    const paddingTop = (maxVal - minVal) * (tooltipHeight / totalHeight);
    const paddingBottom =
      (maxVal - minVal) * (benchmark ? tooltipHeight / totalHeight : 0);

    return scaleLinear({
      range: [yMax, 0],
      domain: [
        minVal - paddingBottom - (maxVal - minVal) * 0.1,
        maxVal + paddingTop + (maxVal - minVal) * 0.1,
      ],
      nice: true,
    });
  }, [benchmark, data, hideTooltip, yMax]);

  // tooltip handler
  const [tooltipRef, tooltipRect] = useMeasure<HTMLDivElement>();
  const [benchTooltipRef, benchTooltipRect] = useMeasure<HTMLDivElement>();
  const tooltipDateRef = useRef(new Date());
  const [tooltipProps, set] = useSpring(() => ({
    x: 0,
    opacity: 0,
    immediate: true,
    config: { restVelocity: 1, round: 0.1 },
  }));
  const getTooltipY = () => {
    if (!data) return 0;
    const x0 = tooltipDateRef.current;
    const index = bisectDate(data, x0);
    const d = data[index];
    if (!d) return 0;
    return valueScale(getValue(d));
  };
  const getTooltipBenchmarkY = () => {
    if (!benchmark) return 0;
    const x0 = tooltipDateRef.current;
    const index = bisectDate(benchmark, x0);
    const d = benchmark[index];
    if (!d) return 0;
    return valueScale(getValue(d));
  };
  const getTooltipValue = () => {
    if (!data) return 0;
    const x0 = tooltipDateRef.current;
    const index = bisectDate(data, x0);
    const d = data[index];
    if (!d) return 0;
    if (formatPercentage) {
      return `${(getValue(d) * 100).toFixed(1)}%`;
    }
    if (currency) {
      return formatCurrency(currency, getValue(d));
    }
    return getValue(d).toFixed(2);
  };
  const getTooltipBenchmark = () => {
    if (!benchmark) return 0;
    const x0 = tooltipDateRef.current;
    const index = bisectDate(benchmark, x0);
    const d = benchmark[index];
    if (!d) return 0;
    if (formatPercentage) {
      return `${(getValue(d) * 100).toFixed(1)}%`;
    }
    if (currency) {
      return formatCurrency(currency, getValue(d));
    }
    return getValue(d).toFixed(2);
  };
  const getTooltipDate = () => formatTooltipDate(tooltipDateRef.current);
  useEffect(() => {
    if (syncTooltip) {
      return syncTooltip.addListener(
        (date: Date) => {
          tooltipDateRef.current = date;
          const x = dateScale(date);
          if (x > xMax) {
            set({ x: xMax, opacity: 0, immediate: true });
          } else if (x < 0) {
            set({ x: 0, opacity: 0, immediate: true });
          } else {
            set({ x, opacity: 1, immediate: true });
          }
        },
        () => {
          set({ opacity: 0, immediate: true });
        }
      );
    }
  }, [dateScale, set, syncTooltip, xMax]);
  const handleTooltip = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (!data) return;
      const { x } = localPoint(event) || { x: 0 };
      const x0 = dateScale.invert(x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      if (!d) return 0;
      if (syncTooltip) {
        syncTooltip.show(getDate(d));
      } else {
        tooltipDateRef.current = getDate(d);
        set({
          x: dateScale(tooltipDateRef.current),
          opacity: 1,
          immediate: true,
        });
      }
    },
    [data, dateScale, margin.left, set, syncTooltip]
  );

  // Theme related styles
  const styledTheme = useTheme();
  const colors = useMemo(
    () => ({
      chartLine: theme.colors.callToActionText({
        theme: styledTheme,
      }),
      benchmarkLine: transparentize(
        0.4,
        theme.colors.textOnBackground({ theme: styledTheme })
      ),
      gridLine: transparentize(
        0.9,
        theme.colors.textOnBackground({ theme: styledTheme })
      ),
      text: transparentize(
        0.6,
        theme.colors.textOnBackground({ theme: styledTheme })
      ),
    }),
    [styledTheme]
  );
  const axisBottomTickLabelProps = {
    textAnchor: 'middle' as const,
    fontFamily: theme.fontFamily,
    fontSize: theme.fonts.helperSize,
    fill: colors.text,
  };
  const axisLeftTickLabelProps = {
    dx: '-0.25em',
    dy: '0.25em',
    textAnchor: 'end' as const,
    fontFamily: theme.fontFamily,
    fontSize: theme.fonts.helperSize,
    fill: colors.text,
  };

  const bottomTickValues = [];
  const bottomLeft = 50;
  const bottomRight = width - margin.left - margin.right - 50;
  const bottomStep =
    (bottomRight - bottomLeft) / Math.floor((bottomRight - bottomLeft) / 180) -
    1;
  for (let i = bottomLeft; i <= bottomRight; i += bottomStep) {
    bottomTickValues.push(dateScale.invert(i));
  }

  return (
    <Container ref={containerRef} className={className}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <LinearGradient
            id="area-gradient"
            from={colors.chartLine}
            fromOpacity={0.28}
            to={theme.colors.backgroundRaised({
              theme: styledTheme,
            })}
            toOffset="80%"
            toOpacity={0}
          />
          {!hideAxis && (
            <GridRows<number>
              scale={valueScale}
              width={xMax}
              stroke={colors.gridLine}
              pointerEvents="none"
              numTicks={5}
            />
          )}
          {data && (
            <>
              <AreaClosed<DataPoint>
                data={data}
                x={(d) => dateScale(getDate(d))}
                y={(d) => valueScale(getValue(d))}
                yScale={valueScale}
                fill="url(#area-gradient)"
                curve={curveMonotoneX}
              />
              <LinePath
                data={data}
                x={(d) => dateScale(getDate(d))}
                y={(d) => valueScale(getValue(d))}
                curve={curveMonotoneX}
                strokeWidth={2.5}
                stroke={colors.chartLine}
                strokeLinecap="round"
              />
            </>
          )}
          {benchmark && (
            <LinePath
              data={benchmark}
              x={(d) => dateScale(getDate(d))}
              y={(d) => valueScale(getValue(d))}
              curve={curveMonotoneX}
              strokeWidth={1.5}
              stroke={colors.benchmarkLine}
              strokeLinecap="round"
              strokeDasharray="1,2"
            />
          )}
          {!hideAxis && (
            <>
              <g ref={leftAxisRef}>
                <AxisLeft
                  scale={valueScale}
                  numTicks={5}
                  tickFormat={(v: number) => {
                    if (formatPercentage) {
                      return `${(v * 100).toFixed(0)}%`;
                    }
                    return v >= 100 || v <= -100 ? v.toFixed(0) : v.toFixed(2);
                  }}
                  stroke={colors.gridLine}
                  tickStroke={colors.gridLine}
                  tickLabelProps={() => axisLeftTickLabelProps}
                />
              </g>
              {!!data?.length && (
                <AxisBottom
                  top={yMax}
                  scale={dateScale}
                  tickFormat={formatDate}
                  tickValues={
                    bottomTickValues.length ? bottomTickValues : undefined
                  }
                  stroke={colors.gridLine}
                  tickStroke={colors.gridLine}
                  tickLabelProps={() => axisBottomTickLabelProps}
                />
              )}
            </>
          )}
          {!hideTooltip && (
            <>
              <Bar
                x={0}
                y={0}
                width={xMax}
                height={yMax}
                fill="transparent"
                onTouchStart={handleTooltip}
                onTouchMove={handleTooltip}
                onMouseMove={handleTooltip}
                onMouseLeave={() =>
                  syncTooltip
                    ? syncTooltip.hide()
                    : set({ opacity: 0, immediate: true })
                }
              />
              <g>
                <AnimatedLine
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={yMax}
                  fill="transparent"
                  stroke={colors.gridLine}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                  style={tooltipProps}
                />
                <animated.circle
                  cx={0}
                  cy={0}
                  r={5}
                  fill={colors.chartLine}
                  pointerEvents="none"
                  style={{
                    x: tooltipProps.x,
                    y: tooltipProps.x.to(getTooltipY),
                    opacity: tooltipProps.opacity,
                  }}
                />
                {benchmark && (
                  <animated.circle
                    cx={0}
                    cy={0}
                    r={3}
                    fill={colors.benchmarkLine}
                    pointerEvents="none"
                    style={{
                      x: tooltipProps.x,
                      y: tooltipProps.x.to(getTooltipBenchmarkY),
                      opacity: tooltipProps.opacity,
                    }}
                  />
                )}
              </g>
            </>
          )}
        </Group>
      </svg>
      {!hideTooltip && (
        <AnimatedTooltipContainer
          ref={tooltipRef}
          left={margin.left}
          top={margin.top + 1}
          style={{
            transform: 'translateX(-50%)',
            x: tooltipProps.x.to((xVal) => {
              const r = tooltipRect.width / 2;
              if (xVal >= xMax - r - 5) {
                return xMax - r - 5;
              }
              if (xVal <= r + 5) {
                return r + 5;
              }
              return xVal;
            }),
            opacity: tooltipProps.opacity,
          }}
        >
          <StyledTooltip primary>
            <animated.span style={{ minWidth: 130 }}>
              {tooltipProps.x.to(getTooltipDate)}
            </animated.span>
            <animated.span style={{ minWidth: 80 }}>
              {tooltipProps.x.to(getTooltipValue)}
            </animated.span>
          </StyledTooltip>
        </AnimatedTooltipContainer>
      )}
      {!hideTooltip && benchmark && (
        <AnimatedTooltipContainer
          ref={benchTooltipRef}
          left={margin.left}
          bottom={margin.bottom + 1}
          style={{
            transform: 'translateX(-50%)',
            x: tooltipProps.x.to((xVal) => {
              const r = benchTooltipRect.width / 2;
              if (xVal > xMax - r - 5) {
                return xMax - r - 5;
              }
              if (xVal <= r + 5) {
                return r + 5;
              }
              return xVal;
            }),
            opacity: tooltipProps.opacity,
          }}
        >
          <StyledTooltip>
            <animated.span>
              {benchmarkLabel ?? tooltipProps.x.to(getTooltipDate)}
            </animated.span>
            <animated.span>
              {tooltipProps.x.to(getTooltipBenchmark)}
            </animated.span>
          </StyledTooltip>
        </AnimatedTooltipContainer>
      )}
    </Container>
  );
}

export default Chart;
