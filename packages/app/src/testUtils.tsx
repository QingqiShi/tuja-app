import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { getTheme } from '@tuja/components';
import { TimeSeries } from '@tuja/libs';
import { PortfolioContext } from './hooks/usePortfolio';
import { PortfolioProcessorContext } from './hooks/usePortfolioProcessor';
import { AuthContext } from './hooks/useAuth';

interface RenderOptions {
  portfolio?: Partial<React.ContextType<typeof PortfolioContext>>;
  portfolioPerformance?: Partial<
    React.ContextType<typeof PortfolioProcessorContext>
  >;
  auth?: Partial<React.ContextType<typeof AuthContext>>;
  initialRoute?: string;
}

export const defaultPortfolio = {
  id: 'test-portfolio',
  name: 'Test Portfolio',
  user: 'test-user',
  currency: 'GBP',
  aliases: {},
  costBasis: {
    'AAPL.US': 97.7,
    'IUSA.LSE': 46.5,
  },
};

export const defaultPortfolioPerformance = {
  id: 'test-portfolio',
  totalHoldingsValue: 150,
  holdings: {
    'AAPL.US': {
      value: 100,
      units: 1,
      info: {
        Ticker: 'AAPL.US',
        Code: 'AAPL',
        Name: 'Apple Inc',
        Currency: 'USD',
      },
      livePrice: {
        date: new Date(),
        code: 'AAPL.US',
        close: 100,
        previousClose: 100,
        timestamp: new Date().getTime(),
        change: 2.3,
        change_p: 2.3,
      },
    },
    'IUSA.LSE': {
      value: 50,
      units: 1,
      info: {
        Ticker: 'IUSA.LSE',
        Code: 'IUSA',
        Name: 'iShares S&P 500',
        Currency: 'GBP',
      },
      livePrice: {
        date: new Date(),
        code: 'IUSA.LSE',
        close: 50,
        previousClose: 50,
        times5p: new Date().getTime(),
        change: 3.5,
        change_p: 7,
      },
    },
  },
  valueSeries: new TimeSeries({ data: [[new Date(), 150]] }),
  twrrSeries: new TimeSeries(),
  gainSeries: new TimeSeries(),
  cashFlowSeries: new TimeSeries(),
  monthlyDividends: new TimeSeries(),
};

export const defaultAuth = {
  signIn: async (_email: string) => {},
  signOut: () => {},
  confirmEmail: (_email: string) => {},
  reset: () => {},
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  state: 'SIGNED_OUT' as const,
  currentUser: null,
  isAdmin: false,
  authError: '',
};

export const render = (ui: React.ReactElement, options?: RenderOptions) => {
  const { portfolio, portfolioPerformance, auth, initialRoute } = options ?? {};
  if (initialRoute) {
    window.history.pushState({}, 'Test page', initialRoute);
  }
  const results = rtlRender(
    <AuthContext.Provider value={{ ...defaultAuth, ...auth }}>
      <PortfolioContext.Provider
        value={{
          portfolio: defaultPortfolio,
          portfolios: [defaultPortfolio],
          loaded: true,
          ...portfolio,
        }}
      >
        <PortfolioProcessorContext.Provider
          value={{
            portfolioPerformance: defaultPortfolioPerformance as any,
            isReady: true,
            resetSnapshots: () => {},
            refresh: () => {},
            ...portfolioPerformance,
          }}
        >
          <ThemeProvider theme={getTheme('light')}>{ui}</ThemeProvider>
        </PortfolioProcessorContext.Provider>
      </PortfolioContext.Provider>
    </AuthContext.Provider>,
    initialRoute ? { wrapper: BrowserRouter } : undefined
  );
  return {
    ...results,
    rerender: (ui: React.ReactElement, options?: RenderOptions) => {
      const { portfolio, portfolioPerformance, auth } = options ?? {};
      return results.rerender(
        <AuthContext.Provider value={{ ...defaultAuth, ...auth }}>
          <PortfolioContext.Provider
            value={{
              portfolio: defaultPortfolio,
              portfolios: [defaultPortfolio],
              loaded: true,
              ...portfolio,
            }}
          >
            <PortfolioProcessorContext.Provider
              value={{
                portfolioPerformance: defaultPortfolioPerformance as any,
                isReady: true,
                resetSnapshots: () => {},
                refresh: () => {},
                ...portfolioPerformance,
              }}
            >
              <ThemeProvider theme={getTheme('light')}>{ui}</ThemeProvider>
            </PortfolioProcessorContext.Provider>
          </PortfolioContext.Provider>
        </AuthContext.Provider>
      );
    },
  };
};
