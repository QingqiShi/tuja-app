import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from './theme';

export const render = (ui: React.ReactElement) => {
  return rtlRender(
    <ThemeProvider theme={getTheme('light')}>{ui}</ThemeProvider>
  );
};
