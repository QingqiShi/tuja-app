import React from 'react';
import { addDecorator } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../src/globalStyle';
import { getTheme } from '../src/theme';

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
        { value: 'light', right: '🌞', title: 'Light theme' },
        { value: 'dark', right: '🌒', title: 'Dark theme' },
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

addDecorator((storyFn, context) => (
  <ThemeProvider theme={getTheme(context.globals.theme)}>
    {storyFn()}
  </ThemeProvider>
));
