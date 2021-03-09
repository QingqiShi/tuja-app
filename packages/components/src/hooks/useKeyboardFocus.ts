import { useState, useEffect } from 'react';

function useKeyboardFocus() {
  const [ref, setRef] = useState<HTMLAnchorElement | HTMLButtonElement | null>(
    null
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!ref) return;

    let allowTabFocus = false;
    const handleKeydown = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Tab') {
        allowTabFocus = true;
      }
    };
    const handleFocus = () => {
      if (allowTabFocus) {
        setIsFocused(true);
      }
    };
    const handleBlur = () => {
      allowTabFocus = false;
      setIsFocused(false);
    };
    const handleMouseDown = () => {
      allowTabFocus = false;
      setIsFocused(false);
    };

    window.addEventListener('keydown', handleKeydown);
    ref.addEventListener('focus', handleFocus);
    ref.addEventListener('blur', handleBlur);
    ref.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      ref.removeEventListener('focus', handleFocus);
      ref.removeEventListener('blur', handleBlur);
      ref.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ref]);

  return [setRef, isFocused] as const;
}

export default useKeyboardFocus;
