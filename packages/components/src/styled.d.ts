import 'styled-components';

declare module 'styled-components' {
  type Theme = ReturnType<typeof import('./theme').getTheme>;

  export interface DefaultTheme {
    mode: 'light' | 'dark';
    colors: Theme['colors'];
    shadows: Theme['shadows'];
    spacings: Theme['spacings'];
    fonts: Theme['fonts'];
    fontFamily: Theme['fontFamily'];
    breakpoints: Theme['breakpoints'];
    paddings: Theme['paddings'];
    leftRight: Theme['leftRight'];
    backdropBlur: Theme['backdropBlur'];
    zIndex: Theme['zIndex'];
  }
}
