import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    color: ${({ theme }) => theme.colors.textOnBackground};
    background-color: ${({ theme }) => theme.colors.backgroundMain};
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
    @media (${({ theme }) => theme.breakpoints.minLaptop}) {
      font-size: 18px;
    }
  }
`;
