import { fireEvent, render } from '@testing-library/react';
import Cta from './Cta';

test('normal button', () => {
  const handleClick = jest.fn();
  const { getByText } = render(<Cta onClick={handleClick}>test</Cta>);
  expect(getByText('test').tagName).toBe('BUTTON');
  fireEvent.click(getByText('test'));
  expect(handleClick).toHaveBeenCalled();
});

test('button as an anchor tag', () => {
  const handleClick = jest.fn();
  const { getByText } = render(
    <Cta href="/test" onClick={handleClick}>
      test
    </Cta>
  );
  expect(getByText('test').tagName).toBe('A');
  expect(getByText('test')).toHaveAttribute('href', '/test');
  fireEvent.click(getByText('test'));
  expect(handleClick).toHaveBeenCalled();
  expect(handleClick.mock.calls[0][0].defaultPrevented).toBeTruthy();
});
