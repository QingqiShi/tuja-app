import { render, fireEvent } from '@testing-library/react';
import DateRangeTabs from './DateRangeTabs';

test('render default', () => {
  const { getByText } = render(<DateRangeTabs />);

  expect(getByText('Max')).toBeInTheDocument();
  expect(getByText('Max')).toBeDisabled();
});

test('render date range options', () => {
  const handleChange = jest.fn();
  const { getByText } = render(
    <DateRangeTabs
      maxDate={new Date(1555332950299)}
      value={new Date(1607558400000)}
      onChange={handleChange}
    />
  );

  expect(getByText('1W')).toBeInTheDocument();
  expect(getByText('1M')).toBeInTheDocument();
  expect(getByText('3M')).toBeInTheDocument();
  expect(getByText('6M')).toBeInTheDocument();
  expect(getByText('1Y')).toBeInTheDocument();
  expect(getByText('Max')).toBeInTheDocument();

  expect(getByText('3M')).toBeDisabled();

  fireEvent.click(getByText('6M'));
  expect(handleChange).toHaveBeenCalledWith(new Date(1599692400000));
});
