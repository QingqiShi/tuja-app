import styled from 'styled-components';
import { transparentize } from 'polished';
import { theme, getTheme } from './theme';

export const Card = styled.div`
  border-radius: ${theme.spacings('xs')};
  background-color: ${theme.colors.backgroundRaised};
  box-shadow: ${theme.shadows.soft};
`;

export const OverlayCard = styled(Card)`
  background-color: ${getTheme(theme.colors.backgroundRaised, (c) =>
    transparentize(0.1, c)
  )};

  @supports (backdrop-filter: blur(${theme.backdropBlur})) {
    backdrop-filter: blur(${theme.backdropBlur});
    background-color: ${getTheme(theme.colors.backgroundRaised, (c) =>
      transparentize(0.3, c)
    )};
  }
`;
