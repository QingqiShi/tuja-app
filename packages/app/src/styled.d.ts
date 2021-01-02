import 'styled-components/macro';

declare module 'styled-components/macro' {
  type Theme = ReturnType<typeof import('@tuja/components').getTheme>;

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
    topBottom: Theme['topBottom'];
    backdropBlur: Theme['backdropBlur'];
    zIndex: Theme['zIndex'];
  }
}
