import { lazy, Suspense } from 'react';
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useHistory,
} from 'react-router-dom';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import minMax from 'dayjs/plugin/minMax';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { House, Clock, Gear, Star, User } from 'phosphor-react';
import { AppLayout, TabBar, TopLinearLoader } from '@tuja/components';
import { examplePortfolio } from '../libs/portfolioClient';
import GlobalLoader from '../components/GlobalLoader';
import useAuth, { AuthProvider } from '../hooks/useAuth';
import usePortfolio, { PortfolioProvider } from '../hooks/usePortfolio';
import { StartDateProvider } from '../hooks/useStartDate';
import { LoadingStateProvider } from '../hooks/useLoadingState';

const Overview = lazy(() => import('./App/Overview/index'));
const Activities = lazy(() => import('./App/Activities'));
const Create = lazy(() => import('./App/Create'));
const SignIn = lazy(() => import('./App/SignIn'));
const Settings = lazy(() => import('./App/Settings'));

if (window.location.hostname === 'localhost') {
  if (!window.firestoreConfigured) {
    firebase.firestore().settings({
      host: 'localhost:5002',
      ssl: false,
      ignoreUndefinedProperties: true,
    });
    window.firestoreConfigured = true;
  }
} else {
  firebase.firestore().settings({
    ignoreUndefinedProperties: true,
    experimentalAutoDetectLongPolling: true,
  });
}

dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);

function AppShell() {
  const history = useHistory();
  const { state } = useAuth();
  const { portfolio, portfolios, loaded: portfolioLoaded } = usePortfolio();

  return (
    <AppLayout
      tabBar={
        <TabBar
          links={
            portfolio?.id === examplePortfolio.id
              ? [
                  {
                    Icon: Star,
                    label: 'Example',
                    href: '/demo',
                    isActive: portfolio
                      ? history.location.pathname === '/demo'
                      : undefined,
                    onClick: () => portfolio && history.push('/demo'),
                  },
                  {
                    Icon: User,
                    label: 'Sign in',
                    href: '/signin',
                    isActive: history.location.pathname === '/signin',
                    onClick: () => portfolio && history.push('/signin'),
                  },
                ]
              : [
                  {
                    Icon: House,
                    label: 'Overview',
                    href: portfolio ? `/portfolio/${portfolio.id}` : undefined,
                    isActive:
                      history.location.pathname ===
                      `/portfolio/${portfolio?.id ?? portfolios[0]?.id ?? ''}`,
                    onClick: () =>
                      history.push(
                        `/portfolio/${portfolio?.id ?? portfolios[0].id}`
                      ),
                  },
                  {
                    Icon: Clock,
                    label: 'Activities',
                    href: portfolio
                      ? `/portfolio/${portfolio.id}/activities`
                      : undefined,
                    isActive:
                      history.location.pathname ===
                      `/portfolio/${
                        portfolio?.id ?? portfolios[0]?.id ?? ''
                      }/activities`,
                    onClick: () =>
                      history.push(
                        `/portfolio/${
                          portfolio?.id ?? portfolios[0]?.id ?? ''
                        }/activities`
                      ),
                  },
                  {
                    Icon: Gear,
                    label: 'Settings',
                    href: '/settings',
                    isActive: history.location.pathname === '/settings',
                    onClick: () => history.push('/settings'),
                  },
                ]
          }
        />
      }
    >
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
              <Route path="/settings" exact>
                <Settings />
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
            <Switch>
              <Route path="/create-portfolio" exact>
                <Create />
              </Route>
              <Route path="/settings" exact>
                <Settings />
              </Route>
              <Route>
                <Redirect to={`/portfolio/${portfolios[0].id}`} />
              </Route>
            </Switch>
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
              <Route>
                <Redirect
                  to={`/portfolio/${portfolio?.id ?? portfolios[0].id}`}
                />
              </Route>
            </Switch>
          )}
      </Suspense>
    </AppLayout>
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
