import { lazy, Suspense } from 'react';
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useHistory,
  useLocation,
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

const Overview = lazy(() => import('./App/Overview'));
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

  const tabBarLinks: React.ComponentProps<typeof TabBar>['links'] = [];

  if (portfolio?.id === examplePortfolio.id) {
    tabBarLinks.push(
      {
        Icon: Star,
        label: 'Example',
        href: '/tracker/demo',
        isActive: portfolio
          ? history.location.pathname === '/tracker/demo'
          : undefined,
        onClick: () => portfolio && history.push('/tracker/demo'),
      },
      {
        Icon: User,
        label: 'Sign in',
        href: '/tracker/signin',
        isActive: history.location.pathname === '/tracker/signin',
        onClick: () => portfolio && history.push('/tracker/signin'),
      }
    );
  } else if (portfolio || portfolios.length) {
    const id = portfolio?.id ?? portfolios[0].id;
    tabBarLinks.push(
      {
        Icon: House,
        label: 'Overview',
        href: `/tracker/portfolio/${id}`,
        isActive: history.location.pathname === `/tracker/portfolio/${id}`,
        onClick: () => history.push(`/tracker/portfolio/${id}`),
      },
      {
        Icon: Clock,
        label: 'Activities',
        href: `/tracker/portfolio/${id}/activities`,
        isActive:
          history.location.pathname === `/tracker/portfolio/${id}/activities`,
        onClick: () => history.push(`/tracker/portfolio/${id}/activities`),
      }
    );
  }

  tabBarLinks.push({
    Icon: Gear,
    label: 'Settings',
    href: '/tracker/settings',
    isActive: history.location.pathname === '/tracker/settings',
    onClick: () => history.push('/tracker/settings'),
  });

  return (
    <AppLayout tabBar={<TabBar links={tabBarLinks} />}>
      <Suspense fallback={<TopLinearLoader />}>
        {state !== 'SIGNED_IN' && state !== 'UNKNOWN' && (
          <Switch>
            <Route path="/tracker/demo" exact>
              <Overview isDemo />
            </Route>
            <Route path="/tracker/signin" exact>
              <SignIn />
            </Route>
            <Route path="/tracker/settings" exact>
              <Settings />
            </Route>
            <Route>
              <Redirect to="/tracker/demo" />
            </Route>
          </Switch>
        )}

        {state === 'SIGNED_IN' && portfolioLoaded && !portfolios.length && (
          <Switch>
            <Route path="/tracker/create-portfolio" exact>
              <Create />
            </Route>
            <Route path="/tracker/settings" exact>
              <Settings />
            </Route>
            <Route>
              <Redirect to="/tracker/create-portfolio" />
            </Route>
          </Switch>
        )}

        {state === 'SIGNED_IN' && portfolioLoaded && !!portfolios.length && (
          <Switch>
            <Route path="/tracker/portfolio/:portfolioId" exact>
              <Overview />
            </Route>
            <Route path="/tracker/portfolio/:portfolioId/activities" exact>
              <Activities />
            </Route>
            <Route path="/tracker/create-portfolio" exact>
              <Create />
            </Route>
            <Route path="/tracker/settings" exact>
              <Settings />
            </Route>
            <Route>
              {portfolio ? (
                <Redirect to={`/tracker/portfolio/${portfolio.id}`} />
              ) : (
                <Redirect to={`/tracker/portfolio/${portfolios[0].id}`} />
              )}
            </Route>
          </Switch>
        )}
      </Suspense>
    </AppLayout>
  );
}

function AppShellWithProviders() {
  const location = useLocation();
  const match = useRouteMatch<{ portfolioId?: string }>(
    '/tracker/:page/:portfolioId'
  );
  const portfolioId = match?.params.portfolioId;

  return (
    <AuthProvider>
      <LoadingStateProvider>
        <StartDateProvider>
          <PortfolioProvider
            portfolioId={
              location.pathname === '/tracker/demo'
                ? examplePortfolio.id
                : portfolioId
            }
          >
            <GlobalLoader />
            <AppShell />
          </PortfolioProvider>
        </StartDateProvider>
      </LoadingStateProvider>
    </AuthProvider>
  );
}

export default AppShellWithProviders;
