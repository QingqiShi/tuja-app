import { useEffect, useState } from 'react';

function useWorker(
  Worker: new () => Worker,
  { payload, skip }: { payload?: any; skip?: boolean }
) {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (skip) return;

    const worker = new Worker();

    const handler = (e: MessageEvent) => {
      const { data } = e ?? {};
      setResult(data);
      worker.removeEventListener('message', handler);
    };

    worker.addEventListener('message', handler);
    worker.postMessage(payload);

    return () => {
      try {
        worker.terminate();
      } catch {}
    };
  }, [Worker, payload, skip]);

  return result;
}

export default useWorker;
