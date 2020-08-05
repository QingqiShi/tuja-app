import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useMedia } from 'react-use';
import { createGlobalStyle, ThemeProvider } from 'styled-components/macro';
import { theme } from 'theme';
import Home from 'views/Home';
import AppShell from 'views/AppShell';
import { StocksDataProvider } from 'hooks/useStocksData';
import { PortfolioProvider } from 'hooks/usePortfolio';
import { PortfolioPerformanceProvider } from 'hooks/usePortfolioPerformance';
import { StocksListProvider } from 'hooks/useStocksList';
import { StartDateProvider } from 'hooks/useStartDate';

const GlobalStyle = createGlobalStyle`
  body {
    color: ${theme.colors.textOnBackground};
    background-color: ${theme.colors.backgroundMain};
  }

  html {
    font-size: 14px;
    @media (${theme.breakpoints.minTablet}) {
      font-size: 16px;
    }
    @media (${theme.breakpoints.minLaptop}) {
      font-size: 18px;
    }
    @media (${theme.breakpoints.minDesktop}) {
      font-size: 20px;
    }
  }
`;

function App() {
  const isDark = useMedia('(prefers-color-scheme: dark)');

  return (
    <StocksListProvider>
      <PortfolioProvider>
        <StartDateProvider>
          <StocksDataProvider>
            <PortfolioPerformanceProvider>
              <ThemeProvider theme={{ mode: isDark ? 'dark' : 'light' }}>
                <GlobalStyle />
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
          </StocksDataProvider>
        </StartDateProvider>
      </PortfolioProvider>
    </StocksListProvider>
  );
}

export default App;
