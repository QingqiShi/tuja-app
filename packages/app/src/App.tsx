import { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useMedia } from 'react-use';
import { ThemeProvider } from 'styled-components';
import {
  KeyboardFocusProvider,
  GlobalStyle,
  TopLinearLoader,
  getTheme,
} from '@tuja/components';

const Home = lazy(() => import('./views/Home'));
const Analytics = lazy(() => import('./views/Analytics'));
const AppShell = lazy(() => import('./views/AppShell'));

function App() {
  const isDark = useMedia('(prefers-color-scheme: dark)');

  return (
    <KeyboardFocusProvider>
      <ThemeProvider
        theme={getTheme(isDark ? ('dark' as const) : ('light' as const))}
      >
        <GlobalStyle />
        <Suspense fallback={<TopLinearLoader />}>
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>

            <Route path="/analytics">
              <Analytics />
            </Route>

            <Route path="/tracker">
              <AppShell />
            </Route>

            <Route>404</Route>
          </Switch>
        </Suspense>
      </ThemeProvider>
    </KeyboardFocusProvider>
  );
}

export default App;
