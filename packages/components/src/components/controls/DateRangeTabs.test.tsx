import { render, fireEvent } from '@testing-library/react';
import DateRangeTabs from './DateRangeTabs';

test('render default', () => {
  const { getByText } = render(<DateRangeTabs />);

  expect(getByText('Max')).toBeInTheDocument();
  expect(getByText('Max')).toBeDisabled();
});

test('render date range options', () => {
  const handleChange = jest.fn();

  const threeMonth = new Date();
  threeMonth.setMonth(threeMonth.getMonth() - 3);
  threeMonth.setHours(0);
  threeMonth.setMinutes(0);
  threeMonth.setSeconds(0);
  threeMonth.setMilliseconds(0);

  const { getByText } = render(
    <DateRangeTabs
      maxDate={new Date(1555332950299)}
      value={threeMonth}
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
  const sixMonth = new Date();
  sixMonth.setMonth(sixMonth.getMonth() - 6);
  sixMonth.setHours(0);
  sixMonth.setMinutes(0);
  sixMonth.setSeconds(0);
  sixMonth.setMilliseconds(0);
  expect(handleChange).toHaveBeenCalledWith(sixMonth);
});
