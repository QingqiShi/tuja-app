import styled, { css } from 'styled-components';
import useScrolled from '../../hooks/useScrolled';
import { v } from '../../theme';
import Logo from '../display/Logo';
import EdgePadding from './EdgePadding';

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

interface HeaderProps {
  logoHref: string;
  navigation?: React.ReactNode;
  onLogoClick?: () => void;
}

function Header({ logoHref, navigation, onLogoClick }: HeaderProps) {
  const { scrollEl, hasScrolled } = useScrolled();
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
      {scrollEl}
    </Container>
  );
}

export default Header;
