import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from './theme';

interface RenderOptions {
  theme: 'light' | 'dark';
}

export const render = (ui: React.ReactElement, options?: RenderOptions) => {
  const { theme } = options ?? {};
  const results = rtlRender(
    <ThemeProvider theme={getTheme(theme ?? 'light')}>{ui}</ThemeProvider>
  );
  return {
    ...results,
    rerender: (ui: React.ReactElement) =>
      results.rerender(
        <ThemeProvider theme={getTheme(theme ?? 'light')}>{ui}</ThemeProvider>
      ),
  };
};
