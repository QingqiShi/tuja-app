import { useEffect } from 'react';

function useScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

export default useScrollToTopOnMount;
