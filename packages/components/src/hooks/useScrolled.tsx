import { useRef } from 'react';
import { useIntersection } from 'react-use';
import styled from 'styled-components';

const ScrollEl = styled.div`
  position: relative;
  top: 100vh;
  left: 0;
  right: 0;
  height: 2px;
  pointer-events: none;
`;

function useScrolled() {
  const ref = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(ref, {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  });

  return {
    scrollEl: <ScrollEl ref={ref} />,
    hasScrolled:
      intersection?.isIntersecting ||
      (intersection?.boundingClientRect.top ?? 0) < 0,
  };
}

export default useScrolled;
