import { useTheme as useStyledTheme } from 'styled-components';
import { lighten, darken, transparentize } from 'polished';

const commonTheme = {
  spacings: {
    xs: '0.5rem',
    s: '1rem',
    m: '2rem',
    l: '3rem',
    xl: '5rem',
    xxl: '8rem',
  },
  fonts: {
    cta: {
      size: '1rem',
      height: '1.2em',
      weight: 600,
      spacing: '0.028em',
    },
    input: {
      size: '1.1rem',
      height: '1.3em',
      weight: 400,
    },
    label: {
      size: '0.9rem',
      height: '1.2em',
      weight: 500,
    },
    helper: {
      size: '0.8rem',
      height: '1.5em',
      weight: 400,
    },
    h1: {
      size: '3.815rem',
      height: '1.1em',
      spacing: '-0.025em',
      weight: 800,
    },
    h2: {
      size: '3.052rem',
      height: '1.1em',
      spacing: '-0.025em',
      weight: 750,
    },
    h3: {
      size: '2.441rem',
      height: '1.1em',
      spacing: '-0.025em',
      weight: 700,
    },
    h4: {
      size: '1.953rem',
      height: '1.1em',
      spacing: '-0.025em',
      weight: 650,
    },
    h5: {
      size: '1.563rem',
      height: '1.1em',
      spacing: '-0.025em',
      weight: 650,
    },
    h6: {
      size: '1.25rem',
      height: '1.1em',
      spacing: '-0.025em',
      weight: 600,
    },
    body1: {
      size: '1rem',
      height: '1.7em',
      spacing: '0',
      weight: 400,
    },
    body2: {
      size: '0.9rem',
      height: '1.5em',
      spacing: '0',
      weight: 400,
    },
  },
  fontFamily: "'Inter', sans-serif",
  breakpoints: {
    minTablet: 'min-width: 706px',
    minLaptop: 'min-width: 1025px',
    minDesktop: 'min-width: 1441px',
  },
  paddings: {
    normal: {
      mobile: '1.3rem',
      tablet: '1.1rem',
      laptop: '0.8rem',
    },
    compact: {
      mobile: '1rem',
      tablet: '0.8rem',
      laptop: '0.5rem',
    },
  },
  backdropBlur: '1.3rem',
  zIndex: {
    behind: -100,
    background: 0,
    raised: 100,
    fixed: 200,
    backdrop: 300,
    modal: 400,
  },
};

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

const themes = {
  light: {
    mode: 'light' as const,
    ...commonTheme,
    colors: {
      backgroundMain: lightPallete.primary,
      textOnBackground: lightPallete.secondary,
      textSecondaryOnBackground: lighten(0.1, lightPallete.secondary),
      backgroundRaised: lightPallete.primary,
      callToAction: lightPallete.accent,
      textOnCallToAction: lightPallete.primary,
      callToActionText: lightPallete.accent,
      error: lightPallete.error,
      disabled: lighten(0.6, lightPallete.secondary),
      ordinals: lightPallete.ordinals,
    },
    shadows: {
      none: '0 0 1rem 0 rgba(0, 0, 0, 0)',
      soft: `0 0 1rem 0 ${transparentize(0.9, lightPallete.secondary)}`,
    },
  },
  dark: {
    mode: 'dark' as const,
    ...commonTheme,
    colors: {
      backgroundMain: darkPallete.primary,
      textOnBackground: darkPallete.secondary,
      textSecondaryOnBackground: darken(0.1, darkPallete.secondary),
      backgroundRaised: lighten(0.04, darkPallete.primary),
      callToAction: darkPallete.accent,
      textOnCallToAction: darkPallete.secondary,
      callToActionText: lighten(0.07, darkPallete.accent),
      error: darkPallete.error,
      disabled: lighten(0.6, darkPallete.secondary),
      ordinals: darkPallete.ordinals,
    },
    shadows: {
      none: '0 0 1rem 0 rgba(0, 0, 0, 0)',
      soft: '0 0 1rem 0 rgba(0, 0, 0, 0.1)',
    },
  },
};

export const getTheme = (theme: 'dark' | 'light') => themes[theme];

export const useTheme = () => {
  const theme = useStyledTheme();
  return theme;
};
