import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from './theme';

export const render = (ui: React.ReactElement) => {
  const results = rtlRender(
    <ThemeProvider theme={getTheme('light')}>{ui}</ThemeProvider>
  );
  return {
    ...results,
    rerender: (ui: React.ReactElement) =>
      results.rerender(
        <ThemeProvider theme={getTheme('light')}>{ui}</ThemeProvider>
      ),
  };
};
