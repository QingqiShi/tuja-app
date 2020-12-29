import { lazy, Suspense, useState } from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import minMax from 'dayjs/plugin/minMax';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import { TopLinearLoader } from '@tuja/components';
import NavBar from 'components/NavBar';
import GlobalLoader from 'components/GlobalLoader';
import useAuth, { AuthProvider } from 'hooks/useAuth';
import usePortfolio, { PortfolioProvider } from 'hooks/usePortfolio';
import { StartDateProvider } from 'hooks/useStartDate';
import { LoadingStateProvider } from 'hooks/useLoadingState';
import { theme } from 'theme';

const Portfolio = lazy(() => import('views/App/Portfolio'));
const Activities = lazy(() => import('views/App/Activities'));
const Create = lazy(() => import('views/App/Create'));

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
  firebase.firestore().settings({ ignoreUndefinedProperties: true });
}

dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);

const Container = styled.div`
  padding-bottom: calc(
    3.5rem + ${theme.spacings('m')} + env(safe-area-inset-bottom)
  );
`;

function AppShell() {
  const [showSignIn, setShowSignIn] = useState(false);
  const { state } = useAuth();
  const { portfolio, portfolios, loaded: portfolioLoaded } = usePortfolio();

  return (
    <Container>
      <NavBar showSignIn={showSignIn} setShowSignIn={setShowSignIn} />

      <Suspense fallback={<TopLinearLoader />}>
        {state !== 'SIGNED_IN' &&
          state !== 'SIGNING_IN' &&
          state !== 'UNKNOWN' && (
            <Switch>
              <Route path="/demo" exact>
                <Portfolio onSignIn={() => setShowSignIn(true)} isDemo />
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
                <Portfolio onSignIn={() => setShowSignIn(true)} />
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
