import React, { useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { RiAddLine } from 'react-icons/ri';
import styled from 'styled-components/macro';
import Dashboard from 'views/App/Dashboard';
import PortfolioList from 'views/App/PortfolioList';
import Activities from 'views/App/Activities';
import Admin from 'views/App/Admin';
import Create from 'views/App/Create';
import Button from 'components/Button';
import NavBar from 'components/NavBar';
import ActivityForms from 'components/ActivityForms';
import Backdrop from 'components/Backdrop';
import useBodyScrollLock from 'hooks/useBodyScrollLock';
import useAuth from 'hooks/useAuth';
import usePortfolio from 'hooks/usePortfolio';
import { Card } from 'commonStyledComponents';
import { theme } from 'theme';

const Container = styled.div`
  padding-bottom: calc(
    3.5rem + ${theme.spacings('m')} + env(safe-area-inset-bottom)
  );
`;

const Fab = styled.div`
  position: fixed;
  bottom: calc(${theme.spacings('m')} + env(safe-area-inset-bottom));
  right: ${theme.spacings('m')};

  @media (${theme.breakpoints.minLaptop}) {
    bottom: calc(${theme.spacings('l')} + env(safe-area-inset-bottom));
    right: ${theme.spacings('l')};
  }
`;

function AppShell() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const addActivityRef = useBodyScrollLock(showAddActivity);
  const { state } = useAuth();
  const { portfolio, loaded: portfolioLoaded } = usePortfolio();

  return (
    <Container>
      <NavBar showSignIn={showSignIn} setShowSignIn={setShowSignIn} />

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
          <Route path="/dashboard">
            <Dashboard onSignIn={() => setShowSignIn(true)} />
          </Route>
          <Route path="/portfolio">
            <PortfolioList />
          </Route>
          <Route path="/activities">
            <Activities />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route>
            <Redirect to="/dashboard" />
          </Route>
        </Switch>
      )}

      {state !== 'SIGNED_IN' && state !== 'SIGNING_IN' && state !== 'UNKNOWN' && (
        <Switch>
          <Route path="/demo">
            <Dashboard onSignIn={() => setShowSignIn(true)} isDemo />
          </Route>
          <Route>
            <Redirect to="/demo" />
          </Route>
        </Switch>
      )}

      {state === 'SIGNED_IN' && portfolio && (
        <Fab>
          <Button
            variant="shout"
            startIcon={<RiAddLine />}
            onClick={() => setShowAddActivity(true)}
          >
            Update Portfolio
          </Button>
        </Fab>
      )}
      {showAddActivity && (
        <Backdrop onClick={() => setShowAddActivity(false)}>
          <Card ref={addActivityRef}>
            <ActivityForms onClose={() => setShowAddActivity(false)} />
          </Card>
        </Backdrop>
      )}
    </Container>
  );
}

export default AppShell;
