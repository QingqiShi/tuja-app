import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import Chart from './Chart';

test('render line chart', async () => {
  const { getByTestId, getByText, queryByText } = render(
    <Chart
      data={[
        [new Date(1612558309355), 12],
        [new Date(1612644733880), 24],
      ]}
    />
  );

  fireEvent.mouseMove(getByTestId('chart-tooltip-events'));
  expect(getByText('2021-02-05 Fri')).toBeVisible();
  expect(getByText('12.00')).toBeVisible();

  fireEvent.mouseLeave(getByTestId('chart-tooltip-events'));
  expect(queryByText('12.00')).not.toBeVisible();
});

test('render with benchmark', async () => {
  const { getByTestId, getByText, queryByText } = render(
    <Chart
      data={[
        [new Date(1612558309355), 12],
        [new Date(1612644733880), 24],
      ]}
      benchmark={[
        [new Date(1612558309355), 56],
        [new Date(1612644733880), 78],
      ]}
      benchmarkLabel="Benchmark"
    />
  );

  fireEvent.touchStart(getByTestId('chart-tooltip-events'));
  expect(getByText('Benchmark')).toBeVisible();
  expect(getByText('2021-02-05 Fri')).toBeVisible();
  expect(getByText('56.00')).toBeVisible();

  fireEvent.touchEnd(getByTestId('chart-tooltip-events'));
  expect(queryByText('56.00')).not.toBeVisible();
});
