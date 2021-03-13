import { render, fireEvent } from '@testing-library/react';
import AllocationOverview from './AllocationOverview';

test('render segments', () => {
  const { getByText, getByTestId } = render(
    <AllocationOverview
      currency="GBP"
      cash={80}
      holdings={{ 'AAPL.US': { value: 200 }, 'IUSA.LSE': { value: 120 } }}
    />
  );

  expect(getByTestId('segment-AAPL.US')).toHaveStyle('width: 50.00%');
  expect(getByTestId('segment-IUSA.LSE')).toHaveStyle('width: 30.00%');
  expect(getByTestId('segment-Cash')).toHaveStyle('width: 20.00%');

  expect(getByText('2 investments')).toBeInTheDocument();
  expect(getByText('£320.00')).toBeInTheDocument();
  expect(getByText('+ £80.00 cash')).toBeInTheDocument();
});

test('hover over segments to show details', () => {
  const { getByText, getByTestId, queryByText } = render(
    <AllocationOverview
      currency="GBP"
      cash={80}
      holdings={{ 'AAPL.US': { value: 200 }, 'IUSA.LSE': { value: 120 } }}
    />
  );

  fireEvent.mouseEnter(getByTestId('segment-AAPL.US'));

  expect(queryByText('2 investments')).toBeNull();
  expect(getByText('AAPL.US')).toBeInTheDocument();
  expect(getByText('£200.00 (50.00%)')).toBeInTheDocument();

  fireEvent.mouseOut(getByTestId('segment-AAPL.US'));

  expect(queryByText('AAPL.US')).toBeNull();
  expect(getByText('2 investments')).toBeInTheDocument();
});
