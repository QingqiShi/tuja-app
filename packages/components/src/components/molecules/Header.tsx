import { useRef } from 'react';
import { useIntersection } from 'react-use';
import styled, { css } from 'styled-components';
import { v } from '../../theme';
import Logo from '../atoms/Logo';

const Container = styled.div`
  height: ${v.headerHeight};
`;

const FixedHeader = styled.div<{ hasScrolled?: boolean }>`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: var(--header-height, 5rem);
  backdrop-filter: blur(${v.spacerM});
  transition: background-color 0.2s, box-shadow 0.2s;
  z-index: ${v.zFixed};
  will-change: transform;

  ${({ hasScrolled }) =>
    hasScrolled &&
    css`
      background-color: ${v.backgroundTranslucent};
      box-shadow: ${v.shadowRaised};
    `}
`;

const Layout = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: calc(env(safe-area-inset-left) + ${v.leftRightPadding});
  padding-right: calc(env(safe-area-inset-right) + ${v.leftRightPadding});

  > :first-child {
    flex-grow: 1;
  }
`;

const NavigationContainer = styled.nav`
  display: flex;
  align-items: center;
  height: 100%;
`;

const ScrollEl = styled.div`
  height: 10px;
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
    hasScrolled: (intersection && !intersection.isIntersecting) ?? false,
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
    <Container as="header">
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
