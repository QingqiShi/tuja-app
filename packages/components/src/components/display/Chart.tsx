import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useMeasure } from 'react-use';
import styled, { css, useTheme } from 'styled-components';
import { transparentize } from 'polished';
import { LinearGradient } from '@visx/gradient';
import { AreaClosed, LinePath, Bar } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { localPoint } from '@visx/event';
import { max, min, extent, bisector } from 'd3-array';
import dayjs from 'dayjs';

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
  padding: ${({ theme }) => theme.spacings.xs};
  pointer-events: none;
  position: absolute;
  min-width: 200px;
  text-align: center;
  position: static;
  display: flex;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.spacings.xs};
  background-color: ${({ theme }) => theme.colors.backgroundRaised};
  ${({ primary, theme }) =>
    primary
      ? css`
          color: ${theme.colors.textOnBackground};
          box-shadow: 0 0 0 1px
            ${transparentize(0.7, theme.colors.textOnBackground)};
        `
      : css`
          color: ${transparentize(0.5, theme.colors.textOnBackground)};
          box-shadow: 0 0 0 1px
            ${transparentize(0.9, theme.colors.textOnBackground)};
        `}

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

const getDate = (d: DataPoint) => d[0];
const getValue = (d: DataPoint) => d[1];
const bisectDate = bisector<DataPoint, Date>((d, x) => {
  const current = dayjs(d[0]);
  if (current.isBefore(x, 'date')) return -1;
  if (current.isSame(x, 'date')) return 0;
  return 1;
}).left;
const axisDateFormat = 'YYYY-MM-DD';
const formatTooltipDate = (d: Date) => dayjs(d).format('YYYY-MM-DD ddd');

interface ChartProps {
  data?: DataPoint[];
  benchmark?: DataPoint[];
  hideAxis?: boolean;
  hideTooltip?: boolean;
  className?: string;
  benchmarkLabel?: string;
  formatValue?: (val: number) => string;
}

