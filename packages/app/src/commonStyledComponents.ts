import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import { theme, getTheme } from 'theme';

export const Center = styled.div`
  min-height: 100%;
  display: flex;
  place-items: center;
  place-content: center;
  flex-direction: column;
  text-align: center;
`;

export const FullHeight = styled.div`
  height: 100vh;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: ${theme.colors.backgroundRaised};
  box-shadow: 0 0 0 1px
    ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
  border-radius: ${theme.spacings('xs')};
  padding: ${theme.spacings('s')};
  @media (${theme.breakpoints.minTablet}) {
    padding: ${theme.spacings('m')} ${theme.spacings('s')};
  }
  @media (${theme.breakpoints.minLaptop}) {
    padding: ${theme.spacings('m')};
  }
`;

export const CardMedia = styled.div`
  flex-grow: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  margin: -${theme.spacings('s')};

  @media (${theme.breakpoints.minTablet}) {
    margin: -${theme.spacings('m')} -${theme.spacings('s')};
  }
  @media (${theme.breakpoints.minLaptop}) {
    margin: -${theme.spacings('m')};
  }

  &:not(:first-child) {
    margin-top: 0;
  }

  &:not(:last-child) {
    margin-bottom: 0;
  }
`;

export const TitleRow = styled.div`
  > button {
    display: block;
    margin-bottom: 2em;
    width: 100%;
  }

  > h3:first-child {
    margin: 1.5rem 0;
    line-height: 3rem;

    > button {
      margin-left: 1rem;
    }
  }

  @media (${theme.breakpoints.minLaptop}) {
    display: flex;
    align-items: center;

    > h3:first-child {
      flex-grow: 1;
    }

    > button {
      width: auto;
      margin-bottom: 0;
    }
  }
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  justify-content: space-between;
  position: sticky;
  background-color: ${theme.colors.backgroundRaised};
  bottom: -${theme.spacings('s')};
  padding: ${theme.spacings('s')};
  margin: 0 -${theme.spacings('s')};
  @media (${theme.breakpoints.minTablet}) {
    bottom: -${theme.spacings('m')};
    margin: 0 -${theme.spacings('s')};
  }
  @media (${theme.breakpoints.minLaptop}) {
    bottom: -${theme.spacings('m')};
    margin: 0 -${theme.spacings('m')};
  }
`;

export const Field = styled.div`
  margin-top: calc(1.08rem + ${({ theme }) => theme.spacings.xs});
`;

export const Label = styled.label`
  font-size: ${theme.fonts.labelSize};
  line-height: ${theme.fonts.labelHeight};
  font-weight: ${theme.fonts.labelWeight};
  margin-bottom: ${theme.spacings('xs')};
  display: block;
  text-align: left;
`;
