import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import useBodyScrollLock from './useBodyScrollLock';

jest.mock('body-scroll-lock', () => ({
  disableBodyScroll: jest.fn(),
  enableBodyScroll: jest.fn(),
  clearAllBodyScrollLocks: jest.fn(),
}));

test('disable body scroll', () => {
  const Component = () => {
    const [lock, setLock] = useState(false);
    const ref = useBodyScrollLock<HTMLDivElement>(lock);

    return (
      <div>
        <button onClick={() => setLock(true)}>lock</button>
        <div ref={ref}>content</div>
      </div>
    );
  };

  const { getByText } = render(<Component />);
  expect(disableBodyScroll as jest.Mock).not.toHaveBeenCalled();

  fireEvent.click(getByText('lock'));
  expect(disableBodyScroll as jest.Mock).toHaveBeenCalledWith(
    getByText('content'),
    { allowTouchMove: expect.any(Function) }
  );
});

test('enable body scroll', () => {
  const Component = () => {
    const [lock, setLock] = useState(true);
    const ref = useBodyScrollLock<HTMLDivElement>(lock);

    return (
      <div>
        <button onClick={() => setLock(false)}>unlock</button>
        <div ref={ref}>content</div>
      </div>
    );
  };

  const { getByText } = render(<Component />);
  expect(disableBodyScroll as jest.Mock).toHaveBeenCalled();

  fireEvent.click(getByText('unlock'));
  expect(enableBodyScroll as jest.Mock).toHaveBeenCalledWith(
    getByText('content')
  );
});
