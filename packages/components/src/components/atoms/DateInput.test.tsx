import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import DateInput from './DateInput';

test('render label', () => {
  const { getByLabelText } = render(<DateInput label="Test label" />);
  expect(getByLabelText('Test label')).toBeInTheDocument();
});

test('enter dates', () => {
  const { getByPlaceholderText } = render(<DateInput />);
  fireEvent.change(getByPlaceholderText('YYYY-MM-DD'), {
    target: { value: '2020-02-01' },
  });
  expect(getByPlaceholderText('YYYY-MM-DD')).toHaveValue('2020-02-01');
});

test('format date and parse invalid dates', () => {
  const handleChange = jest.fn();
  const { getByLabelText } = render(
    <DateInput
      label="Date"
      value={new Date(1612223485568)}
      onChange={handleChange}
    />
  );
  expect(getByLabelText('Date')).toHaveValue('2021-02-01');
  fireEvent.change(getByLabelText('Date'), {
    target: { value: '2021-02-01blah' },
  });
  expect(getByLabelText('Date')).toHaveValue('2021-02-01');
});
