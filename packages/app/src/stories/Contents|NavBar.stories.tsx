import React from 'react';
import styled from 'styled-components/macro';
import NavBar from 'components/NavBar';
import { AuthContext } from 'hooks/useAuth';

const Container = styled.div`
  width: 100%;
  height: 400px;
`;

const NavBarStories = {
  title: 'Contents/NavBar',
  component: NavBar,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export default NavBarStories;

export const SignedOut = () => <NavBar />;

export const SignedIn = () => (
  <AuthContext.Provider
    value={{ state: 'SIGNED_IN', currentUser: {}, isAdmin: false } as any}
  >
    <NavBar />
  </AuthContext.Provider>
);
