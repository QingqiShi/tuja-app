import React, { useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components/macro';
import Portfolio from 'views/App/Portfolio';
import Activities from 'views/App/Activities';
import Admin from 'views/App/Admin';
import Create from 'views/App/Create';
import NavBar from 'components/NavBar';
import useAuth from 'hooks/useAuth';
import usePortfolio from 'hooks/usePortfolio';
import { theme } from 'theme';

const Container = styled.div`
  padding-bottom: calc(
    3.5rem + ${theme.spacings('m')} + env(safe-area-inset-bottom)
  );
`;

function AppShell() {
  const [showSignIn, setShowSignIn] = useState(false);
  const { state } = useAuth();
  const { portfolio, loaded: portfolioLoaded } = usePortfolio();

  return (
    <Container>
      <NavBar showSignIn={showSignIn} setShowSignIn={setShowSignIn} />

      {state !== 'SIGNED_IN' && state !== 'SIGNING_IN' && state !== 'UNKNOWN' && (
        <Switch>
          <Route path="/demo">
            <Portfolio onSignIn={() => setShowSignIn(true)} isDemo />
          </Route>
          <Route>
            <Redirect to="/demo" />
          </Route>
        </Switch>
      )}

      {state === 'SIGNED_IN' && portfolioLoaded && !portfolio && (
        <Switch>
          <Route path="/create-portfolio">
            <Create />
          </Route>
          <Route>
            <Redirect to="/create-portfolio" />
          </Route>
        </Switch>
      )}

      {state === 'SIGNED_IN' && portfolioLoaded && portfolio && (
        <Switch>
          <Route path="/portfolio">
            <Portfolio onSignIn={() => setShowSignIn(true)} />
          </Route>
          <Route path="/activities">
            <Activities />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route>
            <Redirect to="/portfolio" />
          </Route>
        </Switch>
      )}
    </Container>
  );
}

export default AppShell;
