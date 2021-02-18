import styled, { css } from 'styled-components';
import { getContrast, transparentize, lighten } from 'polished';
import { shadow, ctaFont } from '../../mixins';

const getContrastColor = (bg: string, colors: string[]) => {
  let maxContrast: number = 0;
  let contrastColor: string = '';
  colors.forEach((color) => {
    const contrast = getContrast(bg, color);
    if (contrast > maxContrast) {
      maxContrast = contrast;
      contrastColor = color;
    }
  });
  return contrastColor;
};

const ButtonBase = styled.button<{ bgColor?: string }>`
  ${shadow}
  ${ctaFont}
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ bgColor, theme }) =>
    bgColor ?? theme.colors.backgroundRaised};
  border: 1px solid
    ${({ bgColor, theme }) => bgColor ?? theme.colors.backgroundRaised};
  color: ${({ bgColor, theme }) =>
    getContrastColor(bgColor ?? theme.colors.backgroundRaised, [
      theme.colors.textOnBackground,
      theme.colors.backgroundRaised,
    ])};
  border-radius: ${({ theme }) => theme.spacings.xs};
  padding: 0 ${({ theme }) => theme.spacings.l} 0 0;
  min-width: 15rem;
  overflow: hidden;
  outline: none;
  cursor: pointer;

  height: 3.9rem;
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    height: 3.5rem;
  }
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    height: 2.8rem;
  }

  &:hover {
    background-color: ${({ bgColor, theme }) =>
      transparentize(0.1, bgColor ?? theme.colors.backgroundRaised)};
  }

  &:focus {
    box-shadow: 0 0 0.2rem 0
      ${({ bgColor, theme }) =>
        lighten(0.15, bgColor ?? theme.colors.backgroundRaised)};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    background-color: ${({ bgColor, theme }) =>
      transparentize(0.95, bgColor ?? theme.colors.backgroundRaised)};
    border: 1px solid
      ${({ bgColor, theme }) =>
        transparentize(0.9, bgColor ?? theme.colors.backgroundRaised)};
    box-shadow: none;
    pointer-events: none;
  }
`;

const IconContainer = styled.span<{ bgColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3.9rem;
  width: 3.9rem;
  margin-right: ${({ theme }) => theme.spacings.s};

  ${({ bgColor }) =>
    bgColor &&
    css`
      border-radius: ${({ theme }) => theme.spacings.xs} 0 0
        ${({ theme }) => theme.spacings.xs};
      background-color: ${bgColor};

      button:hover & {
        background-color: ${transparentize(0.1, bgColor)};
      }
    `}

  padding: 1.2rem;
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    padding: 1rem;
    height: 3.5rem;
    width: 3.5rem;
  }
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    padding: 0.8rem;
    height: 2.8rem;
    width: 2.8rem;
  }
`;

const LongText = styled.span`
  display: none;
  @media (min-width: 23rem) {
    display: block;
  }
`;

const ShortText = styled.span`
  display: block;
  @media (min-width: 23rem) {
    display: none;
  }
`;

interface SignInButtonProps {
  icon: React.ReactNode;
  shortText?: string;
  bgColor?: string;
  iconBgColor?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
}

function SignInButton({
  children,
  shortText,
  icon,
  bgColor,
  iconBgColor,
  disabled,
  onClick,
}: React.PropsWithChildren<SignInButtonProps>) {
  return (
    <ButtonBase
      onClick={onClick}
      bgColor={bgColor}
      type="button"
      disabled={disabled}
    >
      <IconContainer bgColor={iconBgColor}>{icon}</IconContainer>
      <LongText>{children}</LongText>
      <ShortText>{shortText || children}</ShortText>
    </ButtonBase>
  );
}

export default SignInButton;
