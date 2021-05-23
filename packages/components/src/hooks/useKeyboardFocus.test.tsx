import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useKeyboardFocus, { KeyboardFocusProvider } from './useKeyboardFocus';

test('focus with mouse', () => {
  const handleFocus = jest.fn();
  const Component = () => {
    const [ref, isFocused] = useKeyboardFocus();
    return (
      <div>
        <input type="text" onFocus={handleFocus} ref={ref} />
        {isFocused ? 'keyboard focused' : 'not keyboard'}
      </div>
    );
  };
  const { getByRole, getByText } = render(
    <KeyboardFocusProvider>
      <Component />
    </KeyboardFocusProvider>
  );

  userEvent.click(getByRole('textbox'));

  expect(handleFocus).toHaveBeenCalled();
  expect(getByText('not keyboard')).toBeInTheDocument();
});

test('focus with keyboard', () => {
  const handleFocus = jest.fn();
  const Component = () => {
    const [ref, isFocused] = useKeyboardFocus();
    return (
      <div>
        <input type="text" onFocus={handleFocus} ref={ref} />
        {isFocused ? 'keyboard focused' : 'not keyboard'}
      </div>
    );
  };
  const { getByText } = render(
    <KeyboardFocusProvider>
      <Component />
    </KeyboardFocusProvider>
  );

  userEvent.tab();

  expect(handleFocus).toHaveBeenCalled();
  expect(getByText('keyboard focused')).toBeInTheDocument();

  userEvent.tab();
  expect(getByText('not keyboard')).toBeInTheDocument();
});

test('auto focus', () => {
  const Component = () => {
    const [ref, isFocused] = useKeyboardFocus(true);
    return (
      <div>
        <input type="text" ref={ref} />
        {isFocused ? 'keyboard focused' : 'not keyboard'}
      </div>
    );
  };
  const { getByText, rerender } = render(
    <KeyboardFocusProvider>
      <input />
    </KeyboardFocusProvider>
  );

  userEvent.tab();

  rerender(
    <KeyboardFocusProvider>
      <Component />
    </KeyboardFocusProvider>
  );

  expect(getByText('keyboard focused')).toBeInTheDocument();
});
