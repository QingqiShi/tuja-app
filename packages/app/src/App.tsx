import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useMedia } from 'react-use';
import { ThemeProvider } from 'styled-components/macro';
import { GlobalStyle } from '@tuja/components';
import Home from 'views/Home';
import AppShell from 'views/AppShell';
import GlobalLoader from 'components/GlobalLoader';
import { StocksDataProvider } from 'hooks/useStocksData';
import { PortfolioProvider } from 'hooks/usePortfolio';
import { PortfolioPerformanceProvider } from 'hooks/usePortfolioPerformance';
import { StartDateProvider } from 'hooks/useStartDate';
import { AuthProvider } from 'hooks/useAuth';
import { LoadingStateProvider } from 'hooks/useLoadingState';

function App() {
  const isDark = useMedia('(prefers-color-scheme: dark)');

  return (
    <AuthProvider>
      <LoadingStateProvider>
        <StartDateProvider>
          <StocksDataProvider>
            <PortfolioProvider>
              <PortfolioPerformanceProvider>
                <ThemeProvider theme={{ mode: isDark ? 'dark' : 'light' }}>
                  <GlobalStyle />
                  <GlobalLoader />
                  <Switch>
                    <Route path="/" exact>
                      <Home />
                    </Route>
                    <Route>
                      <AppShell />
                    </Route>
                  </Switch>
                </ThemeProvider>
              </PortfolioPerformanceProvider>
            </PortfolioProvider>
          </StocksDataProvider>
        </StartDateProvider>
      </LoadingStateProvider>
    </AuthProvider>
  );
}

export default App;
