import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockResizeObserver } from '../../testUtils';
import Histogram from './Histogram';

mockResizeObserver();

const data = [
  10.83, -5.3, 16.31, 10.35, 8.84, 12.25, 12.72, 18.29, 16.54, 17.89, 2.3,
  16.56, 3.16, 23.27, 2.3, 9.67, 7.3, 3.88, 1.5, 6.57, -2.82, 16.96, 1.65,
  13.21, 6.93, 12.07, 1.7, -2.92, 10.26, 3.63, -4.18, 3.04, 3.32, 2.9, 0.25,
  11.11, 4.38, 11.55, 13.34, -2.59,
];

test('render', () => {
  const { getAllByTestId } = render(<Histogram data={data} />);
  expect(getAllByTestId('histogram-bar')).toHaveLength(10);
});

test('customise bin count', () => {
  const { getAllByTestId } = render(<Histogram data={data} binCount={4} />);
  expect(getAllByTestId('histogram-bar')).toHaveLength(5);
});

test('customise bin count', () => {
  const { getAllByTestId } = render(<Histogram data={data} binCount={4} />);
  expect(getAllByTestId('histogram-bar')).toHaveLength(5);
});

test('customise min max', () => {
  const { getAllByTestId } = render(
    <Histogram data={data} xMin={-50} xMax={50} yMax={0.6} />
  );
  expect(getAllByTestId('histogram-bar')).toHaveLength(4);
});

test('hover over bars to reveal frequency', () => {
  const { getAllByTestId, getByText, queryByText } = render(
    <Histogram data={data} />
  );

  userEvent.hover(getAllByTestId('histogram-bar')[1]);
  expect(getByText('3%')).toBeInTheDocument();

  userEvent.unhover(getAllByTestId('histogram-bar')[1]);
  expect(queryByText('3%')).toBeNull();
});

test('touch over bars to reveal frequency', () => {
  const { getAllByTestId, getByText, queryByText } = render(
    <Histogram data={data} />
  );

  fireEvent.touchStart(getAllByTestId('histogram-bar')[1]);
  expect(getByText('3%')).toBeInTheDocument();

  fireEvent.touchEnd(getAllByTestId('histogram-bar')[1]);
  expect(queryByText('3%')).toBeNull();
});
