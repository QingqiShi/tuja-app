import { useTheme as useStyledTheme } from 'styled-components';
import { lighten, darken, transparentize } from 'polished';

export const v = {
  // Colors
  backgroundMain: 'var(--background-main, #211a1d)',
  backgroundRaised: 'var(--background-raised, #272023)',
  backgroundOverlay: 'var(--background-overlay, #2a2728)',
  backgroundHover: 'var(--background-hover, rgba(255, 255, 255, 0.1))',
  textMain: 'var(--text-main, #ffffff)',
  textSecondary: 'var(--text-secondary, #9e9e9e)',
  textOnAccent: 'var(--text-on-accent, #ffffff)',
  textGain: 'var(--text-gain, #49c569)',
  textLoss: 'var(--text-loss, #f74b3c)',
  textNoChange: 'var(--text-no-change, #775d68)',
  accentMain: 'var(--accent-main, #774afb)',
  accentHover: 'var(--accent-hover, #aa8dff)',
  ordinal1: 'var(--ordinal-1, #5b6a87)',
  ordinal2: 'var(--ordinal-2, #d6a59c)',
  ordinal3: 'var(--ordinal-3, #a3b4d4)',
  ordinal4: 'var(--ordinal-4, #bfd48e)',
  ordinal5: 'var(--ordinal-5, #7c8761)',

  // Fonts
  fontFamily: "'Inter', sans-serif",
  fontRegular: 400,
  fontSemiBold: 600,
  fontBold: 700,
  fontExtraBold: 800,

  // Breakpoints
  minTablet: 'min-width: 706px',
  minLaptop: 'min-width: 1024px',
  minDesktop: 'min-width: 1440px',

  // Z-index
  zBackground: 0,
  zRaised: 100,
  zFixed: 200,
  zBackdrop: 300,
  zModal: 400,

  // Spacings
  spacerXS: '0.5rem',
  spacerS: '1rem',
  spacerM: '2rem',
  spacerL: '3rem',
  spacerXL: '5rem',
  spacerXXL: '8rem',

  // Shadows
  shadowPressed:
    'var(--shadow-pressed, 0 0.1rem 0.5rem rgba(0, 0, 0, 0.15), 0 0.2rem 0.2rem rgba(0, 0, 0, 0.2))',
  shadowRaised:
    'var(--shadow-raised, 0 0.5rem 0.75rem rgba(0, 0, 0, 0.15), 0 0.375rem 0.5rem rgba(0, 0, 0, 0.2))',
  shadowOverlay:
    'var(--shadow-overlay, 0 1rem 1.22rem rgba(0, 0, 0, 0.15), 0 0.55rem 0.61rem rgba(0, 0, 0, 0.2))',

  // Border-radius
  radiusCard: '1rem',
  radiusMedia: '0.5rem',

  // Lengths
  maxLayoutWidth: 'var(--max-layout-width, 100%)',
  upDownPadding: 'var(--up-down-padding, 1rem)',
  leftRightPadding: 'var(--left-right-padding, 0.5rem)',
};

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
      size: '0.9rem',
      height: '1.2em',
      weight: 600,
      spacing: '0.028em',
    },
    input: {
      size: '1rem',
      height: '1.2em',
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
      mobile: '1.3rem 1.5rem',
      tablet: '1.1rem 1.3rem',
      laptop: '0.8rem 1.1rem',
    },
    compact: {
      mobile: '1rem 1.2rem',
      tablet: '0.8rem 1rem',
      laptop: '0.5rem 0.8rem',
    },
  },
  leftRight: {
    normal: {
      mobile: '1.5rem',
      tablet: '1.3rem',
      laptop: '1.1rem',
    },
    compact: {
      mobile: '1.2rem',
      tablet: '1rem',
      laptop: '0.8rem',
    },
  },
  topBottom: {
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
  error: '#fb2125',
  ordinals: ['#556480', '#CF9F97', '#9DAECC', '#B8CC89', '#75805C'],
  gain: '#30c048',
  loss: '#fb2125',
};

const darkPallete = {
  primary: '#211A1D',
  secondary: '#FFFFFF',
  accent: '#774AFB',
  error: '#F74B3C',
  ordinals: ['#5B6A87', '#D6A59C', '#A3B4D4', '#BFD48E', '#7C8761'],
  gain: '#49c569',
  loss: '#F74B3C',
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
      textOnError: lightPallete.primary,
      disabled: darken(0.3, lightPallete.primary),
      ordinals: lightPallete.ordinals,
      gain: lightPallete.gain,
      loss: lightPallete.loss,
      textOnGainLoss: lightPallete.primary,
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
      textOnError: darkPallete.primary,
      disabled: lighten(0.3, darkPallete.primary),
      ordinals: darkPallete.ordinals,
      gain: darkPallete.gain,
      loss: darkPallete.loss,
      textOnGainLoss: darkPallete.primary,
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
