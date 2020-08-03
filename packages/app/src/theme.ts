import { DefaultTheme } from 'styled-components/macro';
import { lighten } from 'polished';

const lightPallete = {
  primary: '#FFFFFF',
  secondary: '#211A1D',
  accent: '#5218FA',
  error: '#FA0011',
  ordinals: ['#556480', '#CF9F97', '#9DAECC', '#B8CC89', '#75805C'],
};

const darkPallete = {
  primary: '#211A1D',
  secondary: '#FFFFFF',
  accent: '#774AFB',
  error: '#FF2331',
  ordinals: ['#5B6A87', '#D6A59C', '#A3B4D4', '#BFD48E', '#7C8761'],
};

const spacings = {
  xs: '0.5rem',
  s: '1rem',
  m: '2rem',
  l: '3rem',
  xl: '5rem',
  xxl: '8rem',
};

interface ThemeProps {
  theme: DefaultTheme;
}

export const theme = {
  colors: {
    backgroundMain: ({ theme }: ThemeProps) =>
      theme.mode === 'light' ? lightPallete.primary : darkPallete.primary,
    textOnBackground: ({ theme }: ThemeProps) =>
      theme.mode === 'light' ? lightPallete.secondary : darkPallete.secondary,
    backgroundRaised: ({ theme }: ThemeProps) =>
      theme.mode === 'light'
        ? lightPallete.primary
        : lighten(0.04, darkPallete.primary),
    callToAction: ({ theme }: ThemeProps) =>
      theme.mode === 'light' ? lightPallete.accent : darkPallete.accent,
    textOnCallToAction: ({ theme }: ThemeProps) =>
      theme.mode === 'light' ? lightPallete.primary : darkPallete.secondary,
    callToActionText: ({ theme }: ThemeProps) =>
      theme.mode === 'light'
        ? lightPallete.accent
        : lighten(0.07, darkPallete.accent),
    error: ({ theme }: ThemeProps) =>
      theme.mode === 'light' ? lightPallete.error : darkPallete.error,
    ordinals: ({ theme }: ThemeProps) =>
      theme.mode === 'light' ? lightPallete.ordinals : darkPallete.ordinals,
  },
  spacings: (...vals: (keyof typeof spacings)[]) =>
    vals.map((val) => spacings[val]).join(' '),
  fonts: {
    ctaSize: '1rem',
    ctaHeight: '1.2em',
    ctaWeight: 600,
    ctaSpacing: '0.028em',
    inputSize: '1.2rem',
    inputHeight: '1em',
    inputWeight: 400,
    labelSize: '0.9rem',
    labelHeight: '1.2em',
    labelWeight: 500,
    helperSize: '0.8rem',
    helperHeight: '1.5em',
    helperWeight: 400,
  },
  fontFamily: "'Inter', sans-serif",
  breakpoints: {
    minTablet: 'min-width: 518px',
    minLaptop: 'min-width: 1025px',
    minDesktop: 'min-width: 1441px',
  },
};

export const getTheme = (
  val: string | ((p: ThemeProps) => string),
  manipulator: (val: string) => string
) => {
  if (typeof val === 'string') return manipulator(val);
  return (p: ThemeProps) => manipulator(val(p));
};
