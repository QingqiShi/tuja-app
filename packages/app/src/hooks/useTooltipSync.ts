import { useRef, useCallback } from 'react';

function useTooltipSync() {
  const listeners = useRef<
    {
      showCallback: (date: Date) => void;
      hideCallback: () => void;
    }[]
  >([]);

  const addListener = useCallback(
    (showCallback: (date: Date) => void, hideCallback: () => void) => {
      const listener = { showCallback, hideCallback };
      listeners.current.push(listener);
      return () => {
        const index = listeners.current.indexOf(listener);
        if (index >= 0) {
          listeners.current.splice(index, 1);
        }
      };
    },
    []
  );

  const show = useCallback((date: Date) => {
    listeners.current.forEach(({ showCallback }) => {
      showCallback(date);
    });
  }, []);

  const hide = useCallback(() => {
    listeners.current.forEach(({ hideCallback }) => {
      hideCallback();
    });
  }, []);

  return { addListener, show, hide };
}

export default useTooltipSync;

export type TooltipSync = ReturnType<typeof useTooltipSync>;
