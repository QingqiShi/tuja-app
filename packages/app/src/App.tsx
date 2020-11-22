import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useMedia } from 'react-use';
import { ThemeProvider } from 'styled-components/macro';
import { GlobalStyle, TopLinearLoader, getTheme } from '@tuja/components';

const Home = lazy(() => import('views/Home'));
const AppShell = lazy(() => import('views/AppShell'));

function App() {
  const isDark = useMedia('(prefers-color-scheme: dark)');

  return (
    <ThemeProvider
      theme={getTheme(isDark ? ('dark' as const) : ('light' as const))}
    >
      <GlobalStyle />
      <Suspense fallback={<TopLinearLoader />}>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route>
            <AppShell />
          </Route>
        </Switch>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
