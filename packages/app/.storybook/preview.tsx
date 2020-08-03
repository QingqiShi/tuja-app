import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components/macro';
import { addDecorator } from '@storybook/react';
import { withThemesProvider } from 'storybook-addon-styled-component-theme';
import { theme } from '../src/theme';
import { Center } from '../src/commonStyledComponents';
import '../src/index.css';

addDecorator((storyFn) => <Center>{storyFn()}</Center>);

const GlobalStyle = createGlobalStyle`
  body {
    color: ${theme.colors.textOnBackground};
    background-color: ${theme.colors.backgroundMain};
    height: 100%;
  }
  html, body, #root {
    height: 100%;
    font-size: 16px;
  }
`;
addDecorator((storyFn) => (
  <>
    <GlobalStyle />
    {storyFn()}
  </>
));
addDecorator((storyFn) => <BrowserRouter>{storyFn()}</BrowserRouter>);

const themes = [
  { name: 'light', mode: 'light' },
  { name: 'dark', mode: 'dark' },
];
addDecorator(withThemesProvider(themes));
