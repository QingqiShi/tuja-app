import { fireEvent } from '@testing-library/react';
import { render } from '../../testUtils';
import ButtonTertiary from './ButtonTertiary';

test('normal button', () => {
  const handleClick = jest.fn();
  const { getByText } = render(
    <ButtonTertiary onClick={handleClick}>test</ButtonTertiary>
  );
  expect(getByText('test').tagName).toBe('BUTTON');
  fireEvent.click(getByText('test'));
  expect(handleClick).toHaveBeenCalled();
});

test('button as an anchor tag', () => {
  const handleClick = jest.fn();
  const { getByText } = render(
    <ButtonTertiary href="/test" onClick={handleClick}>
      test
    </ButtonTertiary>
  );
  expect(getByText('test').tagName).toBe('A');
  expect(getByText('test')).toHaveAttribute('href', '/test');
  fireEvent.click(getByText('test'));
  expect(handleClick).toHaveBeenCalled();
  expect(handleClick.mock.calls[0][0].defaultPrevented).toBeTruthy();
});