function Chart({
  data,
  benchmark,
  hideAxis,
  hideTooltip,
  className,
  benchmarkLabel,
  formatValue,
}: ChartProps) {
  // bounds
  const [
    containerRef,
    { width = 400, height = 300 },
  ] = useMeasure<HTMLDivElement>();
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
        range: [0, xMax - 1],
        domain: extent(data ?? [], getDate) as [Date, Date],
      }),
    [data, xMax]
  );
  const valueScale = useMemo(() => {
    const minVal = min((data ?? []).concat(benchmark ?? []), getValue) ?? 0;
    const maxVal = max((data ?? []).concat(benchmark ?? []), getValue) ?? 0;
    const tooltipHeight = hideTooltip ? 0 : 40;
    const totalHeight = yMax + tooltipHeight * (benchmark ? 2 : 1) || 1;
    const paddingTop = (maxVal - minVal) * (tooltipHeight / totalHeight);
    const paddingBottom =
      (maxVal - minVal) * (benchmark ? tooltipHeight / totalHeight : 0);

    return scaleLinear({
      range: [yMax || 10, 0],
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
  const tooltipLineRef = useRef<SVGLineElement>(null);
  const tooltipDotRef = useRef<SVGCircleElement>(null);
  const tooltipBenchDotRef = useRef<SVGCircleElement>(null);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const tooltipBenchContainerRef = useRef<HTMLDivElement>(null);
  const tooltipDateSpanRef = useRef<HTMLSpanElement>(null);
  const tooltipValueSpanRef = useRef<HTMLSpanElement>(null);
  const tooltipBenchLabelSpanRef = useRef<HTMLSpanElement>(null);
  const tooltipBenchSpanRef = useRef<HTMLSpanElement>(null);

  const setTooltipStylesRef = useRef(
    (
      x: number,
      dataY: number,
      benchmarkY: number,
      date: Date,
      dataValue: number,
      benchmarkValue: number,
      {
        xMax,
        tooltipRect,
        benchTooltipRect,
        benchmarkLabel,
        formatValue,
      }: {
        xMax: number;
        tooltipRect: ReturnType<typeof useMeasure>[1];
        benchTooltipRect: ReturnType<typeof useMeasure>[1];
        benchmarkLabel?: string;
        formatValue?: (val: number) => string;
      }
    ) => {
      if (tooltipLineRef.current) {
        tooltipLineRef.current.style.opacity = '1';
        tooltipLineRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      if (tooltipDotRef.current) {
        tooltipDotRef.current.style.opacity = '1';
        tooltipDotRef.current.style.transform = `translate3d(${x}px, ${dataY}px, 0)`;
      }
      if (tooltipBenchDotRef.current) {
        tooltipBenchDotRef.current.style.opacity = '1';
        tooltipBenchDotRef.current.style.transform = `translate3d(${x}px, ${benchmarkY}px, 0)`;
      }
      if (tooltipContainerRef.current) {
        const w = tooltipRect.width;
        const r = w / 2;
        let tooltipX = x - r;
        if (x >= xMax - 5 - r) tooltipX = xMax - 5 - w;
        if (x <= r + 5) tooltipX = 5;
        tooltipContainerRef.current.style.opacity = '1';
        tooltipContainerRef.current.style.transform = `translate3d(${tooltipX}px, 0, 0)`;
      }
      if (benchTooltipRect.width && tooltipBenchContainerRef.current) {
        const w = benchTooltipRect.width;
        const r = w / 2;
        let tooltipX = x - r;
        if (x >= xMax - 5 - r) tooltipX = xMax - 5 - w;
        if (x <= r + 5) tooltipX = 5;
        tooltipBenchContainerRef.current.style.opacity = '1';
        tooltipBenchContainerRef.current.style.transform = `translate3d(${tooltipX}px, 0, 0)`;
      }
      if (tooltipDateSpanRef.current) {
        tooltipDateSpanRef.current.innerText = formatTooltipDate(date);
      }
      if (tooltipValueSpanRef.current) {
        tooltipValueSpanRef.current.innerText = formatValue
          ? formatValue(dataValue)
          : dataValue.toFixed(2);
      }
      if (benchTooltipRect.width && tooltipBenchLabelSpanRef.current) {
        tooltipBenchLabelSpanRef.current.innerText =
          benchmarkLabel ?? formatTooltipDate(date);
      }
      if (benchTooltipRect.width && tooltipBenchSpanRef.current) {
        tooltipBenchSpanRef.current.innerText = formatValue
          ? formatValue(benchmarkValue)
          : benchmarkValue.toFixed(2);
      }
    }
  );
  const clearTooltip = () => {
    if (tooltipLineRef.current) {
      tooltipLineRef.current.style.opacity = '0';
    }
    if (tooltipDotRef.current) {
      tooltipDotRef.current.style.opacity = '0';
    }
    if (tooltipBenchDotRef.current) {
      tooltipBenchDotRef.current.style.opacity = '0';
    }
    if (tooltipContainerRef.current) {
      tooltipContainerRef.current.style.opacity = '0';
    }
    if (tooltipBenchContainerRef.current) {
      tooltipBenchContainerRef.current.style.opacity = '0';
    }
  };
  useEffect(() => {
    clearTooltip();
  }, []);

  const handleTooltip = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (!data) return;
      const { x } = localPoint(event) || { x: 0 };
      const x0 = dateScale.invert(x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      const d2 = data[index + 1];
      let d = d0;
      if (
        d1 &&
        getDate(d1) &&
        x0.valueOf() - getDate(d).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
      ) {
        d = d1;
      }
      if (
        d2 &&
        getDate(d2) &&
        x0.valueOf() - getDate(d).valueOf() >=
          getDate(d2).valueOf() - x0.valueOf()
      ) {
        d = d2;
      }
      if (!d) return 0;

      const date = getDate(d);
      const dataIndex = bisectDate(data, date);
      const dataPoint = data[dataIndex];
      const dataValue = dataPoint && getValue(dataPoint);
      const benchmarkIndex = bisectDate(benchmark ?? [], date);
      const benchmarkPoint = (benchmark ?? [])[benchmarkIndex];
      const benchmarkValue = benchmarkPoint && getValue(benchmarkPoint);
      setTooltipStylesRef.current?.(
        dateScale(date) ?? 0,
        valueScale(dataValue ?? 0) ?? 0,
        valueScale(benchmarkValue ?? 0) ?? 0,
        date,
        dataValue ?? 0,
        benchmarkValue ?? 0,
        { xMax, tooltipRect, benchTooltipRect, benchmarkLabel, formatValue }
      );
    },
    [
      benchTooltipRect,
      benchmark,
      benchmarkLabel,
      data,
      dateScale,
      formatValue,
      margin.left,
      tooltipRect,
      valueScale,
      xMax,
    ]
  );

  // Theme related styles
  const theme = useTheme();
  const colors = {
    chartLine: theme.colors.callToActionText,
    benchmarkLine: transparentize(0.4, theme.colors.textOnBackground),
    gridLine: transparentize(0.9, theme.colors.textOnBackground),
    text: transparentize(0.6, theme.colors.textOnBackground),
    chartGradientTo: theme.colors.backgroundRaised,
  };
  const axisBottomTickLabelProps = {
    textAnchor: 'middle' as const,
    fontFamily: theme.fontFamily,
    fontSize: theme.fonts.helper.size,
    fill: colors.text,
  };
  const axisLeftTickLabelProps = {
    dx: '-0.25em',
    dy: '0.25em',
    textAnchor: 'end' as const,
    fontFamily: theme.fontFamily,
    fontSize: theme.fonts.helper.size,
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
            to={colors.chartGradientTo}
            toOpacity={0}
            toOffset="80%"
          />
          {!hideAxis && (
            <GridRows
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
                x={(d) => dateScale(getDate(d)) || 0}
                y={(d) => valueScale(getValue(d)) || 0}
                yScale={valueScale}
                fill="url(#area-gradient)"
                curve={curveMonotoneX}
              />
              <LinePath
                data={data}
                x={(d) => dateScale(getDate(d)) || 0}
                y={(d) => valueScale(getValue(d)) || 0}
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
              x={(d) => dateScale(getDate(d)) || 0}
              y={(d) => valueScale(getValue(d)) || 0}
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
                  tickFormat={(v) => {
                    const value = typeof v === 'number' ? v : v.valueOf();
                    if (formatValue) return formatValue(value);
                    return value >= 100 || value <= -100
                      ? value.toFixed(0)
                      : value.toFixed(2);
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
                  tickFormat={(d) =>
                    dayjs(d instanceof Date ? d : d.valueOf()).format(
                      axisDateFormat
                    )
                  }
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
                onMouseLeave={clearTooltip}
              />
              <g>
                <line
                  ref={tooltipLineRef}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={yMax}
                  fill="transparent"
                  stroke={colors.gridLine}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                <circle
                  ref={tooltipDotRef}
                  cx={0}
                  cy={0}
                  r={5}
                  fill={colors.chartLine}
                  pointerEvents="none"
                />
                {benchmark && (
                  <circle
                    ref={tooltipBenchDotRef}
                    cx={0}
                    cy={0}
                    r={3}
                    fill={colors.benchmarkLine}
                    pointerEvents="none"
                  />
                )}
              </g>
            </>
          )}
        </Group>
      </svg>
      {!hideTooltip && (
        <TooltipContainer
          ref={tooltipContainerRef}
          left={margin.left}
          top={margin.top + 1}
        >
          <div ref={tooltipRef}>
            <StyledTooltip primary>
              <span ref={tooltipDateSpanRef} style={{ minWidth: 130 }} />
              <span ref={tooltipValueSpanRef} style={{ minWidth: 80 }}>
                0
              </span>
            </StyledTooltip>
          </div>
        </TooltipContainer>
      )}
      {!hideTooltip && benchmark && (
        <TooltipContainer
          ref={tooltipBenchContainerRef}
          left={margin.left}
          bottom={margin.bottom + 1}
        >
          <div ref={benchTooltipRef}>
            <StyledTooltip>
              <span ref={tooltipBenchLabelSpanRef} />
              <span ref={tooltipBenchSpanRef}>0</span>
            </StyledTooltip>
          </div>
        </TooltipContainer>
      )}
    </Container>
  );
}

export default Chart;
