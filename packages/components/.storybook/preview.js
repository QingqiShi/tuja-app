import { useEffect } from 'react';
import { addDecorator } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../src/globalStyle';
import { getTheme } from '../src/theme';
import { KeyboardFocusProvider } from '../src/hooks/useKeyboardFocus';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'lightning',
      items: [
        { value: 'dark', right: '🌒', title: 'Dark theme' },
        { value: 'light', right: '🌞', title: 'Light theme' },
      ],
    },
  },
};

addDecorator((storyFn) => (
  <>
    <GlobalStyle />
    {storyFn()}
  </>
));

addDecorator((storyFn, context) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', context.globals.theme);
  }, [context.globals.theme]);

  return (
    <KeyboardFocusProvider>
      <ThemeProvider theme={getTheme(context.globals.theme)}>
        {storyFn()}
      </ThemeProvider>
    </KeyboardFocusProvider>
  );
});
