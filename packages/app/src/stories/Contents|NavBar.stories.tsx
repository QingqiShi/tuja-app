import React from 'react';
import styled from 'styled-components/macro';
import NavBar from 'components/NavBar';
import { AuthContext } from 'hooks/useAuth';

export default {
  title: 'Contents|NavBar',
  component: NavBar,
};

const Container = styled.div`
  width: 100%;
  height: 400px;
`;

export const SignedOut = () => (
  <Container>
    <NavBar />
  </Container>
);

export const SignedIn = () => (
  <AuthContext.Provider
    value={{ state: 'SIGNED_IN', currentUser: {}, isAdmin: false } as any}
  >
    <Container>
      <NavBar />
    </Container>
  </AuthContext.Provider>
);
