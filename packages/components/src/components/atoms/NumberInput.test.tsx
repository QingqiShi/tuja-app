import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import NumberInput from './NumberInput';

test('render label', () => {
  const { getByLabelText } = render(<NumberInput label="Test label" />);
  expect(getByLabelText('Test label')).toBeInTheDocument();
});

test('enter number', () => {
  const handleChange = jest.fn();
  const { getByLabelText } = render(
    <NumberInput label="Test" onChange={handleChange} />
  );
  fireEvent.change(getByLabelText('Test'), {
    target: { value: '123' },
  });
  expect(handleChange).toHaveBeenCalledWith(123);
});

test('format date and parse invalid dates', () => {
  const handleChange = jest.fn();
  const { getByLabelText } = render(
    <NumberInput label="Test" value={2.34} onChange={handleChange} />
  );
  expect(getByLabelText('Test')).toHaveValue('2.34');
  fireEvent.change(getByLabelText('Test'), {
    target: { value: 'abc' },
  });
  expect(getByLabelText('Test')).toHaveValue('2.34');
});
