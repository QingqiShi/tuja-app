import { css, createGlobalStyle } from 'styled-components';
import dark from './themes/dark';
import light from './themes/light';
import { v } from './theme';

const globalCss = css`
  html {
    ${dark}

    @media (prefers-color-scheme: light) {
      ${light}
    }

    &[data-theme='light'] {
      ${light}
    }

    &[data-theme='dark'] {
      ${dark}
    }
  }

  body {
    box-sizing: border-box;
    color: ${v.textMain};
    background-color: ${v.backgroundMain};
    font-family: ${v.fontFamily};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    * {
      box-sizing: inherit;
      font-size: inherit;
    }
  }

  html,
  body {
    font-size: 16px;
    @media (${v.minLaptop}) {
      font-size: 18px;
    }
  }

  :root {
    ${'color-scheme: dark light;'}
  }

  [data-theme='light'] {
    ${'color-scheme: light;'}
  }

  [data-theme='dark'] {
    ${'color-scheme: dark;'}
  }
`;

export const GlobalStyle = createGlobalStyle`${globalCss}`;
