import { css } from 'styled-components';
import { transparentize } from 'polished';

export const paddings = css<{ compact?: boolean }>`
  ${({ compact }) =>
    compact
      ? css`
          padding: ${({ theme }) => theme.paddings.compact.mobile};
          @media (${({ theme }) => theme.breakpoints.minTablet}) {
            padding: ${({ theme }) => theme.paddings.compact.tablet};
          }
          @media (${({ theme }) => theme.breakpoints.minLaptop}) {
            padding: ${({ theme }) => theme.paddings.compact.laptop};
          }
        `
      : css`
          padding: ${({ theme }) => theme.paddings.normal.mobile};
          @media (${({ theme }) => theme.breakpoints.minTablet}) {
            padding: ${({ theme }) => theme.paddings.normal.tablet};
          }
          @media (${({ theme }) => theme.breakpoints.minLaptop}) {
            padding: ${({ theme }) => theme.paddings.normal.laptop};
          }
        `}
`;

export const shadow = css`
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

export const card = css`
  ${shadow}
  border-radius: ${({ theme }) => theme.spacings.xs};
  background-color: ${({ theme }) => theme.colors.backgroundRaised};
`;

export const translucent = css`
  background-color: ${({ theme }) =>
    transparentize(0.1, theme.colors.backgroundRaised)};

  @supports (
    backdrop-filter: saturate(180%) blur(${({ theme }) => theme.backdropBlur})
  ) {
    backdrop-filter: saturate(180%) blur(${({ theme }) => theme.backdropBlur});
    background-color: ${({ theme }) =>
      transparentize(0.2, theme.colors.backgroundRaised)};
  }
`;
