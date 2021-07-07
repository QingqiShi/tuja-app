import { renderHook } from '@testing-library/react-hooks';
import useWorker from './useWorker';
import Worker from './__mocks__/test.worker?worker';

test('run worker', async () => {
  const { result, waitFor } = renderHook(() =>
    useWorker(Worker, { payload: 5 })
  );

  expect(result.current.isLoading).toBeTruthy();
  await waitFor(() => {
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.result).toBe(5 * 4 * 3 * 2);
  });
});

test('skip worker', async () => {
  const { result, waitFor } = renderHook(() =>
    useWorker(Worker, { payload: 5, skip: true })
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.result).toBeNull();
  });
});
