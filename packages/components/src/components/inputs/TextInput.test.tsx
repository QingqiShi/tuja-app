import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import TextInput from './TextInput';

test('render label', () => {
  const { getByLabelText } = render(<TextInput label="Test Label" />);
  expect(getByLabelText('Test Label')).toBeInTheDocument();
});

test('render helper text', () => {
  const { getByText } = render(<TextInput helperText="Test helper text" />);
  expect(getByText('Test helper text')).toBeInTheDocument();
});

test('use internal state', () => {
  const { getByRole } = render(<TextInput />);
  fireEvent.change(getByRole('textbox'), { target: { value: 'hello' } });
  expect(getByRole('textbox')).toHaveValue('hello');
});

test('use external state', () => {
  const handleChange = jest.fn();
  const { getByRole } = render(
    <TextInput value="yo yo" onChange={(e) => handleChange(e.target.value)} />
  );
  expect(getByRole('textbox')).toHaveValue('yo yo');
  fireEvent.change(getByRole('textbox'), { target: { value: 'hihi' } });
  expect(handleChange).toHaveBeenCalledWith('hihi');
});

test('render lead icon without label', () => {
  const { getByText } = render(<TextInput leadIcon={<span>icon</span>} />);
  expect(getByText('icon')).toBeInTheDocument();
});

test('render lead icon with label', () => {
  const { getByText } = render(
    <TextInput label="Test" leadIcon={<span>icon</span>} />
  );
  expect(getByText('icon')).toBeInTheDocument();
});

test('render trailing icon without label', () => {
  const { getByText } = render(<TextInput endIcon={<span>icon</span>} />);
  expect(getByText('icon')).toBeInTheDocument();
});

test('render trailing icon with label', () => {
  const { getByText } = render(
    <TextInput label="Test" endIcon={<span>icon</span>} />
  );
  expect(getByText('icon')).toBeInTheDocument();
});
