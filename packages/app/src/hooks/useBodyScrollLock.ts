import { useRef, useLayoutEffect } from 'react';
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';

function useBodyScrollLock(shouldLock: boolean) {
  const targetRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (!targetRef.current) return;

    if (shouldLock) {
      disableBodyScroll(targetRef.current);
      return () => clearAllBodyScrollLocks();
    } else {
      enableBodyScroll(targetRef.current);
    }
  }, [shouldLock]);

  return targetRef;
}

export default useBodyScrollLock;
