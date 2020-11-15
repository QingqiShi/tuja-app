import React, { lazy, Suspense, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import { TopLinearLoader } from '@tuja/components';
import NavBar from 'components/NavBar';
import GlobalLoader from 'components/GlobalLoader';
import useAuth, { AuthProvider } from 'hooks/useAuth';
import usePortfolio, { PortfolioProvider } from 'hooks/usePortfolio';
import { PortfolioPerformanceProvider } from 'hooks/usePortfolioPerformance';
import { StartDateProvider } from 'hooks/useStartDate';
import { StocksDataProvider } from 'hooks/useStocksData';
import { LoadingStateProvider } from 'hooks/useLoadingState';
import { theme } from 'theme';

const Portfolio = lazy(() => import('views/App/Portfolio'));
const Activities = lazy(() => import('views/App/Activities'));
const Create = lazy(() => import('views/App/Create'));

if (window.location.hostname === 'localhost') {
  if (!window.firestoreConfigured) {
    firebase.firestore().settings({ host: 'localhost:5002', ssl: false });
    window.firestoreConfigured = true;
  }
  firebase.functions().useEmulator('localhost', 5001);
}

dayjs.extend(isSameOrBefore);

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

      <Suspense fallback={<TopLinearLoader />}>
        {state !== 'SIGNED_IN' &&
          state !== 'SIGNING_IN' &&
          state !== 'UNKNOWN' && (
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
            <Route path="/create-portfolio">
              <Create />
            </Route>
            <Route>
              <Redirect to="/portfolio" />
            </Route>
          </Switch>
        )}
      </Suspense>
    </Container>
  );
}

function AppShellWithProviders() {
  return (
    <AuthProvider>
      <LoadingStateProvider>
        <StartDateProvider>
          <StocksDataProvider>
            <PortfolioProvider>
              <PortfolioPerformanceProvider>
                <GlobalLoader />
                <AppShell />
              </PortfolioPerformanceProvider>
            </PortfolioProvider>
          </StocksDataProvider>
        </StartDateProvider>
      </LoadingStateProvider>
    </AuthProvider>
  );
}

export default AppShellWithProviders;
