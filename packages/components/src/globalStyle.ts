import { css, createGlobalStyle } from 'styled-components';
import dark from './themes/dark';
import light from './themes/light';
import { v } from './theme';

const customProperties = css`
  --up-down-padding: 1rem;
  --left-right-padding: 0.5rem;
  --max-layout-width: 100%;
  --header-height: 3rem;

  @media (${v.minTablet}) {
    --up-down-padding: 2rem;
    --left-right-padding: 1rem;
    --max-layout-width: 44rem;
    --header-height: 4rem;
  }

  @media (${v.minLaptop}) {
    --up-down-padding: 3.5rem;
    --left-right-padding: 2rem;
    --header-height: 4.5rem;

    // TODO: make this 100% after introducing split layout
    --max-layout-width: 70rem;
  }

  @media (${v.minDesktop}) {
    --up-down-padding: 4rem;
    --max-layout-width: 90rem;
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
  }

  * {
    box-sizing: inherit;
  }

  html,
  body {
    margin: 0;
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
