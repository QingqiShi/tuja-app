import { render, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import DateRangeTabs from './DateRangeTabs';

test('render default', () => {
  const { getByText } = render(<DateRangeTabs />);

  expect(getByText('Max')).toBeInTheDocument();
  expect(getByText('Max')).toBeDisabled();
});

test('render date range options', () => {
  const handleChange = jest.fn();

  const threeMonth = dayjs().subtract(3, 'month');

  const { getByText } = render(
    <DateRangeTabs
      maxDate={new Date(1555332950299)}
      value={threeMonth.toDate()}
      onChange={handleChange}
    />
  );

  expect(getByText('1M')).toBeInTheDocument();
  expect(getByText('3M')).toBeInTheDocument();
  expect(getByText('6M')).toBeInTheDocument();
  expect(getByText('1Y')).toBeInTheDocument();
  expect(getByText('Max')).toBeInTheDocument();

  expect(getByText('3M')).toBeDisabled();

  fireEvent.click(getByText('6M'));
  const FORMAT = 'YYYY-MM-DD';
  const sixMonth = dayjs(dayjs().format(FORMAT), FORMAT).subtract(6, 'month');
  expect(handleChange).toHaveBeenCalledWith(sixMonth.toDate());
});
