import { renderHook } from '@testing-library/react-hooks';
import useWorker from './useWorker';
import Worker from './__mocks__/test.worker?worker';

test('run worker', async () => {
  const { result, waitFor } = renderHook(() =>
    useWorker(Worker, { payload: 5 })
  );

  await waitFor(() => {
    expect(result.current).toBe(5 * 4 * 3 * 2);
  });
});

test('skip worker', async () => {
  const { result, waitFor } = renderHook(() =>
    useWorker(Worker, { payload: 5, skip: true })
  );

  await waitFor(() => {
    expect(result.current).toBeNull();
  });
});
