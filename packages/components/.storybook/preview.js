import React from 'react';
import { addDecorator } from '@storybook/react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { theme } from '../src/theme';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

const GlobalStyle = createGlobalStyle`
  body {
    color: ${theme.colors.textOnBackground};
    background-color: ${theme.colors.backgroundMain};
  }
`;
addDecorator((storyFn) => (
  <>
    <GlobalStyle />
    {storyFn()}
  </>
));

addDecorator((storyFn, context) => (
  <ThemeProvider theme={{ mode: context.globals.theme }}>
    {storyFn()}
  </ThemeProvider>
));

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
