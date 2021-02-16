import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from '@tuja/components';
import { Portfolio } from '@tuja/libs';
import { PortfolioContext } from './hooks/usePortfolio';

interface RenderOptions {
  portfolio?: Portfolio;
}

const defaultPortfolio = {
  id: 'test-portfolio',
  name: 'Test Portfolio',
  user: 'test-user',
  currency: 'GBP',
  aliases: {},
};

export const render = (ui: React.ReactElement, options?: RenderOptions) => {
  const { portfolio } = options ?? {};
  const results = rtlRender(
    <PortfolioContext.Provider
      value={{
        portfolio: portfolio ?? defaultPortfolio,
        portfolios: [portfolio ?? defaultPortfolio],
        loaded: true,
      }}
    >
      <ThemeProvider theme={getTheme('light')}>{ui}</ThemeProvider>
    </PortfolioContext.Provider>
  );
  return {
    ...results,
    rerender: (ui: React.ReactElement) =>
      results.rerender(
        <ThemeProvider theme={getTheme('light')}>{ui}</ThemeProvider>
      ),
  };
};
