import { useLayoutEffect, useState } from 'react';
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';

/**
 * When `shouldLock` is set to `true`, lock body scroll. Returns a ref that
 * should be attached to the target element which will be allowed to scroll
 * while the body is locked.
 */
function useBodyScrollLock<T extends HTMLElement>(
  shouldLock: boolean
): (el: T) => void {
  const [targetRef, setTargetRef] = useState<T | null>(null);

  useLayoutEffect(() => {
    if (!targetRef) return;

    if (shouldLock) {
      disableBodyScroll(targetRef, {
        allowTouchMove: (el) => !!el.closest('.allow-scroll'),
      });
      return () => clearAllBodyScrollLocks();
    } else {
      enableBodyScroll(targetRef);
    }
  }, [shouldLock, targetRef]);

  return setTargetRef;
}

export default useBodyScrollLock;
