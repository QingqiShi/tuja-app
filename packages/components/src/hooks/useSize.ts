import { useMemo, useEffect, useState } from 'react';

export const defaultRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

function useSize(el: Element | null) {
  const [rect, setRect] = useState(defaultRect);

  const observer = useMemo(
    () =>
      new ResizeObserver((entries) => {
        if (entries[0]) {
          setRect(entries[0].contentRect);
        }
      }),
    []
  );

  useEffect(() => {
    if (!el) return;
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [el, observer]);

  return rect;
}

export default useSize;
