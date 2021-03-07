import { render } from '@testing-library/react';
import OverviewStats from './OverviewStats';

test('render stats', () => {
  const { getByText } = render(
    <OverviewStats value={1234} gain={123} returns={1.23} currency="GBP" />
  );
  expect(getByText('£1,234.00')).toBeInTheDocument();
  expect(getByText('+£123.00')).toBeInTheDocument();
  expect(getByText('(1.23%)')).toBeInTheDocument();
});

test('render negative values', () => {
  const { getByText } = render(
    <OverviewStats value={1234} gain={-123} returns={-1.23} currency="GBP" />
  );
  expect(getByText('£1,234.00')).toBeInTheDocument();
  expect(getByText('-£123.00')).toBeInTheDocument();
  expect(getByText('(1.23%)')).toBeInTheDocument();
});

test('render zero values', () => {
  const { getByText } = render(
    <OverviewStats value={1234} gain={0} returns={0} currency="GBP" />
  );
  expect(getByText('£1,234.00')).toBeInTheDocument();
  expect(getByText('£0.00')).toBeInTheDocument();
  expect(getByText('(0.00%)')).toBeInTheDocument();
});
