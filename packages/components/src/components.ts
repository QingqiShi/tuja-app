import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyle = createGlobalStyle`
  body {
    color: ${theme.colors.textOnBackground};
    background-color: ${theme.colors.backgroundMain};
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body * {
    box-sizing: inherit;
    font-size: inherit;
  }

  html, body {
    font-size: 16px;
    @media (${theme.breakpoints.minTablet}) {
      font-size: 17px;
    }
    @media (${theme.breakpoints.minLaptop}) {
      font-size: 18px;
    }
    @media (${theme.breakpoints.minDesktop}) {
      font-size: 20px;
    }
  }
`;
