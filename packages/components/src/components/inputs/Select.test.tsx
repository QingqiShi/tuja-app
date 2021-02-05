import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import Select from './Select';

test('render label', async () => {
  const { getByLabelText } = render(<Select label="Test Label" options={[]} />);
  expect(getByLabelText('Test Label')).toBeInTheDocument();
});

test('render helper text', async () => {
  const { getByText } = render(
    <Select helperText="Test helper text" options={[]} />
  );
  expect(getByText('Test helper text')).toBeInTheDocument();
});

test('use internal state', () => {
  const { getByRole } = render(
    <Select
      options={[
        { label: 'Test', value: 'a' },
        { label: 'Test', value: 'b' },
      ]}
    />
  );
  fireEvent.change(getByRole('combobox'), { target: { value: 'b' } });
  expect(getByRole('combobox')).toHaveValue('b');
});

test('use external state', () => {
  const handleChange = jest.fn();
  const { getByRole } = render(
    <Select
      value="b"
      onChange={(e) => handleChange(e.target.value)}
      options={[
        { label: 'Test', value: 'a' },
        { label: 'Test', value: 'b' },
      ]}
    />
  );
  expect(getByRole('combobox')).toHaveValue('b');
  fireEvent.change(getByRole('combobox'), { target: { value: 'a' } });
  expect(handleChange).toHaveBeenCalledWith('a');
});

test('render compact', () => {
  const { getByRole } = render(<Select options={[]} compact />);
  expect(getByRole('combobox')).toHaveStyle('padding: 1rem 2rem 1rem 1.2rem;');
});

test('render disabled', () => {
  const { getByRole } = render(<Select options={[]} disabled />);
  expect(getByRole('combobox')).toHaveStyle('opacity: 0.5;');
});
