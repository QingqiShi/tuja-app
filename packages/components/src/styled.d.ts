import 'styled-components/macro';

declare module 'styled-components/macro' {
  export interface DefaultTheme {
    mode: 'light' | 'dark';
  }
}
