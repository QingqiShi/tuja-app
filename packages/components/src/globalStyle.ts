import { createGlobalStyle } from 'styled-components';
import dark from './themes/dark';
import light from './themes/light';
import { v } from './theme';

export const GlobalStyle = createGlobalStyle`
  body {
    ${dark}

    @media (prefers-color-scheme: light) {
      ${light}
    }

    &[data-theme=light] {
      ${light}
    }

    &[data-theme=dark] {
      ${dark}
    }

    --font-family: 'Inter', sans-serif;
    --min-tablet: min-width: 706px;
    --min-laptop: min-width: 1025px;
    --min-desktop: min-width: 1441px;
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

  html, body {
    font-size: 16px;
    @media (${v.minLaptop}) {
      font-size: 18px;
    }
  }
`;
