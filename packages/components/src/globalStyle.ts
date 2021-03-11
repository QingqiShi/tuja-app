import { css, createGlobalStyle } from 'styled-components';
import dark from './themes/dark';
import light from './themes/light';
import { v } from './theme';

const customProperties = css`
  --edge-padding: 1rem;

  @media (${v.minTablet}) {
    --edge-padding: 2rem;
  }

  @media (${v.minLaptop}) {
    --edge-padding: 3.5rem;
  }

  @media (${v.minDesktop}) {
    --edge-padding: 4rem;
  }
`;

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

    ${customProperties}
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
