import { lazy, Suspense } from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import minMax from 'dayjs/plugin/minMax';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import { TopLinearLoader, v } from '@tuja/components';
import NavBar from 'components/NavBar';
import GlobalLoader from 'components/GlobalLoader';
import useAuth, { AuthProvider } from 'hooks/useAuth';
import usePortfolio, { PortfolioProvider } from 'hooks/usePortfolio';
import { StartDateProvider } from 'hooks/useStartDate';
import { LoadingStateProvider } from 'hooks/useLoadingState';

const Overview = lazy(() => import('views/App/Overview'));
const Activities = lazy(() => import('views/App/Activities'));
const Create = lazy(() => import('views/App/Create'));
const SignIn = lazy(() => import('views/App/SignIn'));

if (window.location.hostname === 'localhost') {
  if (!window.firestoreConfigured) {
    firebase.firestore().settings({
      host: 'localhost:5002',
      ssl: false,
      ignoreUndefinedProperties: true,
    });
    window.firestoreConfigured = true;
  }
  firebase.functions().useEmulator('localhost', 5001);
} else {
  firebase.firestore().settings({
    ignoreUndefinedProperties: true,
    experimentalAutoDetectLongPolling: true,
  });
}

dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);

const Container = styled.div`
  padding-bottom: calc(${v.spacerS} + env(safe-area-inset-bottom));
`;

function AppShell() {
  const { state } = useAuth();
  const { portfolio, portfolios, loaded: portfolioLoaded } = usePortfolio();

  return (
    <Container>
      <NavBar />

      <Suspense fallback={<TopLinearLoader />}>
        {state !== 'SIGNED_IN' && state !== 'UNKNOWN' && (
          <Switch>
            <Route path="/demo" exact>
              <Overview isDemo />
            </Route>
            <Route path="/signin" exact>
              <SignIn />
            </Route>
            <Route>
              <Redirect to="/demo" />
            </Route>
          </Switch>
        )}

        {state === 'SIGNED_IN' &&
          portfolioLoaded &&
          !portfolio &&
          !portfolios.length && (
            <Switch>
              <Route path="/create-portfolio" exact>
                <Create />
              </Route>
              <Route>
                <Redirect to="/create-portfolio" />
              </Route>
            </Switch>
          )}

        {state === 'SIGNED_IN' &&
          portfolioLoaded &&
          !portfolio &&
          !!portfolios.length && (
            <Redirect to={`/portfolio/${portfolios[0].id}`} />
          )}

        {state === 'SIGNED_IN' &&
          portfolioLoaded &&
          portfolio &&
          !!portfolios.length && (
            <Switch>
              <Route path="/portfolio/:portfolioId" exact>
                <Overview />
              </Route>
              <Route path="/portfolio/:portfolioId/activities" exact>
                <Activities />
              </Route>
              <Route path="/portfolio/:portfolioId/create-portfolio" exact>
                <Create />
              </Route>
              <Route>
                <Redirect to={`/portfolio/${portfolio.id}`} />
              </Route>
            </Switch>
          )}
      </Suspense>
    </Container>
  );
}

function AppShellWithProviders() {
  const match = useRouteMatch<{ portfolioId?: string }>('/:page/:portfolioId');
  const portfolioId = match ? match?.params.portfolioId : 'example-portfolio';

  return (
    <AuthProvider>
      <LoadingStateProvider>
        <StartDateProvider>
          <PortfolioProvider portfolioId={portfolioId}>
            <GlobalLoader />
            <AppShell />
          </PortfolioProvider>
        </StartDateProvider>
      </LoadingStateProvider>
    </AuthProvider>
  );
}

export default AppShellWithProviders;
