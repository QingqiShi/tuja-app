import { renderHook } from '@testing-library/react-hooks';
import { mockResizeObserver } from '../testUtils';
import useSize from './useSize';

const mockResize = mockResizeObserver();

test('return rect for provide element', () => {
  const el = document.createElement('div');
  const { result } = renderHook(() => useSize(el));
  expect(result.current.width).toBe(0);

  mockResize(el, { width: 500 });
  expect(result.current.width).toBe(500);
});

test('ignore null element', () => {
  const { result } = renderHook(() => useSize(null));

  mockResize(null as any, { width: 500 });
  expect(result.current.width).toBe(0);
});
