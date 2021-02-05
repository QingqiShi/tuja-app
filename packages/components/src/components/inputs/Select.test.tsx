import { fireEvent, act } from '@testing-library/react';
import { render } from '../../testUtils';
import Select from './Select';

jest.useFakeTimers('modern');

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

test('use internal state', async () => {
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

test('render compact', async () => {
  const { getByRole } = render(<Select options={[]} compact />);
  expect(getByRole('combobox')).toHaveStyle('padding: 1rem 2rem 1rem 1.2rem;');
});

test('render disabled', async () => {
  const { getByRole } = render(<Select options={[]} disabled />);
  expect(getByRole('combobox')).toHaveStyle('opacity: 0.5;');
});
