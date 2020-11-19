import { DefaultTheme, css } from 'styled-components';
import { lighten, darken, transparentize } from 'polished';

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
    textSecondaryOnBackground: ({ theme }: ThemeProps) =>
      theme.mode === 'light'
        ? lighten(0.1, lightPallete.secondary)
        : darken(0.1, darkPallete.secondary),
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
  shadows: {
    soft: ({ theme }: ThemeProps) =>
      theme.mode === 'light'
        ? `0 0 1rem 0 ${transparentize(0.9, lightPallete.secondary)}`
        : `0 0 1rem 0 rgba(0, 0, 0, 0.1)`,
  },
  fonts: {
    ctaSize: '1rem',
    ctaHeight: '1.2em',
    ctaWeight: 600,
    ctaSpacing: '0.028em',
    inputSize: '1.1rem',
    inputHeight: '1.3em',
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
    minTablet: 'min-width: 706px',
    minLaptop: 'min-width: 1025px',
    minDesktop: 'min-width: 1441px',
  },
  paddings: {
    normal: {
      mobile: '1.5rem',
      tablet: '1.2rem',
      laptop: '1rem',
    },
    compact: {
      mobile: '1rem',
      tablet: '0.8rem',
      laptop: '0.5rem',
    },
  },
  backdropBlur: '1rem',
  zIndex: {
    behind: -100,
    background: 0,
    raised: 100,
    fixed: 200,
    backdrop: 300,
    modal: 400,
  },
};

export const getTheme = (
  val: string | ((p: ThemeProps) => string),
  manipulator: (val: string) => string
) => {
  if (typeof val === 'string') return manipulator(val);
  return (p: ThemeProps) => manipulator(val(p));
};

export const getPaddings = (isCompact?: boolean) => (p: ThemeProps) => {
  const paddingName = isCompact ? ('compact' as const) : ('normal' as const);
  return css`
    padding: ${theme.paddings[paddingName].mobile};
    @media (${theme.breakpoints.minTablet}) {
      padding: ${theme.paddings[paddingName].tablet};
    }
    @media (${theme.breakpoints.minLaptop}) {
      padding: ${theme.paddings[paddingName].laptop};
    }
  `;
};
