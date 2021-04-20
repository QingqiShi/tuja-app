import { useRef } from 'react';
import { useIntersection } from 'react-use';
import styled, { css } from 'styled-components';
import { v } from '../../theme';
import Logo from '../atoms/Logo';
import EdgePadding from '../layout/EdgePadding';

const Container = styled.div`
  --header-height: 3rem;

  @media (${v.minTablet}) {
    --header-height: 4rem;
  }

  @media (${v.minLaptop}) {
    --header-height: 4.5rem;
  }

  height: var(--header-height, 5rem);
`;

const FixedHeader = styled.div<{ hasScrolled?: boolean }>`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: var(--header-height, 5rem);
  backdrop-filter: blur(${v.spacerS});
  transition: background-color 0.2s, box-shadow 0.2s;
  z-index: ${v.zFixed};

  ${({ hasScrolled }) =>
    hasScrolled &&
    css`
      background-color: ${v.backgroundTranslucent};
      box-shadow: ${v.shadowOverlay};
    `}
`;

const Layout = styled(EdgePadding)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;

  > :first-child {
    flex-grow: 1;
  }
`;

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const ScrollEl = styled.div`
  position: relative;
  top: 100vh;
  left: 0;
  right: 0;
  height: 2px;
  pointer-events: none;
`;

/**
 * Returns a `scrollRef` to be attached to any element. When the element has
 * been scrolled from below the screen to above, `hasScrolled` will be set to `true`.
 */
function useScrolled() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(scrollRef, {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  });

  return {
    scrollRef,
    hasScrolled:
      intersection?.isIntersecting ||
      (intersection?.boundingClientRect.top ?? 0) < 0,
  };
}

interface HeaderProps {
  logoHref: string;
  navigation?: React.ReactNode;
  onLogoClick?: () => void;
}

function Header({ logoHref, navigation, onLogoClick }: HeaderProps) {
  const { scrollRef, hasScrolled } = useScrolled();
  return (
    <Container>
      <FixedHeader hasScrolled={hasScrolled}>
        <Layout>
          <div>
            <a
              href={logoHref}
              onClick={
                onLogoClick &&
                ((e) => {
                  e.preventDefault();
                  onLogoClick();
                })
              }
            >
              <Logo />
            </a>
          </div>
          {navigation && (
            <NavigationContainer>{navigation}</NavigationContainer>
          )}
        </Layout>
      </FixedHeader>
      <ScrollEl ref={scrollRef} />
    </Container>
  );
}

export default Header;
