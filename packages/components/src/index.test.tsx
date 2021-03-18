import { ThemeProvider } from 'styled-components';
import { render } from '@testing-library/react';
import { Button, getTheme } from './index';

test('renders', () => {
  render(
    <ThemeProvider theme={getTheme('light')}>
      <Button />
    </ThemeProvider>
  );
});
