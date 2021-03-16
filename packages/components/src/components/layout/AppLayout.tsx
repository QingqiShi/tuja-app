import styled from 'styled-components';
import EdgePadding from './EdgePadding';
import { v } from '../../theme';

const Container = styled(EdgePadding)`
  @media (${v.minDesktop}) {
    display: flex;
    align-items: flex-start;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: calc(env(safe-area-inset-top) + ${v.spacerM}) 0
    calc(env(safe-area-inset-bottom) + 12rem);

  @media (${v.minTablet}) {
    padding: calc(env(safe-area-inset-top) + ${v.spacerM}) 0
      calc(env(safe-area-inset-bottom) + 9rem);
  }

  @media (${v.minLaptop}) {
    padding: calc(env(safe-area-inset-top) + ${v.spacerM}) 0
      calc(env(safe-area-inset-bottom) + 10rem);
  }

  @media (${v.minDesktop}) {
    padding: calc(env(safe-area-inset-top) + ${v.spacerM}) 0
      calc(env(safe-area-inset-bottom) + 6rem);
  }
`;

const TabBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;
  padding: ${v.spacerM} ${v.spacerXS}
    calc(env(safe-area-inset-bottom) + ${v.upDownPadding});
  z-index: ${v.zFixed};
  background: ${v.backgroundTabBarDrop};

  @media (${v.minTablet}) {
    padding: ${v.spacerM} ${v.spacerS}
      calc(env(safe-area-inset-bottom) + min(${v.upDownPadding}, 4vh));
  }

  @media (${v.minLaptop}) {
    padding: ${v.spacerM} ${v.spacerM}
      calc(env(safe-area-inset-bottom) + min(${v.upDownPadding}, 4vh));
  }

  @media (${v.minDesktop}) {
    padding: 0;
    display: block;
    position: sticky;
    top: 0;
    bottom: unset;
    left: unset;
    right: unset;
    padding: calc(env(safe-area-inset-top) + ${v.spacerM}) 0 0;
    margin-right: ${v.spacerM};
    background: transparent;
  }

  > * {
    pointer-events: auto;
  }
`;

interface AppLayoutProps {
  tabBar: React.ReactNode;
  children: React.ReactNode;
}

function AppLayout({ tabBar, children }: AppLayoutProps) {
  return (
    <Container>
      <TabBarContainer>{tabBar}</TabBarContainer>
      <Content>{children}</Content>
    </Container>
  );
}

export default AppLayout;
