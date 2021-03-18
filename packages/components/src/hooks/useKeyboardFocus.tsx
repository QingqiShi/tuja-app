import { useContext, useState, useEffect, useRef, createContext } from 'react';

const KeyboardFocusContext = createContext({
  allowTabFocus: { current: false },
});

export function KeyboardFocusProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const allowTabFocus = useRef(false);

  useEffect(() => {
    const handleKeydown = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Tab') {
        allowTabFocus.current = true;
      }
    };
    const handleMouseDown = () => {
      allowTabFocus.current = false;
    };

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  return (
    <KeyboardFocusContext.Provider value={{ allowTabFocus }}>
      {children}
    </KeyboardFocusContext.Provider>
  );
}

function useKeyboardFocus(autoFocus?: boolean) {
  const [ref, setRef] = useState<HTMLAnchorElement | HTMLButtonElement | null>(
    null
  );
  const { allowTabFocus } = useContext(KeyboardFocusContext);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!ref) return;

    if (allowTabFocus.current && autoFocus) {
      setIsFocused(true);
    }

    const handleFocus = () => {
      if (allowTabFocus.current) {
        setIsFocused(true);
      }
    };
    const handleBlur = () => {
      setIsFocused(false);
    };

    ref.addEventListener('focus', handleFocus);
    ref.addEventListener('blur', handleBlur);
    return () => {
      ref.removeEventListener('focus', handleFocus);
      ref.removeEventListener('blur', handleBlur);
    };
  }, [allowTabFocus, autoFocus, ref]);

  return [setRef, isFocused] as const;
}

export default useKeyboardFocus;
