import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import FormattedInput from './FormattedInput';

test('render as a TextInput', () => {
  const { getByLabelText, getByPlaceholderText, getByText } = render(
    <FormattedInput
      label="Email"
      placeholder="hi@example.com"
      helperText="We will never share your email address."
      type="email"
      required
    />
  );
  expect(getByLabelText(/Email/)).toBeInTheDocument();
  expect(
    getByText('We will never share your email address.')
  ).toBeInTheDocument();
  expect(getByPlaceholderText('hi@example.com')).toBeInTheDocument();
});

test('controlled TextInput', () => {
  const { getByLabelText } = render(
    <FormattedInput label="Test" value="1234" />
  );
  expect(getByLabelText('Test')).toHaveValue('1234');
});

test('parse value', () => {
  const handleChange = jest.fn();
  const { getByLabelText } = render(
    <FormattedInput
      label="Number"
      parse={(raw: string) => {
        const parsed = Number(raw);
        if (isNaN(parsed)) return null;
        return parsed;
      }}
      onChange={handleChange}
    />
  );
  fireEvent.change(getByLabelText('Number'), { target: { value: '5.4' } });
  expect(handleChange).toHaveBeenCalledWith(5.4);
});

test('format value', () => {
  const { getByLabelText } = render(
    <FormattedInput
      label="Number"
      value={12345}
      format={(x: number) => x.toString()}
    />
  );
  fireEvent.change(getByLabelText('Number'), { target: { value: '5.4' } });
  expect(getByLabelText('Number')).toHaveValue('12345');
});

test('blur out to reformat value', () => {
  const handleChange = jest.fn();
  const { getByLabelText } = render(
    <FormattedInput
      label="Number"
      parse={(raw: string) => {
        const parsed = Number(raw);
        if (isNaN(parsed)) return null;
        return parsed;
      }}
      format={(x: number) => x.toString()}
      value={5.4}
      onChange={handleChange}
    />
  );

  fireEvent.focus(getByLabelText('Number'));
  expect(getByLabelText('Number')).toHaveValue('5.4');
  fireEvent.change(getByLabelText('Number'), { target: { value: '5.4a' } });
  expect(handleChange).not.toHaveBeenCalled();
  expect(getByLabelText('Number')).toHaveValue('5.4a');
  fireEvent.blur(getByLabelText('Number'));
  expect(getByLabelText('Number')).toHaveValue('5.4');
});

test('focus callback', () => {
  const handleFocus = jest.fn();
  const { getByLabelText } = render(
    <FormattedInput label="Number" onFocus={handleFocus} />
  );
  fireEvent.focus(getByLabelText('Number'));
  expect(handleFocus).toHaveBeenCalled();
});

test('blur callback', () => {
  const handleBlur = jest.fn();
  const { getByLabelText } = render(
    <FormattedInput label="Number" onBlur={handleBlur} />
  );
  fireEvent.blur(getByLabelText('Number'));
  expect(handleBlur).toHaveBeenCalled();
});

test('blur out to reformat value', () => {
  const { getByLabelText } = render(
    <FormattedInput
      label="Number"
      parse={(raw: string) => {
        const parsed = Number(raw);
        if (isNaN(parsed)) return null;
        return parsed;
      }}
      format={(x: number) => x.toString()}
    />
  );

  fireEvent.focus(getByLabelText('Number'));
  fireEvent.change(getByLabelText('Number'), { target: { value: '5.4' } });
  fireEvent.blur(getByLabelText('Number'));
  expect(getByLabelText('Number')).toHaveValue('5.4');
});
