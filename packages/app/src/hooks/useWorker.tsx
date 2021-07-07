import { useEffect, useState } from 'react';

function useWorker(
  Worker: new () => Worker,
  { payload, skip }: { payload?: any; skip?: boolean }
) {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (skip) return;

    const worker = new Worker();

    const handler = (e: MessageEvent) => {
      const { data } = e ?? {};
      setResult(data);
      setIsLoading(false);
      worker.removeEventListener('message', handler);
    };

    worker.addEventListener('message', handler);
    worker.postMessage(payload);
    setIsLoading(true);

    return () => {
      try {
        worker.terminate();
        setIsLoading(false);
      } catch {}
    };
  }, [Worker, payload, skip]);

  return { result, isLoading };
}

export default useWorker;
