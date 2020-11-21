import styled from 'styled-components';
import { transparentize } from 'polished';
import { theme, getTheme } from './theme';

export const Shadow = styled.div`
  box-shadow: ${theme.shadows.soft};
`;

export const Card = styled(Shadow)`
  border-radius: ${theme.spacings('xs')};
  background-color: ${theme.colors.backgroundRaised};
`;

export const TranslucentSurface = styled(Shadow)`
  background-color: ${getTheme(theme.colors.backgroundRaised, (c) =>
    transparentize(0.1, c)
  )};

  @supports (backdrop-filter: saturate(180%) blur(${theme.backdropBlur})) {
    backdrop-filter: saturate(180%) blur(${theme.backdropBlur});
    background-color: ${getTheme(theme.colors.backgroundRaised, (c) =>
      transparentize(0.2, c)
    )};
  }
`;
